'use server';

import { prisma } from '@/lib/prisma';
import { generatePaymentData } from '@/lib/addon-payments';
import { auth } from '@/lib/auth';

export async function createCheckoutSession(data: {
    customer_email: string;
    shipping_address: {
        firstName: string;
        lastName: string;
        addressLine1: string;
        city: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    payment_method?: 'bank' | 'paypal' | 'card';
    products: {
        id: string; // Product ID
        quantity: number;
        price: number; // Unit price from Cart
        name: string;
        image?: string;
        color?: string | null;
        size?: string | null;
    }[];
}) {
    try {
        const session = await auth();
        const shippingCost = 14;
        const subtotal = data.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const total = subtotal + shippingCost;

        const orderNumber = Math.random().toString(36).substring(2, 8).toUpperCase();
        const customerEmail = data.customer_email;
        const paymentMethod = data.payment_method || 'card';

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                id: crypto.randomUUID(),
                orderNumber,
                customerEmail,
                userId: session?.user?.id,
                total,
                status: 'PENDING',
                paymentProvider: paymentMethod === 'card' ? 'addon' : paymentMethod,
                items: {
                    create: data.products.map(item => ({
                        productId: item.id !== 'undefined' ? String(item.id) : undefined,
                        productName: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity,
                        image: item.image,
                        attributes: {
                            color: item.color,
                            size: item.size
                        }
                    }))
                },
                address: {
                    create: {
                        firstName: data.shipping_address.firstName,
                        lastName: data.shipping_address.lastName,
                        addressLine1: data.shipping_address.addressLine1,
                        city: data.shipping_address.city,
                        postalCode: data.shipping_address.postalCode,
                        country: data.shipping_address.country,
                        phone: data.shipping_address.phone,
                    }
                }
            }
        });

        if (paymentMethod === 'card') {
            const paymentData = generatePaymentData({
                amount: total.toFixed(2),
                orderId: orderNumber,
                urlOK: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?order=${orderNumber}`,
                urlKO: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?error=payment_failed`,
                customerEmail,
                billingAddress: {
                    street: data.shipping_address.addressLine1,
                    city: data.shipping_address.city,
                    postalCode: data.shipping_address.postalCode,
                    country: data.shipping_address.country,
                },
                customerPhone: data.shipping_address.phone,
                customerName: `${data.shipping_address.firstName} ${data.shipping_address.lastName}`,
            });

            return { success: true, paymentData, orderNumber };
        }

        return { success: true, orderNumber };

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return { error: error.message };
    }
}
