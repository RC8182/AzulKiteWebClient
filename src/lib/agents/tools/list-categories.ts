import { getCategories } from '@/actions/category-actions-prisma';
import { AgentTool } from '../types';

export const listCategoriesTool: AgentTool = {
    definition: {
        name: 'list_categories',
        description: 'Obtener la lista real de categorías del sistema (nombre e ID).',
        parameters: { type: 'object', properties: {} }
    },
    execute: async () => {
        const cats = await getCategories();
        return cats.map((c: any) => ({ 
            id: c.id, 
            name: c.translations?.[0]?.name || c.slug,
            slug: c.slug 
        }));
    }
};
