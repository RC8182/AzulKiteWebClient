'use client';

import { useState } from 'react';
import { getDictionary, type Language } from './db';
import { generateWithContext } from '@/lib/rag';
import { translateText } from '@/lib/deepseek';
import { updateAIDescription } from '@/actions/product-actions';
import { Sparkles, Languages, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AITextPanelProps {
    lang: string;
    productId: string;
    productName: string;
    category: string;
    manualsIndexed: boolean;
    onDescriptionUpdate: (language: 'es' | 'en' | 'it', description: string) => void;
}

export default function AITextPanel({
    lang,
    productId,
    productName,
    category,
    manualsIndexed,
    onDescriptionUpdate,
}: AITextPanelProps) {
    const dict = getDictionary(lang as Language);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en' | 'it'>('es');
    const [showPreview, setShowPreview] = useState(false);

    const handleGenerate = async (language: 'es' | 'en' | 'it') => {
        setIsGenerating(true);
        setCurrentLanguage(language);
        setShowPreview(false);

        try {
            const description = await generateWithContext(
                productId,
                productName,
                category,
                language,
                manualsIndexed
            );

            setGeneratedText(description);
            setShowPreview(true);
        } catch (error) {
            console.error('Error generating description:', error);
            alert(`${dict.error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTranslateAll = async () => {
        setIsTranslating(true);

        try {
            // Get Spanish description as source
            const sourceText = generatedText || '';
            if (!sourceText) {
                alert('Primero genera una descripción en español');
                return;
            }

            // Translate to English
            const englishText = await translateText(sourceText, 'en', 'es');
            await updateAIDescription(productId, 'en', englishText);
            onDescriptionUpdate('en', englishText);

            // Translate to Italian
            const italianText = await translateText(sourceText, 'it', 'es');
            await updateAIDescription(productId, 'it', italianText);
            onDescriptionUpdate('it', italianText);

            alert(dict.success);
        } catch (error) {
            console.error('Error translating:', error);
            alert(`${dict.error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleAccept = async () => {
        try {
            const result = await updateAIDescription(productId, currentLanguage, generatedText);
            if (result.success) {
                onDescriptionUpdate(currentLanguage, generatedText);
                setShowPreview(false);
                setGeneratedText('');
            } else {
                alert(`${dict.error}: ${result.error}`);
            }
        } catch (error) {
            alert(`${dict.error}: ${error}`);
        }
    };

    const handleReject = () => {
        setShowPreview(false);
        setGeneratedText('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6 sticky top-8">
            <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-semibold">{dict.aiAssistant}</h2>
            </div>

            {/* Manuals Status */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">{dict.manualsStatus}</p>
                <div className="flex items-center gap-2">
                    {manualsIndexed ? (
                        <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                                {dict.manualsIndexed}
                            </span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-5 h-5 text-orange-500" />
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                                {dict.noManuals}
                            </span>
                        </>
                    )}
                </div>
                {manualsIndexed && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {dict.contextUsed}
                    </p>
                )}
            </div>

            {/* Generate Buttons */}
            <div className="space-y-3">
                <p className="text-sm font-medium">{dict.generateDescription}</p>

                <button
                    onClick={() => handleGenerate('es')}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                    {isGenerating && currentLanguage === 'es' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {dict.generating}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            {dict.spanish}
                        </>
                    )}
                </button>

                <button
                    onClick={() => handleGenerate('en')}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                    {isGenerating && currentLanguage === 'en' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {dict.generating}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            {dict.english}
                        </>
                    )}
                </button>

                <button
                    onClick={() => handleGenerate('it')}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                    {isGenerating && currentLanguage === 'it' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {dict.generating}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            {dict.italian}
                        </>
                    )}
                </button>
            </div>

            {/* Translate All Button */}
            <button
                onClick={handleTranslateAll}
                disabled={isTranslating}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
                {isTranslating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {dict.translating}
                    </>
                ) : (
                    <>
                        <Languages className="w-5 h-5" />
                        {dict.translateAll}
                    </>
                )}
            </button>

            {/* Preview */}
            {showPreview && generatedText && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    <div>
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-64 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAccept}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {dict.accept}
                        </button>
                        <button
                            onClick={handleReject}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <XCircle className="w-5 h-5" />
                            {dict.reject}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
