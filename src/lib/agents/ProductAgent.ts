import { BaseAgent } from './BaseAgent';
import { AgentContext, AgentResponse, AgentRole } from './types';
import { getProducts, getProduct, bulkUpdateProducts, getUncategorizedProducts } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';

export class ProductAgent extends BaseAgent {
    public readonly role: AgentRole = 'product_agent';

    private activeContext?: AgentContext;

    constructor() {
        super(`Eres el Agente Autónomo de Gestión de Catálogo de Azul Kiteboarding.
Tu misión es mantener el inventario perfecto, categorizado y con descripciones de alta calidad en 3 idiomas (ES, EN, IT).

AUTONOMÍA TOTAL:
1. Tienes herramientas para LISTAR, VER y MODIFICAR productos. Úsalas proactivamente.
2. Si el usuario te pide "organizar el catálogo", primero lista los productos sin categoría y luego aplícales las categorías correctas usando bulk_update.
3. Si un producto no tiene descripción, gérala basándote en su nombre y marca, siempre en los 3 idiomas.
4. Mantén el stock bajo control. Si ves stock bajo, avisa al usuario o ayúdale a actualizarlo.

GESTIÓN DE CONTEXTO (IMPORTANTE):
- Los resultados de herramientas están TRUNCADOS para evitar sobrecarga.
- Si ves "_truncated: true", significa que hay MÁS datos disponibles.
- Para ver más datos, usa el parámetro "page" (página 1, 2, 3...) en list_products.
- Trabaja en LOTES PEQUEÑOS (máximo 10 productos a la vez).
- Si hay 50 productos sin categoría, NO intentes categorizarlos todos de golpe.
- Procesa en grupos de 5-10, informa al usuario del progreso, y continúa si te lo pide.
- NUNCA uses parámetros "offset" - usa "page" y "pageSize" para paginación.

REGLAS DE TRADUCCIÓN:
- Español (ES): Natural, profesional, enfocado a Kite/Wing.
- Inglés (EN): Global, técnico.
- Italiano (IT): Elegante, preciso.

NUNCA inventes precios o especificaciones técnicas críticas sin base. Consulta si tienes dudas.`);

        this.setupTools();
    }

    private setupTools() {
        this.tools = {
            list_categories: {
                definition: {
                    name: 'list_categories',
                    description: 'Obtener la lista real de categorías del sistema (nombre e ID).',
                    parameters: { type: 'object', properties: {} }
                },
                execute: async () => {
                    const cats = await getCategories();
                    return cats.map((c: any) => ({ id: c.id, documentId: c.documentId, name: c.name }));
                }
            },
            list_products: {
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
                    if (args.onlyUncategorized) {
                        // For uncategorized, we return all at once (no pagination in this function)
                        const allUncategorized = await getUncategorizedProducts();
                        return {
                            data: allUncategorized,
                            total: allUncategorized.length,
                            message: `Mostrando todos los ${allUncategorized.length} productos sin categorizar`
                        };
                    }
                    const page = args.page || 1;
                    const pageSize = Math.min(args.pageSize || 10, 25);
                    const result = await getProducts(page, pageSize);
                    return {
                        data: result.data,
                        pagination: result.meta?.pagination,
                        message: `Página ${page} de productos (${pageSize} por página)`
                    };
                }
            },
            get_product_details: {
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
            },
            update_product: {
                definition: {
                    name: 'update_product',
                    description: 'Actualizar campos de un producto (Categoría, Stock, Descripciones, etc).',
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'El documentId del producto.' },
                            updates: {
                                type: 'object',
                                properties: {
                                    categories: { type: 'array', items: { type: 'string' }, description: 'Lista de IDs (documentId) de categorías.' },
                                    description: { type: 'string' },
                                    description_en: { type: 'string' },
                                    description_it: { type: 'string' },
                                    price: { type: 'number' },
                                    stock: { type: 'number' }
                                }
                            }
                        },
                        required: ['id', 'updates']
                    }
                },
                execute: async (args) => {
                    return await bulkUpdateProducts([args.id], args.updates);
                }
            },
            bulk_update_products: {
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
            }
        };
    }

    public async processMessage(message: string, context: AgentContext): Promise<AgentResponse> {
        this.activeContext = context;
        this.addToHistory({ role: 'user', content: message, timestamp: Date.now() });

        const prompt = `Contexto actual:
Idioma: ${context.language}
Info Catálogo: ${JSON.stringify(context.catalogHealth || {})}

Mensaje del usuario: 
${message}

Analiza si necesitas usar alguna herramienta para cumplir el objetivo. Si te piden organizar, empieza listando. Si te dan info de un manual, genera las descripciones y actualiza el producto.`;

        try {
            const responseContent = await this.callLLM([
                { role: 'system', content: this.systemPrompt, timestamp: Date.now() },
                ...this.history,
                { role: 'user', content: prompt, timestamp: Date.now() }
            ]);

            this.addToHistory({ role: 'assistant', content: responseContent, timestamp: Date.now() });

            return {
                role: 'assistant',
                content: responseContent,
                timestamp: Date.now(),
                status: 'complete',
                suggestedActions: this.generateSuggestedActions(message, context)
            };
        } catch (error) {
            console.error('Error in ProductAgent:', error);
            return {
                role: 'assistant',
                content: `Lo siento, hubo un error procesando tu solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                timestamp: Date.now(),
                status: 'error'
            };
        }
    }

    private generateSuggestedActions(message: string, context: AgentContext) {
        const actions = [];
        const lower = message.toLowerCase();

        if (lower.includes('auditar') || lower.includes('organizar') || lower.includes('categorizar')) {
            actions.push({
                label: 'Listar productos sin categoría',
                action: 'list_uncategorized',
            });
        }

        return actions;
    }
}
