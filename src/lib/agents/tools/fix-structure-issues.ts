import { getProductsWithStructureIssues, fixProductStructure } from '@/actions/product-actions-prisma';
import { AgentTool } from '../types';

export const fixStructureIssuesTool: AgentTool = {
    definition: {
        name: 'fix_structure_issues',
        description: 'Detectar y corregir problemas de estructura en productos (sin variants, variants sin SKU, price/stock en root).',
        parameters: {
            type: 'object',
            properties: {
                fixMode: {
                    type: 'string',
                    enum: ['detect_only', 'auto_fix', 'manual_review'],
                    default: 'detect_only',
                    description: 'Modo de operación: detectar, corregir automáticamente, o revisar manualmente.'
                },
                issueTypes: {
                    type: 'array',
                    items: { type: 'string', enum: ['missing_variants', 'missing_sku', 'legacy_structure', 'all'] },
                    default: ['all'],
                    description: 'Tipos de problemas a detectar/corregir.'
                },
                locale: { type: 'string', default: 'es', description: 'Idioma de los productos.' }
            },
            required: []
        }
    },
    execute: async (args) => {
        const { fixMode = 'detect_only', issueTypes = ['all'], locale = 'es' } = args;
        
        // 1. Detectar productos con problemas
        const productsWithIssues = await getProductsWithStructureIssues(locale);
        
        if (productsWithIssues.length === 0) {
            return {
                success: true,
                message: 'No se encontraron productos con problemas de estructura.',
                fixedCount: 0,
                remainingIssues: 0
            };
        }
        
        // 2. Filtrar por tipos de problemas si no es 'all'
        let filteredProducts = productsWithIssues;
        if (!issueTypes.includes('all')) {
            filteredProducts = productsWithIssues.filter((p: any) => {
                const productIssues = p.issues || [];
                return productIssues.some((issue: string) => issueTypes.includes(issue));
            });
        }
        
        if (filteredProducts.length === 0) {
            return {
                success: true,
                message: `No se encontraron productos con los tipos de problemas especificados: ${issueTypes.join(', ')}`,
                detectedCount: productsWithIssues.length,
                filteredCount: 0,
                fixedCount: 0
            };
        }
        
        // 3. Según el modo de operación
        if (fixMode === 'detect_only') {
            return {
                success: true,
                message: `Detectados ${filteredProducts.length} productos con problemas de estructura.`,
                products: filteredProducts.map((p: any) => ({
                    id: p.documentId || p.id,
                    name: p.name,
                    issues: p.issues || [],
                    hasVariants: !!p.variants?.length,
                    variantCount: p.variants?.length || 0,
                    hasLegacyStructure: p.price !== undefined || p.stock !== undefined
                })),
                detectedCount: filteredProducts.length,
                suggestedAction: 'Usa fixMode: "auto_fix" para corregir automáticamente o "manual_review" para revisar antes de corregir.'
            };
        }
        
        if (fixMode === 'manual_review') {
            // Preparar datos para revisión manual
            const reviewData = filteredProducts.map((p: any) => {
                const fixes = [];
                
                if (p.issues?.includes('missing_variants')) {
                    fixes.push({
                        type: 'missing_variants',
                        action: 'Crear variant por defecto con SKU automático',
                        details: 'Se creará un variant con stock=0, price=0 y SKU generado automáticamente'
                    });
                }
                
                if (p.issues?.includes('missing_sku')) {
                    const variantsWithoutSku = p.variants?.filter((v: any) => !v.sku) || [];
                    fixes.push({
                        type: 'missing_sku',
                        action: 'Generar SKU para variants sin SKU',
                        details: `${variantsWithoutSku.length} variants necesitan SKU`,
                        variants: variantsWithoutSku.map((v: any, i: number) => ({
                            index: i,
                            currentData: { price: v.price, stock: v.stock }
                        }))
                    });
                }
                
                if (p.issues?.includes('legacy_structure')) {
                    fixes.push({
                        type: 'legacy_structure',
                        action: 'Migrar price/stock de root a variants[0]',
                        details: `price: ${p.price}, stock: ${p.stock} → variants[0]`
                    });
                }
                
                return {
                    id: p.documentId || p.id,
                    name: p.name,
                    issues: p.issues || [],
                    fixes,
                    totalFixes: fixes.length
                };
            });
            
            return {
                success: true,
                message: `Listo para revisión manual de ${filteredProducts.length} productos.`,
                products: reviewData,
                totalFixes: reviewData.reduce((sum: number, p: any) => sum + p.totalFixes, 0),
                nextStep: 'Usa fixMode: "auto_fix" para aplicar estas correcciones.'
            };
        }
        
        // 4. Modo auto_fix: corregir automáticamente
        if (fixMode === 'auto_fix') {
            const results = [];
            let successCount = 0;
            let errorCount = 0;
            
            for (const product of filteredProducts) {
                try {
                    const result = await fixProductStructure(product.documentId || product.id);
                    results.push({
                        id: product.documentId || product.id,
                        name: product.name,
                        success: result.success,
                        message: result.message,
                        issuesFixed: product.issues || []
                    });
                    
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error: any) {
                    results.push({
                        id: product.documentId || product.id,
                        name: product.name,
                        success: false,
                        message: `Error: ${error.message}`,
                        issuesFixed: []
                    });
                    errorCount++;
                }
            }
            
            return {
                success: successCount > 0,
                message: `Corregidos ${successCount} de ${filteredProducts.length} productos. ${errorCount > 0 ? `${errorCount} errores.` : ''}`,
                results,
                summary: {
                    total: filteredProducts.length,
                    success: successCount,
                    errors: errorCount,
                    successRate: Math.round((successCount / filteredProducts.length) * 100)
                }
            };
        }
        
        return {
            success: false,
            message: `Modo no reconocido: ${fixMode}`
        };
    }
};