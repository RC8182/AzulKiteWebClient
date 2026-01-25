import { deleteProduct } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const deleteProductTool: AgentTool = {
    definition: {
        name: 'delete_product',
        description: 'Eliminar un producto por su ID.',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'documentId del producto.' }
            },
            required: ['id']
        }
    },
    execute: async (args) => {
        return await deleteProduct(args.id);
    }
};
