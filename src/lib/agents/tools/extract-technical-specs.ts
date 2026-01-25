import { updateProductTechnicalSpecs } from '@/actions/product-actions-prisma';
import { extractSpecsFromName } from '@/lib/utils/product-utils';
import { AgentTool } from '../types';

export const extractTechnicalSpecsTool: AgentTool = {
    definition: {
        name: 'extract_technical_specs',
        description: 'Extraer atributos técnicos de nombres de productos y actualizar los campos técnicos (size, year, material, condition, technicalDetails).',
        parameters: {
            type: 'object',
            properties: {
                productId: {
                    type: 'string',
                    description: 'ID del producto a analizar. Si no se proporciona, se analizarán todos los productos.'
                },
                mode: {
                    type: 'string',
                    enum: ['analyze_only', 'auto_update', 'suggest_updates'],
                    default: 'analyze_only',
                    description: 'Modo de operación: solo analizar, actualizar automáticamente, o sugerir actualizaciones.'
                },
                locale: { type: 'string', default: 'es', description: 'Idioma del producto.' }
            },
            required: []
        }
    },
    execute: async (args) => {
        const { productId, mode = 'analyze_only', locale = 'es' } = args;
        
        // Si se proporciona productId, analizar solo ese producto
        if (productId) {
            try {
                // En un entorno real, obtendríamos el producto de la API
                // Por ahora simulamos la extracción
                const productName = `Producto ${productId}`; // Esto sería obtenido de la API
                const extractedSpecs = extractSpecsFromName(productName);
                
                if (mode === 'analyze_only') {
                    return {
                        success: true,
                        productId,
                        productName,
                        extractedSpecs,
                        message: 'Especificaciones técnicas extraídas del nombre del producto.',
                        nextStep: 'Usa mode: "suggest_updates" para ver qué campos se actualizarían o "auto_update" para aplicar los cambios.'
                    };
                }
                
                if (mode === 'suggest_updates') {
                    return {
                        success: true,
                        productId,
                        productName,
                        extractedSpecs,
                        suggestedUpdates: {
                            size: extractedSpecs.size,
                            year: extractedSpecs.year,
                            material: extractedSpecs.material,
                            condition: extractedSpecs.condition,
                            technicalDetails: extractedSpecs.technicalDetails
                        },
                        message: 'Sugerencias de actualización basadas en el análisis del nombre.',
                        nextStep: 'Usa mode: "auto_update" para aplicar estos cambios.'
                    };
                }
                
                if (mode === 'auto_update') {
                    // Actualizar el producto con las especificaciones extraídas
                    const result = await updateProductTechnicalSpecs(productId, extractedSpecs);
                    
                    return {
                        success: result.success,
                        productId,
                        productName,
                        extractedSpecs,
                        updateResult: result,
                        message: result.success 
                            ? 'Especificaciones técnicas actualizadas correctamente.' 
                            : 'Error al actualizar especificaciones técnicas.'
                    };
                }
                
                return {
                    success: false,
                    message: `Modo no reconocido: ${mode}`
                };
                
            } catch (error: any) {
                return {
                    success: false,
                    productId,
                    message: `Error al procesar el producto: ${error.message}`
                };
            }
        }
        
        // Si no se proporciona productId, analizar todos los productos
        // En un entorno real, obtendríamos todos los productos de la API
        // Por ahora devolvemos un mensaje informativo
        return {
            success: true,
            message: 'Para analizar todos los productos, se requiere implementar la obtención de la lista completa.',
            suggestion: 'Proporciona un productId específico o implementa la función para obtener todos los productos.',
            exampleUsage: [
                {
                    productId: 'abc123',
                    mode: 'analyze_only',
                    description: 'Analizar un producto específico'
                },
                {
                    productId: 'def456',
                    mode: 'suggest_updates',
                    description: 'Ver sugerencias de actualización'
                },
                {
                    productId: 'ghi789',
                    mode: 'auto_update',
                    description: 'Aplicar actualizaciones automáticamente'
                }
            ]
        };
    }
};

// Ejemplos de nombres de productos y lo que se extraería:
/*
Ejemplos:
1. "Duotone Dice SLS 2024 9m" → { size: "9m", year: 2024, material: "SLS", brand: "Duotone", model: "Dice" }
2. "North Orbit 2023 Carbon 12m" → { size: "12m", year: 2023, material: "Carbon", brand: "North", model: "Orbit" }
3. "Cabrinha Switchblade 2022 7m Used" → { size: "7m", year: 2022, brand: "Cabrinha", model: "Switchblade", condition: "used" }
4. "Slingshot RPM 135x41 2021" → { size: "135x41", year: 2021, brand: "Slingshot", model: "RPM" }
5. "F-One Bandit S 2020 Demo 10m" → { size: "10m", year: 2020, brand: "F-One", model: "Bandit S", condition: "demo" }
*/
