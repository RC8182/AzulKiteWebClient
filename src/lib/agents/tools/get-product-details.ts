import { getProduct } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const getProductDetailsTool: AgentTool = {
    definition: {
        name: 'get_product_details',
        description: 'Obtener toda la información de un producto específico por su ID.',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'El ID o documentId del producto.' }
            },
            required: ['id']
        }
    },
    execute: async (args) => {
        return await getProduct(args.id);
    }
};
