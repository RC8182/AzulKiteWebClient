import { indexProductManuals } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const analyzeManualTool: AgentTool = {
    definition: {
        name: 'analyze_manual',
        description: 'Indiza el manual de un producto para extraer especificaciones detalladas.',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'documentId del producto.' }
            },
            required: ['id']
        }
    },
    execute: async (args) => {
        return await indexProductManuals(args.id);
    }
};
