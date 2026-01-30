import crypto from 'crypto';

interface AddonConfig {
    merchantCode: string;
    terminal: string;
    secretKey: string; // La clave SHA-256 proporcionada por el banco
    currency: string; // '978' para EUR
    url: string; // URL de notificación (webhook)
}

// Configuración por defecto o desde variables de entorno
const config: AddonConfig = {
    merchantCode: process.env.ADDON_MERCHANT_CODE || '',
    terminal: process.env.ADDON_TERMINAL || '001',
    secretKey: process.env.ADDON_SECRET_KEY || '',
    currency: process.env.ADDON_CURRENCY || '978', // EUR
    url: process.env.ADDON_NOTIFY_URL || '',
};

export interface PaymentParams {
    amount: string; // En céntimos (ej: 10.50 => "1050")
    orderId: string; // Máximo 12 caracteres, alfanumérico
    urlOK: string;
    urlKO: string;
}

export function generatePaymentData(params: PaymentParams) {
    const merchantParameters = {
        DS_MERCHANT_AMOUNT: params.amount,
        DS_MERCHANT_ORDER: params.orderId,
        DS_MERCHANT_MERCHANTCODE: config.merchantCode,
        DS_MERCHANT_CURRENCY: config.currency,
        DS_MERCHANT_TRANSACTIONTYPE: '0', // Autorización
        DS_MERCHANT_TERMINAL: config.terminal,
        DS_MERCHANT_MERCHANTURL: config.url,
        DS_MERCHANT_URLOK: params.urlOK,
        DS_MERCHANT_URLKO: params.urlKO,
    };

    // 1. Convertir objeto a JSON string
    const jsonParams = JSON.stringify(merchantParameters);

    // 2. Codificar en Base64
    const base64Params = Buffer.from(jsonParams).toString('base64');

    // 3. Generar Clave de Operación (3DES con la clave secreta y el número de pedido)
    const keyBuffer = Buffer.from(config.secretKey, 'base64');
    const iv = Buffer.alloc(8, 0); // IV de ceros para 3DES
    const cipher = crypto.createCipheriv('des-ede3-cbc', keyBuffer, iv);
    cipher.setAutoPadding(false); // Padding manual si fuera necesario, pero Redsys usa ZeroPadding implícito o específico

    // El OrderId debe ser múltiplo de 8 para 3DES. Si no, padding con \0
    // Redsys espera el OrderId tal cual para derivar la clave.
    // IMPORTANTE: La implementación oficial de Redsys en node suele usar librerías específicas.
    // Vamos a usar una implementación estándar de la firma HMAC-SHA256 V256

    const signature = createSignature(config.secretKey, params.orderId, base64Params);

    return {
        url: 'https://sis.redsys.es/sis/realizarPago', // URL Producción (verificar si es test o prod)
        // Para pruebas: 'https://sis-t.redsys.es:25443/sis/realizarPago'
        params: base64Params,
        signature: signature,
        version: 'HMAC_SHA256_V1',
    };
}

function createSignature(secretKey: string, orderId: string, base64Params: string): string {
    // 1. Decodificar la clave Base64
    const key = Buffer.from(secretKey, 'base64');

    // 2. Generar clave específica para la operación (3DES) usando el OrderId
    const iv = Buffer.alloc(8, 0);
    const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
    cipher.setAutoPadding(false); // Importante: Redsys usa ZeroPadding manual si es necesario

    // Padding del OrderId a múltiplo de 8 bytes con \0
    const orderIdBuffer = Buffer.from(orderId);
    const padding = 8 - (orderIdBuffer.length % 8);
    const paddedOrderId = padding < 8 ? Buffer.concat([orderIdBuffer, Buffer.alloc(padding, 0)]) : orderIdBuffer;

    let encryptedOrderKey = cipher.update(paddedOrderId);
    encryptedOrderKey = Buffer.concat([encryptedOrderKey, cipher.final()]);

    // 3. HMAC-SHA256 de los parámetros Base64 usando la clave encriptada
    const hmac = crypto.createHmac('sha256', encryptedOrderKey);
    hmac.update(base64Params);
    const hash = hmac.digest();

    // 4. Codificar resultado en Base64
    return hash.toString('base64');
}
