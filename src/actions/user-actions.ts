'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
        include: { user: true },
    });
}

export async function updateUserProfile(data: {
    weight?: number;
    height?: number;
    age?: number;
    skillLevel?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const profile = await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            ...data,
        },
        update: data,
    });

    revalidatePath('/[lang]/account');
    return profile;
}

export async function getUserOrders() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
            items: true,
            address: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function toggleFavorite(productId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const existing = await prisma.favorite.findUnique({
        where: {
            userId_productId: {
                userId: session.user.id,
                productId,
            },
        },
    });

    if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        revalidatePath('/[lang]/account/favorites');
        return { favorited: false };
    } else {
        await prisma.favorite.create({
            data: {
                userId: session.user.id,
                productId,
            },
        });
        revalidatePath('/[lang]/account/favorites');
        return { favorited: true };
    }
}

export async function getUserFavorites() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
            product: {
                include: {
                    translations: { where: { locale: 'es' } }, // TODO: Handle locale dynamically
                    images: { take: 1 },
                    variants: true,
                },
            },
        },
    });
}
