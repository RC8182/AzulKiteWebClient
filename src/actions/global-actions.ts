'use server';

import { prisma } from '@/lib/prisma';

export async function getGlobalData(locale: string = 'es') {
    try {
        const globalConfig = await prisma.globalConfig.findFirst({
            include: {
                translations: {
                    where: { locale },
                    select: {
                        siteName: true,
                        footerText: true,
                        metaTitle: true,
                        metaDescription: true,
                    }
                }
            }
        });

        if (!globalConfig) return null;

        const translation = globalConfig.translations[0];

        // Normalizamos los datos para que el frontend reciba lo que espera
        return {
            siteName: translation?.siteName || 'Azul Kiteboarding',
            footerText: translation?.footerText || 'La mejor tienda y escuela de kitesurf.',
            ...translation,
            // Soporte para campos de Strapi si se requieren
            attributes: {
                siteName: translation?.siteName,
                footerText: translation?.footerText,
                ...translation
            }
        };
    } catch (error) {
        console.error('Error fetching global data from Prisma:', error);
        return null;
    }
}
