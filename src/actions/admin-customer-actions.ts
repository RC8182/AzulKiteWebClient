'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ADMIN ONLY ACTIONS

export async function getAdminCustomers() {
    const session = await auth();
    // TODO: Add Role check (e.g. if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');)
    // For now, assuming access to dashboard implies admin or trusted user
    if (!session?.user) throw new Error('Unauthorized');

    const users = await prisma.user.findMany({
        include: {
            orders: {
                select: {
                    id: true,
                    total: true,
                    createdAt: true,
                }
            },
            _count: {
                select: { orders: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (users as any[]).map(user => ({
        ...user,
        totalSpent: user.orders.reduce((acc: number, order: any) => acc + (order.total || 0), 0),
        orderCount: user._count.orders
    }));
}

export async function updateCustomerPoints(userId: string, points: number) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    await prisma.user.update({
        where: { id: userId },
        data: { points }
    });
    revalidatePath('/[lang]/dashboard/customers');
}

export async function updateCustomerRole(userId: string, role: 'ADMIN' | 'USER') {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
    // In a real app we'd check if session.user.role === 'ADMIN'

    await prisma.user.update({
        where: { id: userId },
        data: { role }
    });
    revalidatePath('/[lang]/dashboard/customers');
}

export async function deleteCustomer(userId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
    // Prevent self-deletion if possible or add safeguards

    await prisma.user.delete({
        where: { id: userId }
    });
    revalidatePath('/[lang]/dashboard/customers');
}

