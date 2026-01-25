'use server';

import * as actions from './product-actions-prisma';

export async function getProducts(page?: number, pageSize?: number, filters?: any, locale?: string) {
    return actions.getProducts(page, pageSize, filters, locale);
}

export async function getProduct(id: string, locale?: string) {
    return actions.getProduct(id, locale);
}

export async function getProductBySlug(slug: string, locale?: string) {
    return actions.getProductBySlug(slug, locale);
}

export async function createProduct(data: any) {
    return actions.createProduct(data);
}

export async function updateProduct(id: string, data: any) {
    return actions.updateProduct(id, data);
}

export async function deleteProduct(id: string) {
    return actions.deleteProduct(id);
}

export async function bulkUpdateProducts(ids: string[], updates: any) {
    return actions.bulkUpdateProducts(ids, updates);
}

export async function searchProducts(query: string, locale?: string, limit?: number, page?: number) {
    return actions.searchProducts(query, locale, limit, page);
}

export async function getSearchSuggestions(query: string, locale?: string, limit?: number) {
    return actions.getSearchSuggestions(query, locale, limit);
}

export async function getUncategorizedProducts(locale?: string) {
    return actions.getUncategorizedProducts(locale);
}

export async function getLowStockProducts(threshold?: number, locale?: string) {
    return actions.getLowStockProducts(threshold, locale);
}

export async function getAuditProducts(issueType: any, locale?: string) {
    return actions.getAuditProducts(issueType, locale);
}

export async function updateAIDescription(id: string, language: any, localizedData: any) {
    return actions.updateAIDescription(id, language, localizedData);
}

export async function bulkUpdateAIDescriptions(items: any[]) {
    return actions.bulkUpdateAIDescriptions(items);
}

export async function indexProductManuals(id: string) {
    return actions.indexProductManuals(id);
}

export async function updateProductStock(productId: string, variantIndex: number, newStock: number, isVariant: boolean) {
    return actions.updateProductStock(productId, variantIndex, newStock, isVariant);
}

export async function getProductsWithStructureIssues(locale?: string) {
    return actions.getProductsWithStructureIssues(locale);
}

export async function fixProductStructure(id: string) {
    return actions.fixProductStructure(id);
}
