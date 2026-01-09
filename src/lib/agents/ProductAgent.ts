import { BaseAgent } from './BaseAgent';
import { AgentContext, AgentResponse, AgentRole } from './types';
import { generateWithContext } from '../rag';
import { updateAIDescription } from '@/actions/product-actions';

export class ProductAgent extends BaseAgent {
    public readonly role: AgentRole = 'product_agent';

    private activeContext?: AgentContext;

    constructor() {
        super(`Eres el Agente de Productos de Azul Kiteboarding. 
Tu objetivo es ayudar a crear y optimizar productos en el eCommerce.
Puedes procesar manuales técnicos (PDF), datos de WordPress, JSON o texto libre.
REGLAS CRÍTICAS:
1. SIEMPRE crea el contenido en los 3 idiomas (español, inglés, italiano).
2. NUNCA inventes información técnica, precios o colores si no los tienes. Pregunta al usuario.
3. Si recibes una lista de productos (JSON/WordPress), usa la herramienta create_product para cada uno.
4. Identifica campos faltantes como: precio, categoría, colores, tallas, o descripción técnica.
5. Si recibes imágenes, menciónalas y confirma que las incluirás en la propuesta del producto.`);

        this.setupTools();
    }

    private setupTools() {
        this.tools = {
            list_categories: {
                definition: {
                    name: 'list_categories',
                    description: 'Obtener la lista de categorías permitidas para los productos.',
                    parameters: {
                        type: 'object',
                        properties: {}
                    }
                },
                execute: async () => {
                    return ["Kites", "Boards", "Harnesses", "Wetsuits", "Accessories"];
                }
            },
            create_product: {
                definition: {
                    name: 'create_product',
                    description: 'Crear un nuevo producto en el sistema.',
                    parameters: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Nombre del producto' },
                            price: { type: 'number', description: 'Precio en euros' },
                            category: { type: 'string', description: 'Categoría (obtener de list_categories)' },
                            stock: { type: 'number', description: 'Stock inicial' },
                            description_es: { type: 'string', description: 'Descripción en español' },
                            description_en: { type: 'string', description: 'Descripción en inglés' },
                            description_it: { type: 'string', description: 'Descripción en italiano' },
                            shortDescription: { type: 'string', description: 'Resumen corto (máx 200 caracteres)' },
                            brand: { type: 'string', description: 'Marca del producto' },
                            productNumber: { type: 'string', description: 'Código de producto o SKU' },
                            colors: { type: 'array', items: { type: 'string' } },
                            sizes: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['name', 'price', 'category']
                    }
                },
                execute: async (args) => {
                    try {
                        const { createProduct } = await import('@/actions/product-actions');
                        const formData = new FormData();

                        // Append standard fields
                        Object.entries(args).forEach(([key, value]) => {
                            if (Array.isArray(value)) {
                                formData.append(key, value.join(','));
                            } else {
                                formData.append(key, String(value));
                            }
                        });

                        // Attach files from context if they match
                        if (this.activeContext?.files) {
                            for (const file of this.activeContext.files) {
                                if (file.type.startsWith('image/')) {
                                    formData.append('newImages', file);
                                } else if (file.type === 'application/pdf') {
                                    formData.append('newManuals', file);
                                }
                            }
                        }

                        const result = await createProduct(formData);
                        return result;
                    } catch (error) {
                        return { success: false, error: String(error) };
                    }
                }
            }
        };
    }

    public async processMessage(message: string, context: AgentContext): Promise<AgentResponse> {
        this.activeContext = context;
        this.addToHistory({ role: 'user', content: message, timestamp: Date.now() });

        // Check if message contains JSON or PDF content
        const hasJson = message.includes('[Contenido del JSON:') || this.isLikelyJson(message);
        const hasPdf = message.includes('[Contenido del PDF:');

        const prompt = `Contexto actual:
Idioma: ${context.language}
Producto ID: ${context.currentProductId || 'Nuevo'}

Mensaje del usuario y contenido adjunto: 
${message}

${hasJson ? 'Analiza la información de los productos en formato JSON proporcionada. Si hay varios, prepáralos para su creación.' : ''}
${hasPdf ? 'Usa la información extraída del PDF para completar las especificaciones técnicas del producto.' : ''}

Responde de forma profesional. Si falta información crucial para crear el producto (precio, categoría, etc.), indícalo claramente.
Si tienes suficiente información, genera una propuesta de descripción en los 3 idiomas (ES, EN, IT).`;

        try {
            const responseContent = await this.callLLM([
                { role: 'system', content: this.systemPrompt, timestamp: Date.now() },
                ...this.history,
                { role: 'user', content: prompt, timestamp: Date.now() }
            ]);

            this.addToHistory({ role: 'assistant', content: responseContent, timestamp: Date.now() });

            // Analyze response for missing fields (simplified for now)
            const missingFields = this.detectMissingFields(message);

            return {
                content: responseContent,
                status: missingFields.length > 0 ? 'requires_info' : 'complete',
                missingFields: missingFields.length > 0 ? missingFields : undefined,
                suggestedActions: this.generateSuggestedActions(message, context)
            };
        } catch (error) {
            console.error('Error in ProductAgent:', error);
            return {
                content: `Lo siento, hubo un error procesando tu solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                status: 'error'
            };
        }
    }

    private isLikelyJson(text: string): boolean {
        const trimmed = text.trim();
        return (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));
    }

    private detectMissingFields(text: string): string[] {
        const missing = [];
        const lowerText = text.toLowerCase();

        if (!lowerText.includes('precio') && !lowerText.includes('$') && !lowerText.includes('€')) {
            // missing.push('precio'); // This is a bit too simple, LLM should handle complex detection
        }

        // Let the LLM handle detection in its response, 
        // but we can parse the response for specific markers if we want.
        return [];
    }

    private generateSuggestedActions(message: string, context: AgentContext) {
        const actions = [];

        if (context.currentProductId) {
            actions.push({
                label: 'Generar Descripción con RAG',
                action: 'generate_rag',
                payload: { productId: context.currentProductId }
            });
        }

        return actions;
    }
}
