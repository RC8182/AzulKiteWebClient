'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// ========== TIPOS ==========

interface PageCreateData {
    slug: string;
    title: string;
    content?: string;
    published?: boolean;
    translations: {
        locale: string;
        title: string;
        content?: string;
    }[];
    blocks?: {
        type: string;
        order: number;
        config?: any;
        translations: {
            locale: string;
            content: any;
        }[];
    }[];
}

interface PageUpdateData extends Partial<PageCreateData> {
    id: string;
}

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Obtener todas las páginas
 */
export async function getPages(locale: string = 'es') {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                translations: {
                    where: { locale },
                    select: { title: true, content: true }
                }
            }
        });

        return pages.map(page => {
            const translation = page.translations[0] || {};
            return {
                ...page,
                title: translation.title || page.title,
                content: translation.content || page.content
            };
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
    }
}

/**
 * Obtener página por ID
 */
export async function getPage(id: string, locale: string = 'es') {
    try {
        const page = await prisma.page.findUnique({
            where: { id },
            include: {
                translations: {
                    where: { locale },
                    select: { title: true, content: true }
                }
            }
        });

        if (!page) throw new Error('Page not found');

        const translation = page.translations[0] || {};
        return {
            ...page,
            title: translation.title || page.title,
            content: translation.content || page.content
        };
    } catch (error) {
        console.error('Error fetching page:', error);
        throw error;
    }
}

/**
 * Obtener página por slug
 */
export async function getPageBySlug(slug: string, locale: string = 'es') {
    try {
        const page = await prisma.page.findUnique({
            where: { slug },
            include: {
                translations: {
                    where: { locale },
                    select: { title: true, content: true }
                },
                blocks: {
                    include: {
                        translations: {
                            where: { locale },
                            select: { content: true }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!page) return null;

        const translation = page.translations[0] || {};
        return {
            ...page,
            title: translation.title || page.title,
            content: translation.content || page.content,
            blocks: page.blocks.map(block => ({
                id: block.id,
                type: block.type,
                config: block.config,
                content: block.translations[0]?.content || {}
            }))
        };
    } catch (error) {
        console.error('Error fetching page by slug:', error);
        throw error;
    }
}

/**
 * Crear página
 */
export async function createPage(data: PageCreateData) {
    try {
        const { slug, title, content, published = true, translations } = data;

        // Verificar slug único
        const existing = await prisma.page.findUnique({ where: { slug } });
        if (existing) throw new Error('Page with this slug already exists');

        const page = await prisma.page.create({
            data: {
                slug,
                title,
                content,
                published,
                translations: {
                    create: translations.map(t => ({
                        locale: t.locale,
                        title: t.title,
                        content: t.content
                    }))
                },
                blocks: {
                    create: (data.blocks || []).map((b, index) => ({
                        type: b.type,
                        order: index,
                        config: b.config,
                        translations: {
                            create: b.translations.map(bt => ({
                                locale: bt.locale,
                                content: bt.content
                            }))
                        }
                    }))
                }
            }
        });

        revalidatePath('/[lang]/dashboard/pages', 'page');
        return { success: true, data: page };
    } catch (error: any) {
        console.error('Error creating page:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualizar página
 */
export async function updatePage(id: string, data: PageUpdateData) {
    try {
        const { slug, title, content, published, translations, blocks } = data;

        // Verificar existencia
        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) throw new Error('Page not found');

        // Verificar slug único si cambia
        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.page.findUnique({ where: { slug } });
            if (slugExists) throw new Error('Page with this slug already exists');
        }

        // Transaction to update page and blocks safely
        const page = await prisma.$transaction(async (tx) => {
            // 1. Update basic page data
            const updatedPage = await tx.page.update({
                where: { id },
                data: {
                    slug,
                    title,
                    content,
                    published,
                    translations: translations ? {
                        deleteMany: {},
                        create: translations.map(t => ({
                            locale: t.locale,
                            title: t.title,
                            content: t.content
                        }))
                    } : undefined
                }
            });

            // 2. Update blocks if provided
            if (blocks !== undefined) {
                // Delete existing blocks
                await tx.pageBlock.deleteMany({
                    where: { pageId: id }
                });

                // Re-create blocks
                if (blocks.length > 0) {
                    for (const [index, block] of blocks.entries()) {
                        await tx.pageBlock.create({
                            data: {
                                pageId: id,
                                type: block.type,
                                order: index,
                                config: block.config,
                                translations: {
                                    create: block.translations.map(bt => ({
                                        locale: bt.locale,
                                        content: bt.content
                                    }))
                                }
                            }
                        });
                    }
                }
            }

            return updatedPage;
        });

        revalidatePath('/[lang]/dashboard/pages', 'page');
        revalidatePath(`/[lang]/dashboard/pages/${id}`, 'page');
        return { success: true, data: page };
    } catch (error: any) {
        console.error('Error updating page:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Eliminar página
 */
export async function deletePage(id: string) {
    try {
        await prisma.page.delete({ where: { id } });
        revalidatePath('/[lang]/dashboard/pages', 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting page:', error);
        return { success: false, error: error.message };
    }
}
