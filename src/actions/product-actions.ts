'use server';

import { revalidatePath } from 'next/cache';
import qs from 'qs';
// processManual import removed

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface ProductData {
    name: string;
    description?: string;
    shortDescription?: string;
    price: number;
    stock: number;
    category: string;
}

/**
 * Fetch all products with pagination
 */
export async function getProducts(page: number = 1, pageSize: number = 25, filters?: any, locale: string = 'es') {
    try {
        const queryObj: any = {
            pagination: {
                page,
                pageSize,
            },
            populate: ['images', 'manuals'],
            locale,
            publicationState: 'preview',
        };

        if (filters) {
            queryObj.filters = filters;
        }

        const query = qs.stringify(queryObj, { encodeValuesOnly: true });

        const response = await fetch(`${STRAPI_URL}/api/products?${query}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        // Strapi 5 returns flat data, but we normalize it if needed
        return {
            ...data,
            data: data.data.map((item: any) => ({
                id: item.id,
                documentId: item.documentId,
                attributes: item // For backward compatibility if needed, or just use item
            }))
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;

    }
}

/**
 * Fetch single product by ID
 */
export async function getProduct(id: string, locale: string = 'es') {
    try {
        const query = qs.stringify({
            populate: ['images', 'manuals', 'localizations'],
            locale,
        }, { encodeValuesOnly: true });

        const response = await fetch(`${STRAPI_URL}/api/products/${id}?${query}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Strapi Fetch Product Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                url: `${STRAPI_URL}/api/products/${id}?${query}`
            });
            throw new Error(errorData.error?.message || `Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        // Strapi 5 returns flat data. We normalize it to include .attributes for backward compatibility
        // but the goal is to move away from .attributes
        return {
            id: data.data.id,
            documentId: data.data.documentId,
            ...data.data,
            attributes: data.data
        };
    } catch (error: any) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

/**
 * Fetch single product by slug
 */
export async function getProductBySlug(slug: string, locale: string = 'es') {
    try {
        const queryObj: any = {
            filters: {
                slug: {
                    $eq: slug,
                },
            },
            populate: ['images', 'manuals'],
            locale,
        };

        const query = qs.stringify(queryObj, { encodeValuesOnly: true });

        const response = await fetch(`${STRAPI_URL}/api/products?${query}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product by slug');
        }

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            return null;
        }

        const product = data.data[0];
        return {
            id: product.id,
            documentId: product.documentId,
            ...product,
            attributes: product
        };
    } catch (error: any) {
        console.error('Error fetching product by slug:', error);
        throw error;
    }
}

/**
 * Helper to upload a file to Strapi
 */
async function uploadFile(file: File): Promise<number> {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Strapi Upload Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
        });
        throw new Error(errorData.error?.message || `Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0].id; // Strapi returns array of uploaded files
}

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // Support accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const generateSKU = () => {
    return `AZK-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

/**
 * Create a new product
 */
export async function createProduct(formData: FormData) {
    try {
        // 1. Extract files
        const imageFiles = formData.getAll('newImages') as File[];
        const manualFiles = formData.getAll('newManuals') as File[];

        // 2. Upload files first
        const uploadedImageIds: number[] = [];
        for (const file of imageFiles) {
            if (file.size > 0) {
                const id = await uploadFile(file);
                uploadedImageIds.push(id);
            }
        }

        const uploadedManualIds: number[] = [];
        for (const file of manualFiles) {
            if (file.size > 0) {
                const id = await uploadFile(file);
                uploadedManualIds.push(id);
            }
        }

        // 3. Prepare common product data (Non-localized)
        const commonData = {
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            category: formData.get('category'),
            images: uploadedImageIds,
            manuals: uploadedManualIds,
            brand: formData.get('brand'),
            productNumber: formData.get('productNumber') || generateSKU(),
            slug: slugify(formData.get('name') as string),
            colors: (formData.get('colors') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            sizes: (formData.get('sizes') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            accessories: (formData.get('accessories') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
        };

        // 4. Create Base Product (ES - Default Locale)
        const name = formData.get('name');
        const shortDescription = formData.get('shortDescription');
        const description = formData.get('description'); // El agente ahora debe enviar 'description'

        const esData = {
            ...commonData,
            name,
            shortDescription,
            description,
            locale: 'es',
        };

        const responseEs = await fetch(`${STRAPI_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: esData }),
        });

        const dataEs = await responseEs.json();

        if (!responseEs.ok) {
            throw new Error(dataEs.error?.message || 'Failed to create product (ES)');
        }

        const productId = dataEs.data.documentId; // Strapi 5 usa documentId para localizaciones

        // 5. Create Localizations (EN, IT) if provided
        // Nota: En el nuevo flujo, el agente o el usuario pueden enviar traducciones.
        // Si el agente envía description_en/it por inercia, las manejamos temporalmente o las mapeamos.
        const locales = ['en', 'it'];
        for (const loc of locales) {
            const localizedDesc = formData.get(`description_${loc}`);
            if (localizedDesc) {
                await fetch(`${STRAPI_URL}/api/products/${productId}/localizations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        locale: loc,
                        name,
                        shortDescription,
                        description: localizedDesc,
                    }),
                });
            }
        }

        revalidatePath('/[lang]/dashboard/products', 'page');
        revalidatePath('/[lang]/dashboard', 'layout');
        return { success: true, data: dataEs.data };
    } catch (error: any) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, formData: FormData) {
    try {
        // 1. Extract new files
        const imageFiles = formData.getAll('newImages') as File[];
        const manualFiles = formData.getAll('newManuals') as File[];
        const removedImageIds = (formData.get('removedImageIds') as string)?.split(',').filter(Boolean) || [];
        const removedManualIds = (formData.get('removedManualIds') as string)?.split(',').filter(Boolean) || [];

        // 2. Upload new files
        const uploadedImageIds: number[] = [];
        for (const file of imageFiles) {
            if (file.size > 0) {
                const fileId = await uploadFile(file);
                uploadedImageIds.push(fileId);
            }
        }

        const uploadedManualIds: number[] = [];
        for (const file of manualFiles) {
            if (file.size > 0) {
                const fileId = await uploadFile(file);
                uploadedManualIds.push(fileId);
            }
        }

        // 3. Get current product to merge file IDs
        const currentProduct = await getProduct(id);

        const existingImages = currentProduct.images?.data || currentProduct.images || [];
        const existingImageIds = existingImages.map((img: any) => img.id) || [];

        const existingManuals = currentProduct.manuals?.data || currentProduct.manuals || [];
        const existingManualIds = existingManuals.map((m: any) => m.id) || [];

        const finalImageIds = [
            ...existingImageIds.filter((imgId: number) => !removedImageIds.includes(imgId.toString())),
            ...uploadedImageIds
        ];

        const finalManualIds = [
            ...existingManualIds.filter((mId: number) => !removedManualIds.includes(mId.toString())),
            ...uploadedManualIds
        ];

        // 4. Prepare common data (Non-localized)
        const commonData = {
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            category: formData.get('category'),
            images: finalImageIds,
            manuals: finalManualIds,
            brand: formData.get('brand'),
            productNumber: formData.get('productNumber') || generateSKU(),
            slug: slugify(formData.get('name') as string),
            colors: (formData.get('colors') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            sizes: (formData.get('sizes') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            accessories: (formData.get('accessories') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
        };

        // Helper to upsert locale
        const upsertLocale = async (targetLocale: string, data: any, isDefault: boolean = false) => {
            // Check if this locale exists
            const currentLocales = [currentProduct.locale, ...(currentProduct.localizations?.map((l: any) => l.locale) || [])];
            const exists = currentLocales.includes(targetLocale);

            if (exists) {
                // Update existing
                // Use documentId if available, or just id + locale query matches the document in Strapi 5
                // Actually in Strapi 5 PUT /products/:documentId updates the document fields. 
                // We must pass locale query param to target specific locale content.
                await fetch(`${STRAPI_URL}/api/products/${id}?locale=${targetLocale}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data }),
                });
            } else {
                // Create localization (Add translation)
                // We use the ID of the current product (which serves as the "source" for linking)
                // In Strapi 5, we might need to POST to /api/products/:documentId/localizations
                // But typically :id (documentId) + /localizations works. Let's try standard V4 way first which is often compatible or check.
                // Actually safer: POST /api/products/:id/localizations (where id is documentId)
                await fetch(`${STRAPI_URL}/api/products/${id}/localizations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        locale: targetLocale,
                        ...data
                    }),
                });
            }
        };

        const name = formData.get('name');
        const shortDescription = formData.get('shortDescription');

        // 5. Update/Create ES
        const description = formData.get('description') || formData.get('description_es');
        await upsertLocale('es', {
            ...commonData,
            name,
            shortDescription,
            description,
        }, true);

        // 6. Update/Create EN
        const description_en = formData.get('description_en');
        if (description_en) {
            await upsertLocale('en', {
                name,
                shortDescription,
                description: description_en,
            });
        }

        // 7. Update/Create IT
        const description_it = formData.get('description_it');
        if (description_it) {
            await upsertLocale('it', {
                name,
                shortDescription,
                description: description_it,
            });
        }

        revalidatePath('/[lang]/dashboard/products', 'page');
        revalidatePath(`/[lang]/dashboard/products/${id}`, 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
    try {
        const response = await fetch(`${STRAPI_URL}/api/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Strapi Delete Product Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                id
            });
            throw new Error(errorData.error?.message || `Failed to delete product: ${response.statusText}`);
        }

        revalidatePath('/[lang]/dashboard/products', 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Index product manuals
 */
// @ts-ignore
import { parsePdf } from '@/lib/pdf-server';
import { generateEmbedding } from '@/lib/deepseek';
import { indexDocument, createCollection, getCollectionInfo } from '@/lib/qdrant';

const COLLECTION_NAME = 'product_manuals';
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length);
        const chunk = text.slice(startIndex, endIndex);
        chunks.push(chunk);
        startIndex += (chunkSize - overlap);
        if (endIndex === text.length) break;
    }

    return chunks;
}

/**
 * Index product manuals
 */
export async function indexProductManuals(id: string) {
    try {
        // 1. Get product and manuals
        const product = await getProduct(id);
        const manuals = product.attributes.manuals?.data;

        if (!manuals || manuals.length === 0) {
            throw new Error('No manuals to index');
        }

        // Ensure collection exists
        const collectionInfo = await getCollectionInfo(COLLECTION_NAME);
        if (!collectionInfo) {
            await createCollection(COLLECTION_NAME);
        }

        // 2. Process each manual
        for (const manual of manuals) {
            const manualUrl = `${STRAPI_URL}${manual.attributes.url}`;

            // Fetch the PDF file
            const response = await fetch(manualUrl);
            if (!response.ok) throw new Error(`Failed to fetch manual: ${manual.attributes.name}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Extract text using pdf-parse via server utility
            const data = await parsePdf(buffer);
            const text = data.text;

            // Chunk text
            const textChunks = chunkText(text);

            // Generate embeddings and index each chunk
            const points = [];
            for (let i = 0; i < textChunks.length; i++) {
                const chunkText = textChunks[i];
                const embedding = await generateEmbedding(chunkText);

                points.push({
                    id: `${id}_${manual.id}_chunk_${i}`,
                    vector: embedding,
                    payload: {
                        productId: id,
                        chunkIndex: i,
                        text: chunkText,
                        fileName: manual.attributes.name,
                    },
                });
            }

            // Index chunks
            if (points.length > 0) {
                await indexDocument(COLLECTION_NAME, points);
            }
        }

        // 3. Mark as indexed in Strapi
        await fetch(`${STRAPI_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    manualsIndexed: true,
                    lastAiUpdate: new Date().toISOString(),
                },
            }),
        });

        revalidatePath(`/[lang]/dashboard/products/${id}`, 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error indexing manuals:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update AI-generated description
 */
export async function updateAIDescription(
    id: string, // documentId
    language: 'es' | 'en' | 'it',
    description: string
) {
    try {
        // En Strapi 5, actualizamos el documento pasando el locale por query
        const response = await fetch(`${STRAPI_URL}/api/products/${id}?locale=${language}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    description: description,
                    aiGenerated: true,
                    lastAiUpdate: new Date().toISOString(),
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to update description');
        }

        const data = await response.json();
        revalidatePath(`/[lang]/dashboard/products/${id}`, 'page');
        return { success: true, data: data.data };
    } catch (error: any) {
        console.error('Error updating AI description:', error);
        return { success: false, error: error.message };
    }
}
