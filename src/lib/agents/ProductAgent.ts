import { BaseAgent } from './BaseAgent';
import { AgentContext, AgentResponse, AgentRole } from './types';
import { productTools } from './tools';

export class ProductAgent extends BaseAgent {
    public readonly role: AgentRole = 'product_agent';


    constructor() {
        super(`Eres el Agente Autónomo de Gestión de Catálogo de Azul Kiteboarding.
Tu misión es mantener el inventario perfecto, categorizado y con descripciones de alta calidad en 3 idiomas (ES, EN, IT).

NUEVA ESTRUCTURA DE PRODUCTOS (IMPORTANTE - ACTUALIZACIÓN 2025):
1. Los productos NO tienen 'price' ni 'stock' en el nivel raíz.
2. Todos los productos deben tener al menos UNA 'variant' en el array 'variants'.
3. El precio y stock están en 'variants[0].price' y 'variants[0].stock'.
4. Nuevos campos técnicos: 'size', 'year', 'material', 'condition', 'technicalDetails'.
5. Las variants requieren 'sku' (código único por variante).
6. Para productos de kitesurf, extrae automáticamente: tamaño (9m, 135x41), año, material del nombre.

AUTONOMÍA TOTAL Y PROACTIVIDAD:
1. Tienes herramientas para LISTAR, AUDITAR (audit_catalog), VER, BUSCAR, CREAR y MODIFICAR productos.
2. Si detectas problemas en la "Salud del Catálogo" (missingDescriptions, uncategorized, etc.), usa 'audit_catalog' para identificar los productos específicos y arréglalos sin esperar instrucciones detalladas.
3. Para actualizaciones masivas de IA (traducciones, descripciones), usa SIEMPRE 'bulk_update_ai_descriptions' para ser más rápido y eficiente.
4. No te detengas para pedir permiso en cada paso si el objetivo está claro, pero informa al final de lo que has hecho.
5. Trabaja en lotes eficientes. Si hay muchos productos, procésalos en grupos de 10-20.

CREACIÓN DE PRODUCTOS (NUEVA ESTRUCTURA):
- Si el usuario da solo nombre y precio, crea una variant default automáticamente.
- Ejemplo: "Crea kite Eleveight 9m a 1200€" → variant con: sku auto-generado, color: 'Default', size: '9m', price: 1200.
- Extrae automáticamente atributos técnicos del nombre cuando sea posible.
- Genera SKU automático: "AZK-[AÑO]-[RANDOM]" si no se proporciona.

OPTIMIZACIÓN MÓVIL Y PRODUCTOS SIMPLES:
- El usuario te usará mucho desde MÓVIL para "Cargar productos simples".
- Si el usuario dice algo como "Crea [Nombre] a [Precio]", asume que es un producto simple.
- Crea AL MENOS UNA VARIANT con los datos proporcionados.
- Para productos de kitesurf, extrae automáticamente el 'size' del nombre si es posible (ej: "9m", "135x41").
- No preguntes por todos los detalles técnicos si el usuario no los da; usa tu conocimiento del dominio (Kite/Wing) para rellenar lo obvio o dejarlo para después.
- Sé extremadamente conciso en tus respuestas móviles.

GESTIÓN DE CONTEXTO:
- Los resultados de herramientas están TRUNCADOS. Si ves "_truncated: true", usa "page" o filtros más específicos.
- Usa 'audit_catalog' para encontrar rápidamente qué productos necesitan atención.
- Sé preciso con las categorías. Usa 'list_categories' para asegurarte de usar IDs válidos.

REGLAS DE TRADUCCIÓN:
- Español (ES): Natural, profesional, enfocado a Kite/Wing.
- Inglés (EN): Global, técnico.
- Italiano (IT): Elegante, preciso.

ESTILO DE COMUNICACIÓN (MUY IMPORTANTE):
- SÉ CONCISO. El usuario quiere resultados, no explicaciones largas ni confirmaciones redundantes.
- Si has modificado productos, usa SIEMPRE una lista corta:
  ✅ "Listo. Creado: Eleveight XS 9m (ID: abc123) - €1200 - Variant: Default/9m"
  ✅ "Actualizado: 3 productos con nueva estructura de variants"
  ✅ "Corregido: Producto 'Kite Slingshot' ahora tiene variant con SKU: AZK-2025-ABC123"
- NO justifiques tus acciones. Asume la orden como prioritaria.
- NO des resúmenes narrativos largos.

NUEVAS HERRAMIENTAS DISPONIBLES:
- 'fix_structure_issues': Corregir productos con estructura incorrecta.
- 'extract_technical_specs': Extraer atributos técnicos de nombres.
- 'migrate_variable_products': Migrar productos variables a variants.

NUNCA inventes precios o especificaciones técnicas críticas sin base. Consulta si tienes dudas.`);

        this.setupTools();
    }

    private setupTools() {
        this.tools = productTools;
    }


    public async processMessage(message: string, context: AgentContext): Promise<AgentResponse> {
        this.activeContext = context;
        this.addToHistory({ role: 'user', content: message, timestamp: Date.now() });

        const prompt = `Contexto actual:
Idioma: ${context.language}
Info Catálogo: ${JSON.stringify(context.catalogHealth || {})}

Mensaje del usuario: 
${message}

Analiza si necesitas usar alguna herramienta para cumplir el objetivo. 
- Si detectas problemas de Salud (ej: missingDescriptions > 0), usa 'audit_catalog' para ver cuáles son.
- Si vas a actualizar varios productos, usa las herramientas 'bulk'.
- Si te dan info de un manual, genera las descripciones y actualiza el producto.`;

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

            // Self-healing: If history is corrupted (orphaned tool messages), clear it and retry
            if (error instanceof Error && (
                error.message.includes("'tool'") ||
                error.message.includes("tool_calls") ||
                error.message.includes("preceding message")
            )) {
                console.warn('⚠️ Detected conversation history corruption. Clearing history and retrying...');
                this.clearHistory();
                // We need to avoid infinite recursion if the error persists even after clear
                // But since clearHistory() resets state, it should be safe to retry once.
                // To be safe, we can just return a helpful message asking user to try again, 
                // but auto-retry is better UX.
                try {
                    // Retry with clean history
                    const responseContent = await this.callLLM([
                        { role: 'system', content: this.systemPrompt, timestamp: Date.now() },
                        // History is empty now
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
                } catch (retryError) {
                    // If it fails again, return error
                    console.error('Retry failed:', retryError);
                }
            }

            return {
                role: 'assistant',
                content: `Lo siento, hubo un error técnico con mi memoria. He reiniciado mi contexto. Por favor, intenta pedirme lo mismo otra vez. (Error: ${error instanceof Error ? error.message : 'Desconocido'})`,
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

        // Nuevas acciones basadas en problemas de estructura
        if (lower.includes('estructura') || lower.includes('variants') || lower.includes('sku') || lower.includes('migrar')) {
            actions.push({
                label: 'Detectar problemas de estructura',
                action: 'audit_catalog',
                payload: { issueType: 'structure_issues' }
            });
            actions.push({
                label: 'Corregir problemas de estructura automáticamente',
                action: 'fix_structure_issues',
                payload: { fixMode: 'auto_fix' }
            });
        }

        // Acciones para especificaciones técnicas
        if (lower.includes('técnico') || lower.includes('especificación') || lower.includes('size') || lower.includes('material')) {
            actions.push({
                label: 'Extraer especificaciones técnicas de nombres',
                action: 'extract_technical_specs',
                payload: { mode: 'analyze_only' }
            });
        }

        // Acciones basadas en el estado del catálogo
        if (context.catalogHealth) {
            const { structureIssues, missingTechnicalSpecs, variantsWithoutSku } = context.catalogHealth;
            
            if (structureIssues && structureIssues > 0) {
                actions.push({
                    label: `Corregir ${structureIssues} problemas de estructura`,
                    action: 'fix_structure_issues',
                    payload: { fixMode: 'auto_fix' }
                });
            }
            
            if (variantsWithoutSku && variantsWithoutSku > 0) {
                actions.push({
                    label: `Generar SKU para ${variantsWithoutSku} variants`,
                    action: 'fix_structure_issues',
                    payload: { fixMode: 'auto_fix', issueTypes: ['missing_sku'] }
                });
            }
        }

        return actions;
    }
}
