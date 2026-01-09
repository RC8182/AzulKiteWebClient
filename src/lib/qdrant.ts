/**
 * Qdrant Vector Database Client
 * Handles vector operations for RAG system
 */

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

interface QdrantPoint {
    id: string | number;
    vector: number[];
    payload: Record<string, any>;
}

interface SearchResult {
    id: string | number;
    score: number;
    payload: Record<string, any>;
}

/**
 * Create a collection in Qdrant
 */
export async function createCollection(
    collectionName: string,
    vectorSize: number = 1536 // Default for text-embedding-3-small
): Promise<boolean> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }

        const response = await fetch(`${QDRANT_URL}/collections/${collectionName}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                vectors: {
                    size: vectorSize,
                    distance: 'Cosine',
                },
            }),
        });

        if (response.status === 409) {
            // Collection already exists
            return true;
        }

        if (!response.ok) {
            throw new Error(`Failed to create collection: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Error creating Qdrant collection:', error);
        throw error;
    }
}

/**
 * Index a document (manual chunk) in Qdrant
 */
export async function indexDocument(
    collectionName: string,
    points: QdrantPoint[]
): Promise<boolean> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }

        const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                points,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to index document: ${error.status?.error || response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Error indexing document in Qdrant:', error);
        throw error;
    }
}

/**
 * Search for similar vectors in Qdrant
 */
export async function searchSimilar(
    collectionName: string,
    queryVector: number[],
    limit: number = 5,
    filter?: Record<string, any>
): Promise<SearchResult[]> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }

        const body: any = {
            vector: queryVector,
            limit,
            with_payload: true,
        };

        if (filter) {
            body.filter = filter;
        }

        const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to search: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result || [];
    } catch (error) {
        console.error('Error searching in Qdrant:', error);
        throw error;
    }
}

/**
 * Delete vectors for a specific product
 */
export async function deleteProductVectors(
    collectionName: string,
    productId: string | number
): Promise<boolean> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }

        const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/delete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                filter: {
                    must: [
                        {
                            key: 'productId',
                            match: {
                                value: productId,
                            },
                        },
                    ],
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete vectors: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting product vectors:', error);
        throw error;
    }
}

/**
 * Get collection info
 */
export async function getCollectionInfo(collectionName: string): Promise<any> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }

        const response = await fetch(`${QDRANT_URL}/collections/${collectionName}`, {
            method: 'GET',
            headers,
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to get collection info: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error getting collection info:', error);
        return null;
    }
}
