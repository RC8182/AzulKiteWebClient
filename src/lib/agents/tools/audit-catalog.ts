import { getAuditProducts } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const auditCatalogTool: AgentTool = {
    definition: {
        name: 'audit_catalog',
        description: 'Encontrar productos con problemas específicos (falta descripción, stock bajo, sin categoría, sin imágenes). IMPORTANTE: stock bajo ahora se calcula sumando stock de variants.',
        parameters: {
            type: 'object',
            properties: {
                issueType: {
                    type: 'string',
                    enum: ['missing_description', 'uncategorized', 'low_stock', 'missing_images', 'structure_issues'],
                    description: 'El tipo de problema a auditar.'
                },
                locale: { type: 'string', default: 'es', description: 'Idioma en el que buscar (ej: es, en, it).' }
            },
            required: ['issueType']
        }
    },
    execute: async (args) => {
        const results = await getAuditProducts(args.issueType, args.locale);
        
        // Para stock bajo, mostrar stock total de variants
        const products = results.map((p: any) => {
            let currentValue = 'N/A';
            
            if (args.issueType === 'low_stock') {
                const totalStock = p.variants?.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0) || 0;
                currentValue = `${totalStock} (suma de ${p.variants?.length || 0} variants)`;
            } else if (args.issueType === 'missing_description') {
                currentValue = `${p.description?.length || 0} chars`;
            } else if (args.issueType === 'structure_issues') {
                const issues = [];
                if (!p.variants || p.variants.length === 0) issues.push('sin variants');
                if (p.variants?.some((v: any) => !v.sku)) issues.push('variants sin sku');
                currentValue = issues.join(', ');
            }
            
            return {
                id: p.documentId || p.id,
                name: p.name,
                currentValue
            };
        });

        return {
            issue: args.issueType,
            count: results.length,
            products,
            message: `Encontrados ${results.length} productos con el problema: ${args.issueType}`
        };
    }
};
