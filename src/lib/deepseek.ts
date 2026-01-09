/**
 * DeepSeek API Client
 * Handles text generation and translation using DeepSeek's API
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

interface DeepSeekMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GenerateOptions {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

/**
 * Generate product description using DeepSeek
 */
export async function generateProductText(
    productName: string,
    category: string,
    context?: string,
    language: 'es' | 'en' | 'it' = 'es',
    options: GenerateOptions = {}
): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const languageNames = {
        es: 'español',
        en: 'English',
        it: 'italiano',
    };

    const systemPrompt = `Eres un experto en kitesurf y redacción de contenido para eCommerce. 
Tu tarea es crear descripciones de productos atractivas, técnicas y persuasivas en ${languageNames[language]}.
${context ? 'Usa el siguiente contexto técnico del manual del producto para crear una descripción precisa y detallada:' : ''}`;

    const userPrompt = context
        ? `Producto: ${productName}
Categoría: ${category}

Contexto técnico del manual:
${context}

Crea una descripción completa del producto que incluya:
1. Introducción atractiva
2. Características técnicas principales
3. Beneficios para el usuario
4. Para quién es ideal este producto

La descripción debe ser profesional, persuasiva y basada en la información técnica proporcionada.`
        : `Producto: ${productName}
Categoría: ${category}

Crea una descripción atractiva y profesional del producto para un eCommerce de kitesurf.`;

    const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];

    try {
        const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 1000,
                stream: false,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error generating text with DeepSeek:', error);
        throw error;
    }
}

/**
 * Translate text to target language using DeepSeek
 */
export async function translateText(
    text: string,
    targetLanguage: 'es' | 'en' | 'it',
    sourceLanguage?: 'es' | 'en' | 'it'
): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const languageNames = {
        es: 'español',
        en: 'English',
        it: 'italiano',
    };

    const systemPrompt = `Eres un traductor profesional especializado en contenido técnico de kitesurf y deportes acuáticos.
Traduce el siguiente texto a ${languageNames[targetLanguage]}, manteniendo el tono profesional y la precisión técnica.`;

    const userPrompt = sourceLanguage
        ? `Traduce el siguiente texto de ${languageNames[sourceLanguage]} a ${languageNames[targetLanguage]}:\n\n${text}`
        : `Traduce el siguiente texto a ${languageNames[targetLanguage]}:\n\n${text}`;

    const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];

    try {
        const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: 0.3, // Lower temperature for more accurate translations
                max_tokens: 2000,
                stream: false,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error translating text with DeepSeek:', error);
        throw error;
    }
}

/**
 * Generate embeddings for text using DeepSeek
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    try {
        // Note: DeepSeek may not have a dedicated embeddings endpoint
        // In that case, we might need to use an alternative like OpenAI embeddings
        // or a local embedding model. For now, this is a placeholder.

        // Alternative: Use a lightweight local model or OpenAI's text-embedding-3-small
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || apiKey}`,
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text,
            }),
        });

        if (!response.ok) {
            throw new Error(`Embedding API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0]?.embedding || [];
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}
