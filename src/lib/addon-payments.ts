import crypto from 'crypto';

interface AddonConfig {
    merchantId: string;
    terminalId: string; // Addon Payments uses Terminal ID
    account: string;    // Sometimes used instead of Terminal ID
    sharedSecret: string;
    currency: string;
    url: string;
}

const config: AddonConfig = {
    merchantId: process.env.ADDON_MERCHANT_ID || '',
    terminalId: process.env.ADDON_TERMINAL_ID || '00000001', // Default terminal
    account: process.env.ADDON_ACCOUNT || 'internet',
    sharedSecret: process.env.ADDON_SHARED_SECRET || '',
    currency: 'EUR', // Updated to 'EUR' (Alpha-3) as required by Gateway
    // Standard HPP Redirect Endpoint (Direct POST)
    // Sandbox: https://hpp.sandbox.addonpayments.com/pay
    // Live: https://hpp.addonpayments.com/pay
    url: process.env.ADDON_HPP_URL || (process.env.NODE_ENV === 'production'
        ? 'https://hpp.addonpayments.com/pay'
        : 'https://hpp.sandbox.addonpayments.com/pay'),
};

export interface PaymentParams {
    amount: string; // Float format (e.g. "10.00")
    orderId: string;
    urlOK: string;
    urlKO: string;
    customerEmail: string;
    billingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    customerPhone?: string;
    customerName?: string;
}

/**
 * Generates payment data using Addon Payments (Standard HPP Redirect)
 */
export function generatePaymentData(params: PaymentParams) {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);

    // Amount must be in the smallest currency unit (cents) for Addon Payments
    // e.g. "864.00" -> "86400"
    const amountInCents = Math.round(parseFloat(params.amount) * 100).toString();

    // Build the string to hash:
    // TIMESTAMP.MERCHANT_ID.ORDER_ID.AMOUNT.CURRENCY
    const stringToHash = `${timestamp}.${config.merchantId}.${params.orderId}.${amountInCents}.${config.currency}`;

    // SHA256 Nested Hash
    const sha256_hash1 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const finalSha256Hash = crypto.createHash('sha256').update(`${sha256_hash1}.${config.sharedSecret}`).digest('hex');

    // SHA1 Nested Hash (for backward compatibility if needed)
    const sha1_hash1 = crypto.createHash('sha1').update(stringToHash).digest('hex');
    const finalSha1Hash = crypto.createHash('sha1').update(`${sha1_hash1}.${config.sharedSecret}`).digest('hex');

    const fields = {
        MERCHANT_ID: config.merchantId,
        ACCOUNT: config.account,
        ORDER_ID: params.orderId,
        AMOUNT: amountInCents,
        CURRENCY: config.currency,
        TIMESTAMP: timestamp,
        SHA256HASH: finalSha256Hash,
        SHA1HASH: finalSha1Hash,
        AUTO_SETTLE_FLAG: '1',
        HPP_VERSION: '2',
        HPP_LANG: 'ES',
        MERCHANT_RESPONSE_URL: params.urlOK, // Redirect back to this URL
        HPP_CUSTOMER_EMAIL: params.customerEmail,
        HPP_CUSTOMER_PHONENUMBER_MOBILE: params.customerPhone || '',
        HPP_BILLING_STREET1: sanitizeField(params.billingAddress.street),
        HPP_BILLING_CITY: sanitizeField(params.billingAddress.city),
        HPP_BILLING_POSTALCODE: params.billingAddress.postalCode,
        // Error 508 fix: Addon Payments often requires ISO 3166-1 numeric (724) or Alpha-2 (ES). 
        // We use '724' for Spain as it passed validation previously for Billing.
        HPP_BILLING_COUNTRY: params.billingAddress.country === 'ES' || params.billingAddress.country === 'ESP' ? '724' : params.billingAddress.country,

        // --- PAYPAL / SHIPPING FIELDS (Seller Protection) ---
        SHIPPING_ADDRESS_ENABLE: '1',
        ADDRESS_OVERRIDE: '1',
        // Map Shipping Address (Reusing Billing Address as we only collect one)
        HPP_NAME: sanitizeField(params.customerName || 'Customer'),
        HPP_STREET: sanitizeField(params.billingAddress.street) || 'Street', // Fallback to avoid empty
        HPP_CITY: sanitizeField(params.billingAddress.city) || 'City',
        HPP_ZIP: params.billingAddress.postalCode,
        HPP_STATE: sanitizeField(params.billingAddress.city), // Default State to City if unknown
        // HPP_COUNTRY for Shipping is documented as Alpha-2 (A-Z, 2 chars)
        HPP_COUNTRY: params.billingAddress.country === 'ES' || params.billingAddress.country === '724' ? 'ES' : params.billingAddress.country.substring(0, 2).toUpperCase(),
        HPP_PHONE: params.customerPhone || '',

        COMMENT1: `Pedido ${params.orderId}`,
        COMMENT2: 'Azul Kite - Next.js App',
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('[Addon Payments] Redirect Integration Debug:', {
            url: config.url,
            hash: finalSha256Hash,
            fields
        });
    }

    return {
        url: config.url,
        fields
    };
}

/**
 * Sanitizes fields to ensure they contain only allowed characters for Addon Payments.
 * Allowed: a-z A-Z 0-9 ' " , + . _ - & / @ ! ? % ( ) * : £ $ & € # [ ] | =
 * Removes characters like 'º' which cause Error 508.
 */
function sanitizeField(value: string): string {
    if (!value) return '';
    // Remove 'º', 'ª' and other common non-standard chars, replace with simple equivalents or strip
    return value
        .replace(/[ºª]/g, '')
        .replace(/[^a-zA-Z0-9'" ,+\._\-&/@!?%\(\)*:£\$&€#\[\]\|=]/g, ' ') // Keep only allowed chars
        .trim();
}

/**
 * Verifies the signature of a response from Addon Payments
 */
export function verifyAddonSignature(fields: Record<string, string>): boolean {
    const {
        TIMESTAMP,
        MERCHANT_ID,
        ORDER_ID,
        RESULT,
        MESSAGE,
        PASREF,
        AUTHCODE,
        SHA1HASH,
        SHA256HASH
    } = fields;

    // Sequence for verification hash:
    // TIMESTAMP.MERCHANT_ID.ORDER_ID.RESULT.MESSAGE.PASREF.AUTHCODE
    const stringToHash = `${TIMESTAMP}.${MERCHANT_ID}.${ORDER_ID}.${RESULT}.${MESSAGE}.${PASREF}.${AUTHCODE}`;

    if (SHA256HASH) {
        const hash1 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const calculatedHash = crypto.createHash('sha256').update(`${hash1}.${config.sharedSecret}`).digest('hex');
        return calculatedHash === SHA256HASH;
    }

    if (SHA1HASH) {
        const hash1 = crypto.createHash('sha1').update(stringToHash).digest('hex');
        const calculatedHash = crypto.createHash('sha1').update(`${hash1}.${config.sharedSecret}`).digest('hex');
        return calculatedHash === SHA1HASH;
    }

    return false;
}
