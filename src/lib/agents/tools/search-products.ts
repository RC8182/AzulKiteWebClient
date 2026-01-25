import { searchProducts } from '@/actions/product-actions-prisma';
import { AgentTool, AgentContext } from '../types';

export const searchProductsTool: AgentTool = {
    definition: {
        name: 'search_products',
        description: 'Buscar productos por texto (nombre, descripción, marca). Usa "page" para ver más resultados si hay muchos.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Término de búsqueda.' },
                limit: { type: 'number', default: 10 },
                page: { type: 'number', default: 1, description: 'Número de página.' }
            },
            required: ['query']
        }
    },
    execute: async (args, context?: AgentContext) => {
        return await searchProducts(args.query, context?.language || 'es', args.limit, args.page);
    }
};
