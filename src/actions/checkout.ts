'use server';

import { prisma } from '@/lib/prisma';
import { generatePaymentData } from '@/lib/addon-payments';

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
    products: {
        id: string; // Product ID
        quantity: number;
        price: number; // Unit price from Cart (Trusting client for now, TODO: Verify with DB Variants)
        name: string;
        image?: string;
        color?: string | null;
        size?: string | null;
    }[];
}) {
    try {
        // Calculate total
        const total = data.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Generate a short readable Order Number (random 6 chars for now)
        const orderNumber = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                id: crypto.randomUUID(),
                orderNumber,
                customerEmail: data.customer_email,
                total,
                status: 'PENDING',
                paymentProvider: 'addon',
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

        // Generate Addon Payments Data
        const paymentData = generatePaymentData({
            amount: Math.round(total * 100).toString(), // Convert to cents
            orderId: orderNumber, // Addon expects alphanumeric (check lengths, usually 4-12 chars)
            urlOK: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?order=${orderNumber}`,
            urlKO: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?error=payment_failed`,
        });

        return { success: true, paymentData };

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return { error: error.message };
    }
}
