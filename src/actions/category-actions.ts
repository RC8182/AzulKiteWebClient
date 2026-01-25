'use server';

import * as actions from './category-actions-prisma';

export async function getCategories(locale?: string) {
    return actions.getCategories(locale);
}

export async function getCategoryTree(locale?: string) {
    return actions.getCategoryTree(locale);
}

export async function getCategory(id: string, locale?: string) {
    return actions.getCategory(id, locale);
}

export async function getCategoryBySlug(slug: string, locale?: string) {
    return actions.getCategoryBySlug(slug, locale);
}

export async function createCategory(data: any) {
    return actions.createCategory(data);
}

export async function updateCategory(id: string, data: any) {
    return actions.updateCategory(id, data);
}

export async function deleteCategory(id: string) {
    return actions.deleteCategory(id);
}

export async function getProductsByCategory(categorySlug: string, page?: number, pageSize?: number, locale?: string) {
    return actions.getProductsByCategory(categorySlug, page, pageSize, locale);
}

export async function migrateCategoryFromStrapi(strapiData: any) {
    return actions.migrateCategoryFromStrapi(strapiData);
}

export async function getCategoryStats(locale?: string) {
    return actions.getCategoryStats(locale);
}
