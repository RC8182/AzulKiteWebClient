import { updateProduct, getProduct } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const updateProductTool: AgentTool = {
    definition: {
        name: 'update_product',
        description: 'Actualizar campos de un producto (Categoría, Variantes, Descripciones, etc). IMPORTANTE: price y stock ahora están en variants[0].',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'El ID del producto.' },
                updates: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        categories: { type: 'array', items: { type: 'string' }, description: 'Lista de IDs de categorías.' },
                        description: { type: 'string' },
                        description_en: { type: 'string' },
                        description_it: { type: 'string' },
                        size: { type: 'string', description: 'Tamaño del producto (ej: "9m", "135x41")' },
                        year: { type: 'number', description: 'Año del producto' },
                        material: { type: 'string', description: 'Material (Carbon, Ripstop, etc.)' },
                        condition: { type: 'string', enum: ['new', 'used', 'demo', 'refurbished'], description: 'Condición del producto' },
                        technicalDetails: { type: 'object', description: 'Detalles técnicos específicos como JSON' },
                        variantUpdates: {
                            type: 'object',
                            description: 'Actualizaciones para la variante por defecto (variants[0])',
                            properties: {
                                price: { type: 'number' },
                                stock: { type: 'number' },
                                sku: { type: 'string' },
                                name: { type: 'string' }
                            }
                        }
                    }
                }
            },
            required: ['id', 'updates']
        }
    },
    execute: async (args) => {
        const { id, updates } = args;

        // 1. Obtener producto actual para no perder datos al actualizar colecciones
        // Necesitamos todas las traducciones, pero getProduct solo devuelve una.
        // Como estamos en un entorno donde podemos importar prisma, podríamos usarlo,
        // pero mejor seguir usando las acciones si es posible.
        // Dado que el Agente suele recibir ES/EN/IT, podemos intentar reconstruir.

        const existingProduct = await getProduct(id, 'es'); // Default ES

        const prismaUpdateData: any = {
            id,
            brand: updates.brand,
            year: updates.year,
            condition: updates.condition,
            size: updates.size,
            material: updates.material,
            technicalDetails: updates.technicalDetails,
            categories: updates.categories,
        };

        // Manejar traducciones
        if (updates.description || updates.description_en || updates.description_it || updates.name) {
            const translations = [];

            // Reconstruir traducciones existentes o nuevas
            const locales = ['es', 'en', 'it'];
            for (const locale of locales) {
                let name = updates.name;
                let description = locale === 'es' ? updates.description :
                    locale === 'en' ? updates.description_en :
                        updates.description_it;

                // Si no se proporciona en el update, intentar mantener la existente
                if (!name || !description) {
                    const current = await getProduct(id, locale);
                    if (!name) name = current.attributes?.name || current.name;
                    if (!description) description = current.attributes?.description || current.description;
                }

                if (name) {
                    translations.push({
                        locale,
                        name,
                        description,
                        shortDescription: description?.substring(0, 197) + '...'
                    });
                }
            }
            prismaUpdateData.translations = translations;
        }

        // Manejar variantes
        if (updates.variantUpdates) {
            // Actualmente el agente suele actualizar la principal
            // Buscamos las variantes actuales
            const current = await getProduct(id, 'es');
            const currentVariants = current.variants || [];

            const updatedVariants = currentVariants.map((v: any, index: number) => {
                if (index === 0) { // Actualizar la primera por defecto
                    return {
                        ...v,
                        name: updates.variantUpdates.name || v.name,
                        price: updates.variantUpdates.price !== undefined ? updates.variantUpdates.price : v.price,
                        stock: updates.variantUpdates.stock !== undefined ? updates.variantUpdates.stock : v.stock,
                        sku: updates.variantUpdates.sku || v.sku,
                    };
                }
                return v;
            });

            // Si no había variantes, crear una
            if (updatedVariants.length === 0) {
                updatedVariants.push({
                    name: updates.variantUpdates.name || 'Default',
                    price: updates.variantUpdates.price || 0,
                    stock: updates.variantUpdates.stock || 0,
                    sku: updates.variantUpdates.sku || `SKU-${Date.now()}`,
                });
            }

            prismaUpdateData.variants = updatedVariants.map((v: any) => ({
                name: v.name,
                price: v.price,
                stock: v.stock,
                sku: v.sku,
                attributes: v.attributes
            }));
        }

        return await updateProduct(id, prismaUpdateData);
    }
};
