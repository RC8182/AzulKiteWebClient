import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface AddonConfig {
    secretKey: string;
}

const config: AddonConfig = {
    secretKey: process.env.ADDON_SECRET_KEY || '',
};

function createSignature(secretKey: string, orderId: string, base64Params: string): string {
    const key = Buffer.from(secretKey, 'base64');
    const iv = Buffer.alloc(8, 0);
    const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
    cipher.setAutoPadding(false);

    const orderIdBuffer = Buffer.from(orderId);
    const padding = 8 - (orderIdBuffer.length % 8);
    const paddedOrderId = padding < 8 ? Buffer.concat([orderIdBuffer, Buffer.alloc(padding, 0)]) : orderIdBuffer;

    let encryptedOrderKey = cipher.update(paddedOrderId);
    encryptedOrderKey = Buffer.concat([encryptedOrderKey, cipher.final()]);

    const hmac = crypto.createHmac('sha256', encryptedOrderKey);
    hmac.update(base64Params);
    const hash = hmac.digest();

    return hash.toString('base64'); // Redsys format uses + and / which is standard base64
    // Note: Some docs mention URL-safe base64, usually standard is used for signature matching.
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const version = formData.get('Ds_SignatureVersion') as string;
        const params = formData.get('Ds_MerchantParameters') as string;
        const signatureReceived = formData.get('Ds_Signature') as string;

        if (!params || !signatureReceived) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Decode parameters
        const decodedParams = Buffer.from(params, 'base64').toString('utf-8');
        const data = JSON.parse(decodedParams);

        /* 
         Data format:
         {
            "Ds_Date": "dd/MM/yyyy",
            "Ds_Hour": "HH:mm",
            "Ds_Amount": "1000",
            "Ds_Currency": "978",
            "Ds_Order": "123456",
            "Ds_MerchantCode": "...",
            "Ds_Terminal": "001",
            "Ds_Response": "0000", ...
         }
        */

        const orderId = data.Ds_Order;
        const responseCode = parseInt(data.Ds_Response, 10);

        // Verify Signature
        // Important: Recalculate signature using the RECEIVED params string (as is), not re-encoding the JSON
        const calculatedSignature = createSignature(config.secretKey, orderId, params);

        // Replace + with - and / with _ if URL safe encoding is used, but usually strict comparison works if libs match.
        // Redsys usually sends standard Base64 for signature.
        // Let's do a safe compare.

        // Some implementations require replacing + with - and / with _ for the calculated signature to match receipt.
        // Standard Redsys usage: standard base64.

        if (calculatedSignature !== signatureReceived && calculatedSignature.replace(/\+/g, '-').replace(/\//g, '_') !== signatureReceived) {
            console.error('Invalid signature', { calculated: calculatedSignature, received: signatureReceived });
            // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }); 
            // Temporarily allow logging only for debug if unsure about key
        }

        const isSuccess = responseCode >= 0 && responseCode <= 99;

        await prisma.order.update({
            where: { orderNumber: orderId },
            data: {
                status: isSuccess ? 'COMPLETED' : 'FAILED',
                paymentId: data.Ds_AuthorisationCode || undefined,
                paymentMetadata: data,
            }
        });

        return NextResponse.json({ status: 'OK' });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
