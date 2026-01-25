import { createProduct } from '@/actions/product-actions-prisma';
import { AgentTool, AgentContext } from '../types';
import { createDefaultVariant, extractSpecsFromName, generateSKU } from '@/lib/utils/product-utils';

export const createProductTool: AgentTool = {
    definition: {
        name: 'create_product',
        description: 'Crear un nuevo producto en el catálogo (nueva estructura con variants).',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                // Parámetros antiguos (compatibilidad hacia atrás)
                price: { type: 'number', description: 'Precio (se convertirá a variant)' },
                stock: { type: 'number', description: 'Stock (se convertirá a variant)', default: 1 },
                // Nueva estructura con variants
                variants: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            price: { type: 'number' },
                            stock: { type: 'number', default: 1 },
                            color: { type: 'string', default: 'Default' },
                            size: { type: 'string' },
                            sku: { type: 'string' }
                        },
                        required: ['price']
                    },
                    description: 'Array de variants (si no se proporciona, se crea una default)'
                },
                // Campos comunes
                description: { type: 'string' },
                description_en: { type: 'string' },
                description_it: { type: 'string' },
                categories: { type: 'array', items: { type: 'string' } },
                brand: { type: 'string' },
                productNumber: { type: 'string' },
                // Nuevos campos técnicos
                size: { type: 'string' },
                year: { type: 'integer' },
                material: { type: 'string' },
                condition: {
                    type: 'string',
                    enum: ['new', 'used', 'demo', 'refurbished'],
                    default: 'new'
                },
                technicalDetails: { type: 'object' }
            },
            required: ['name'] // Ya no requiere price/stock
        }
    },
    execute: async (args, context?: AgentContext) => {
        // Extraer especificaciones técnicas del nombre si es posible
        const extractedSpecs = extractSpecsFromName(args.name);

        // Preparar variants
        let variants = args.variants;

        // Compatibilidad hacia atrás: si vienen price/stock como parámetros viejos, convertirlos a variant
        if (!variants && (args.price !== undefined || args.stock !== undefined)) {
            variants = [createDefaultVariant({
                price: args.price || 0,
                stock: args.stock || 1,
                size: args.size || extractedSpecs?.size || 'Standard',
                productName: args.name
            })];
        }

        // Si todavía no hay variants, crear una default
        if (!variants || variants.length === 0) {
            variants = [createDefaultVariant({
                price: 0,
                stock: 1,
                size: args.size || extractedSpecs?.size || 'Standard',
                productName: args.name
            })];
        }

        // Asegurar que todas las variants tienen SKU y nombre
        variants = variants.map((v: any, index: number) => ({
            name: v.name || v.color || 'Default',
            sku: v.sku || generateSKU(args.name),
            price: v.price,
            stock: v.stock,
            attributes: {
                color: v.color || 'Default',
                size: v.size || args.size || extractedSpecs?.size || 'Standard'
            }
        }));

        // Generar slug
        const slug = args.name.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Preparar traducciones
        const translations = [
            {
                locale: 'es',
                name: args.name,
                description: args.description,
                shortDescription: args.description?.substring(0, 197) + '...'
            }
        ];

        if (args.description_en) {
            translations.push({
                locale: 'en',
                name: args.name, // El nombre suele ser el mismo o se puede traducir luego
                description: args.description_en,
                shortDescription: args.description_en.substring(0, 197) + '...'
            });
        }

        if (args.description_it) {
            translations.push({
                locale: 'it',
                name: args.name,
                description: args.description_it,
                shortDescription: args.description_it.substring(0, 197) + '...'
            });
        }

        // Construir objeto de datos para Prisma
        const productData: any = {
            slug,
            productNumber: args.productNumber,
            brand: args.brand || extractedSpecs?.brand,
            year: args.year || extractedSpecs?.year,
            condition: args.condition || extractedSpecs?.condition || 'new',
            size: args.size || extractedSpecs?.size,
            material: args.material || extractedSpecs?.material,
            technicalDetails: {
                ...(extractedSpecs?.technicalDetails || {}),
                ...(args.technicalDetails || {})
            },
            categories: args.categories || [],
            translations,
            variants
        };

        return await createProduct(productData);
    }
};
