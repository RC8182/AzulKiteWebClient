'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/components/dashboard/db';
import { createCategory, updateCategory, getCategories } from '@/actions/category-actions-prisma';
import { Save, X } from 'lucide-react';

interface CategoryFormProps {
    lang: string;
    category?: any;
}

export default function CategoryForm({ lang, category }: CategoryFormProps) {
    const dict = getDictionary(lang as any);
    const router = useRouter();
    const isEditing = !!category;

    const [availableCategories, setAvailableCategories] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'es' | 'en' | 'it'>('es');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state setup
    const initialName = category?.translations?.find((t: any) => t.locale === 'es')?.name || category?.name || '';
    const initialDescEs = category?.translations?.find((t: any) => t.locale === 'es')?.description || category?.description || '';
    const initialDescEn = category?.translations?.find((t: any) => t.locale === 'en')?.description || '';
    const initialDescIt = category?.translations?.find((t: any) => t.locale === 'it')?.description || '';

    // Nombres en otros idiomas (si existen)
    const initialNameEn = category?.translations?.find((t: any) => t.locale === 'en')?.name || '';
    const initialNameIt = category?.translations?.find((t: any) => t.locale === 'it')?.name || '';

    const [formData, setFormData] = useState({
        slug: category?.slug || '',
        parentId: category?.parentId || '',
        name_es: initialName,
        name_en: initialNameEn,
        name_it: initialNameIt,
        description_es: initialDescEs,
        description_en: initialDescEn,
        description_it: initialDescIt,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getCategories();
            // Filter out current category to avoid loops if editing
            const filtered = isEditing
                ? cats.filter((c: any) => c.id !== category.id)
                : cats;
            setAvailableCategories(filtered);
        };
        fetchCategories();
    }, [category, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Auto-generate slug from Spanish name if slug is empty
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, name_es: value };
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
                name: formData.name_es,
                description: formData.description_es
            }
        ];

        if (formData.name_en || formData.description_en) {
            translations.push({
                locale: 'en',
                name: formData.name_en || formData.name_es,
                description: formData.description_en
            });
        }

        if (formData.name_it || formData.description_it) {
            translations.push({
                locale: 'it',
                name: formData.name_it || formData.name_es,
                description: formData.description_it
            });
        }

        const dataToSend = {
            slug: formData.slug,
            parentId: formData.parentId || undefined,
            translations
        };

        try {
            const result = isEditing
                ? await updateCategory(category.id, { ...dataToSend, id: category.id })
                : await createCategory(dataToSend);

            if (result.success) {
                router.push(`/${lang}/dashboard/categories`);
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">
                {isEditing ? (dict.editCategory || 'Editar Categoría') : (dict.newCategory || 'Nueva Categoría')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">{dict.category || 'Categoría Padre'}</label>
                        <select
                            name="parentId"
                            value={formData.parentId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Ninguna (Raíz)</option>
                            {availableCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({cat.slug})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Localized Info */}
                <div className="space-y-4">
                    <div className="flex gap-2 mb-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('es')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${activeTab === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            Español
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${activeTab === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('it')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${activeTab === 'it' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            Italiano
                        </button>
                    </div>

                    {activeTab === 'es' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre</label>
                                <input
                                    type="text"
                                    name="name_es"
                                    value={formData.name_es}
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descripción</label>
                                <textarea
                                    name="description_es"
                                    value={formData.description_es}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'en' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name_en"
                                    value={formData.name_en}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    name="description_en"
                                    value={formData.description_en}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'it' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nome</label>
                                <input
                                    type="text"
                                    name="name_it"
                                    value={formData.name_it}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descrizione</label>
                                <textarea
                                    name="description_it"
                                    value={formData.description_it}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
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
