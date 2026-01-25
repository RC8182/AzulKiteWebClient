import { bulkUpdateProducts } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const bulkUpdateProductsTool: AgentTool = {
    definition: {
        name: 'bulk_update_products',
        description: 'Actualizar múltiples productos a la vez con los mismos cambios.',
        parameters: {
            type: 'object',
            properties: {
                ids: { type: 'array', items: { type: 'string' }, description: 'Lista de documentIds.' },
                updates: { type: 'object', description: 'Campos a actualizar.' }
            },
            required: ['ids', 'updates']
        }
    },
    execute: async (args) => {
        return await bulkUpdateProducts(args.ids, args.updates);
    }
};
