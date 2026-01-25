import { getProducts } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const listProductsTool: AgentTool = {
    definition: {
        name: 'list_products',
        description: 'Listar productos con filtros opcionales y paginación. Usa "page" para navegar entre páginas.',
        parameters: {
            type: 'object',
            properties: {
                onlyUncategorized: { type: 'boolean', description: 'Si es true, solo devuelve productos sin categoría definida.' },
                page: { type: 'number', default: 1, description: 'Número de página (empieza en 1)' },
                pageSize: { type: 'number', default: 10, description: 'Cantidad de productos por página (máximo 25)' }
            }
        }
    },
    execute: async (args) => {
        const page = args.page || 1;
        const pageSize = Math.min(args.pageSize || 10, 25);
        const result = await getProducts(page, pageSize, args.onlyUncategorized ? { categories: { none: {} } } : undefined);
        return {
            data: result.data,
            pagination: result.meta?.pagination,
            message: `Página ${page} de productos (${pageSize} por página)`
        };
    }
};
