'use server';

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Subir archivos al sistema local y crear registros Media
 */
export async function uploadFiles(formData: FormData) {
    try {
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return { success: true, data: [] };
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Asegurar que el directorio existe
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Ignorar si ya existe
        }

        const savedMedia = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = join(uploadDir, uniqueName);
            const url = `/uploads/${uniqueName}`;

            // Guardar archivo
            await writeFile(filePath, buffer);

            // Crear registro en DB
            const media = await prisma.media.create({
                data: {
                    name: file.name,
                    url: url,
                    mimeType: file.type,
                    size: file.size
                }
            });

            savedMedia.push(media);
        }

        return { success: true, data: savedMedia };
    } catch (error: any) {
        console.error('Error uploading files:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Eliminar archivo y registro Media
 */
export async function deleteMedia(id: string) {
    try {
        const media = await prisma.media.findUnique({
            where: { id }
        });

        if (!media) throw new Error('Media not found');

        // Intentar borrar archivo físico (si es local)
        if (media.url.startsWith('/uploads/')) {
            const filePath = join(process.cwd(), 'public', media.url);
            try {
                const { unlink } = require('node:fs/promises');
                await unlink(filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        await prisma.media.delete({
            where: { id }
        });

        revalidatePath('/[lang]/dashboard/media');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting media:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener lista de medios con filtros
 */
export async function getMediaList(filters?: { search?: string; limit?: number; offset?: number }) {
    try {
        const { search, limit = 50, offset = 0 } = filters || {};

        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { altText: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.media.count({ where })
        ]);

        return { success: true, data: media, total };
    } catch (error: any) {
        console.error('Error fetching media:', error);
        return { success: false, error: error.message, data: [], total: 0 };
    }
}

/**
 * Actualizar metadata de un medio
 */
export async function updateMedia(id: string, data: { altText?: string; name?: string }) {
    try {
        const media = await prisma.media.update({
            where: { id },
            data: {
                altText: data.altText,
                name: data.name
            }
        });

        revalidatePath('/[lang]/dashboard/media');
        return { success: true, data: media };
    } catch (error: any) {
        console.error('Error updating media:', error);
        return { success: false, error: error.message };
    }
}

