'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/components/dashboard/db';
import { createPage, updatePage } from '@/actions/page-actions-prisma';
import { Save, X } from 'lucide-react';
import BlockManager from './BlockManager';

interface PageFormProps {
    lang: string;
    page?: any;
}

export default function PageForm({ lang, page }: PageFormProps) {
    const dict = getDictionary(lang as any);
    const router = useRouter();
    const isEditing = !!page;

    const [activeTab, setActiveTab] = useState<'es' | 'en' | 'it'>('es');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state setup
    const initialTitleEs = page?.translations?.find((t: any) => t.locale === 'es')?.title || page?.title || '';
    const initialContentEs = page?.translations?.find((t: any) => t.locale === 'es')?.content || page?.content || '';

    const initialTitleEn = page?.translations?.find((t: any) => t.locale === 'en')?.title || '';
    const initialContentEn = page?.translations?.find((t: any) => t.locale === 'en')?.content || '';

    const initialTitleIt = page?.translations?.find((t: any) => t.locale === 'it')?.title || '';
    const initialContentIt = page?.translations?.find((t: any) => t.locale === 'it')?.content || '';

    const [formData, setFormData] = useState({
        slug: page?.slug || '',
        published: page?.published ?? true,
        title_es: initialTitleEs,
        title_en: initialTitleEn,
        title_it: initialTitleIt,
        content_es: initialContentEs,
        content_en: initialContentEn,
        content_it: initialContentIt,
    });

    const [blocks, setBlocks] = useState<any[]>(page?.blocks?.map((b: any) => ({
        type: b.type,
        config: b.config,
        translations: b.translations || [
            { locale: 'es', content: b.content || {} }, // Fallback for flattened structure if any
            { locale: 'en', content: {} },
            { locale: 'it', content: {} }
        ]
        // If we are loading from getPageBySlug it might be flattened, but getPage return structure should be respected. 
        // We need to ensure getPage returns full nested structure or we normalize it here.
        // Based on my update actions, we save it nested.
    })) || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    // Auto-generate slug from Spanish title if slug is empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, title_es: value };
            if (!isEditing && !prev.slug) {
                newData.slug = value.toLowerCase().trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const translations = [
            {
                locale: 'es',
                title: formData.title_es,
                content: formData.content_es
            }
        ];

        if (formData.title_en || formData.content_en) {
            translations.push({
                locale: 'en',
                title: formData.title_en || formData.title_es,
                content: formData.content_en
            });
        }

        if (formData.title_it || formData.content_it) {
            translations.push({
                locale: 'it',
                title: formData.title_it || formData.title_es,
                content: formData.content_it
            });
        }

        const dataToSend = {
            slug: formData.slug,
            published: formData.published,
            title: formData.title_es, // Fallback base title
            content: formData.content_es, // Fallback base content
            translations,
            blocks
        };

        try {
            const result = isEditing
                ? await updatePage(page.id, { ...dataToSend, id: page.id })
                : await createPage(dataToSend);

            if (result.success) {
                router.push(`/${lang}/dashboard/pages`);
            } else {
                alert(`${dict.error || 'Error'}: ${result.error}`);
            }
        } catch (error) {
            alert(`${dict.error || 'Error'}: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">
                {isEditing ? (dict.editPage || 'Editar Página') : (dict.newPage || 'Nueva Página')}
            </h2>

            <div className="grid grid-cols-1 gap-6">
                {/* General Info */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                        />
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500 py-1">Sugerencias:</span>
                            {[
                                'about', 'contact', 'help', 'privacy', 'terms',
                                'cookies', 'legal', 'return-policy', 'payment', 'blog'
                            ].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, slug: s }))}
                                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 px-2 py-1 rounded transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="published"
                                checked={formData.published}
                                onChange={handleCheckboxChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <span className="font-medium">Publicado</span>
                        </label>
                    </div>
                </div>

                {/* Localized Info */}
                <div className="space-y-4">
                    <div className="flex gap-2 mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('es')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${activeTab === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Español
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${activeTab === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('it')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${activeTab === 'it' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Italiano
                        </button>
                    </div>

                    {activeTab === 'es' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium mb-2">Título</label>
                                <input
                                    type="text"
                                    name="title_es"
                                    value={formData.title_es}
                                    onChange={handleTitleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Contenido</label>
                                <textarea
                                    name="content_es"
                                    value={formData.content_es}
                                    onChange={handleChange}
                                    rows={12}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                                    placeholder="Escribe el contenido aquí (Markdown soportado)..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'en' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title_en"
                                    value={formData.title_en}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Content</label>
                                <textarea
                                    name="content_en"
                                    value={formData.content_en}
                                    onChange={handleChange}
                                    rows={12}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                                    placeholder="Write content here (Markdown supported)..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'it' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium mb-2">Titolo</label>
                                <input
                                    type="text"
                                    name="title_it"
                                    value={formData.title_it}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Contenuto</label>
                                <textarea
                                    name="content_it"
                                    value={formData.content_it}
                                    onChange={handleChange}
                                    rows={12}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                                    placeholder="Scrivi il contenuto qui (Markdown supportato)..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <BlockManager
                    blocks={blocks}
                    onChange={setBlocks}
                    activeLocale={activeTab}
                />
            </div>

            <div className="flex gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Guardando...' : (dict.save || 'Guardar')}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    <X className="w-5 h-5" />
                    {dict.cancel || 'Cancelar'}
                </button>
            </div>
        </form>
    );
}
