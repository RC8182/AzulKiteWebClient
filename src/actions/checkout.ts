'use server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function createCheckoutSession(data: {
    customer_email: string;
    products: { id: string | number; quantity: number }[];
}) {
    try {
        const response = await fetch(`${STRAPI_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { id } = await response.json();
        return { sessionId: id };
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return { error: error.message };
    }
}
