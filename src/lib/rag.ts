/**
 * RAG (Retrieval-Augmented Generation) Orchestrator
 * Handles PDF processing, chunking, embedding, and context retrieval
 */

import { generateEmbedding, generateProductText } from './deepseek';
import { createCollection, indexDocument, searchSimilar, getCollectionInfo } from './qdrant';

const COLLECTION_NAME = 'product_manuals';
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks

interface ManualChunk {
    text: string;
    chunkIndex: number;
    pageNumber?: number;
}

interface ProcessedManual {
    productId: string;
    chunks: ManualChunk[];
    totalChunks: number;
}

/**
 * Extract text from PDF file
 * Note: This is a server-side operation that should use pdf-parse or similar
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    // This needs to be implemented server-side with a library like pdf-parse
    // For now, we'll return a placeholder
    // In production, this should call a server action that uses pdf-parse

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/pdf/extract', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to extract PDF text');
        }

        const { text } = await response.json();
        return text;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw error;
    }
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length);
        const chunk = text.slice(startIndex, endIndex);
        chunks.push(chunk);

        // Move forward by (chunkSize - overlap) to create overlap
        startIndex += (chunkSize - overlap);

        // Break if we've reached the end
        if (endIndex === text.length) {
            break;
        }
    }

    return chunks;
}

/**
 * Process manual and index it in Qdrant
 */
export async function processManual(
    productId: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<ProcessedManual> {
    try {
        // Ensure collection exists
        const collectionInfo = await getCollectionInfo(COLLECTION_NAME);
        if (!collectionInfo) {
            await createCollection(COLLECTION_NAME);
        }

        // Extract text from PDF
        onProgress?.(10);
        const text = await extractTextFromPDF(file);

        // Split into chunks
        onProgress?.(30);
        const textChunks = chunkText(text);

        const chunks: ManualChunk[] = textChunks.map((chunk, index) => ({
            text: chunk,
            chunkIndex: index,
        }));

        // Generate embeddings and index each chunk
        const totalChunks = chunks.length;
        const points = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await generateEmbedding(chunk.text);

            points.push({
                id: `${productId}_chunk_${i}`,
                vector: embedding,
                payload: {
                    productId,
                    chunkIndex: i,
                    text: chunk.text,
                    fileName: file.name,
                },
            });

            // Update progress
            const progress = 30 + ((i + 1) / totalChunks) * 60;
            onProgress?.(Math.round(progress));
        }

        // Index all points in Qdrant
        await indexDocument(COLLECTION_NAME, points);
        onProgress?.(100);

        return {
            productId,
            chunks,
            totalChunks,
        };
    } catch (error) {
        console.error('Error processing manual:', error);
        throw error;
    }
}

/**
 * Retrieve relevant context from indexed manuals
 */
export async function retrieveContext(
    productId: string,
    query: string,
    topK: number = 3
): Promise<string> {
    try {
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Search for similar chunks
        const results = await searchSimilar(
            COLLECTION_NAME,
            queryEmbedding,
            topK,
            {
                must: [
                    {
                        key: 'productId',
                        match: {
                            value: productId,
                        },
                    },
                ],
            }
        );

        // Combine the retrieved chunks into context
        const context = results
            .map((result, index) => {
                const text = result.payload.text;
                return `[Sección ${index + 1}]\n${text}`;
            })
            .join('\n\n');

        return context;
    } catch (error) {
        console.error('Error retrieving context:', error);
        throw error;
    }
}

/**
 * Generate product description with RAG
 */
export async function generateWithContext(
    productId: string,
    productName: string,
    category: string,
    language: 'es' | 'en' | 'it' = 'es',
    useManuals: boolean = true
): Promise<string> {
    try {
        let context = '';

        if (useManuals) {
            // Retrieve relevant context from manuals
            const query = `Características técnicas y especificaciones de ${productName}`;
            context = await retrieveContext(productId, query, 5);
        }

        // Generate description with or without context
        const description = await generateProductText(
            productName,
            category,
            context || undefined,
            language
        );

        return description;
    } catch (error) {
        console.error('Error generating with context:', error);
        throw error;
    }
}
