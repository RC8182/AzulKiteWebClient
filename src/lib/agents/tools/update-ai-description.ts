import { updateAIDescription } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const updateAIDescriptionTool: AgentTool = {
    definition: {
        name: 'update_ai_description',
        description: 'Actualizar campos localizados de un producto (nombre, descripción, etc) en un idioma específico.',
        parameters: {
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
                    },
                    description: 'Objeto con los campos a traducir/actualizar para ese idioma.'
                }
            },
            required: ['id', 'language', 'data']
        }
    },
    execute: async (args) => {
        return await updateAIDescription(args.id, args.language as any, args.data);
    }
};
