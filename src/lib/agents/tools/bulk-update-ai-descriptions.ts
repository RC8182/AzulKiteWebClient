import { bulkUpdateAIDescriptions } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const bulkUpdateAIDescriptionsTool: AgentTool = {
    definition: {
        name: 'bulk_update_ai_descriptions',
        description: 'Actualizar masivamente descripciones de IA para múltiples productos a la vez.',
        parameters: {
            type: 'object',
            properties: {
                updates: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'documentId del producto.' },
                            language: { type: 'string', enum: ['es', 'en', 'it'] },
                            data: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    shortDescription: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        },
                        required: ['id', 'language', 'data']
                    }
                }
            },
            required: ['updates']
        }
    },
    execute: async (args) => {
        return await bulkUpdateAIDescriptions(args.updates);
    }
};
