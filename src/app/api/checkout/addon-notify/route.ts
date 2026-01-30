import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAddonSignature } from '@/lib/addon-payments';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        const orderId = data.ORDER_ID;
        const result = data.RESULT;

        // Verify Signature
        const isSignatureValid = verifyAddonSignature(data);

        if (!isSignatureValid) {
            console.error('Invalid signature from Addon Payments', { received: data.SHA1HASH });
            // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const isSuccess = result === '00';

        if (isSuccess) {
            // Fetch order with items to update stock
            const order = await prisma.order.findUnique({
                where: { orderNumber: orderId },
                include: { items: true }
            });

            if (order && order.status !== 'COMPLETED') {
                for (const item of order.items) {
                    if (item.productId) {
                        try {
                            const variants = await prisma.variant.findMany({
                                where: { productId: item.productId }
                            });

                            const matchingVariant = variants.find(v => {
                                const vAttrs = v.attributes as any;
                                const iAttrs = item.attributes as any;
                                if (!vAttrs && !iAttrs) return true;
                                if (!vAttrs || !iAttrs) return false;
                                return vAttrs.color === iAttrs.color && vAttrs.size === iAttrs.size;
                            });

                            if (matchingVariant) {
                                await prisma.variant.update({
                                    where: { id: matchingVariant.id },
                                    data: {
                                        stock: {
                                            decrement: item.quantity
                                        }
                                    }
                                });
                            }
                        } catch (stockError) {
                            console.error('Failed to update stock for item:', item.id, stockError);
                        }
                    }
                }
            }
        }

        await prisma.order.update({
            where: { orderNumber: orderId },
            data: {
                status: isSuccess ? 'COMPLETED' : 'FAILED',
                paymentId: data.PASREF || undefined,
                paymentMetadata: data,
            }
        });

        return NextResponse.json({ status: 'OK' });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
