'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, type Language } from './db';
import { createProduct, updateProduct } from '@/actions/product-actions';
import ImageUploader from './ImageUploader';
import ManualUploader from './ManualUploader';
import { Save, X } from 'lucide-react';
import AITextPanel from './AITextPanel';

interface ProductFormProps {
    lang: string;
    product?: any;
}

export default function ProductForm({ lang, product }: ProductFormProps) {
    const dict = getDictionary(lang as Language);
    const router = useRouter();
    const isEditing = !!product;

    const attributes = product?.attributes || product || {};

    const [formData, setFormData] = useState({
        name: attributes.name || '',
        category: attributes.category || 'Kites',
        price: attributes.price || '',
        stock: attributes.stock || '',
        shortDescription: attributes.shortDescription || '',
        description_es: attributes.description_es || '',
        description_en: attributes.description_en || '',
        description_it: attributes.description_it || '',
        brand: attributes.brand || '',
        productNumber: attributes.productNumber || '',
        colors: Array.isArray(attributes.colors) ? attributes.colors.join(', ') : '',
        sizes: Array.isArray(attributes.sizes) ? attributes.sizes.join(', ') : '',
        accessories: Array.isArray(attributes.accessories) ? attributes.accessories.join(', ') : '',
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

    const [newManuals, setNewManuals] = useState<File[]>([]);
    const [removedManualIds, setRemovedManualIds] = useState<number[]>([]);

    const [activeTab, setActiveTab] = useState<'es' | 'en' | 'it'>('es');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formDataToSend = new FormData();
        // Append standard fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value.toString());
        });

        // Append new files
        newImages.forEach(file => formDataToSend.append('newImages', file));
        newManuals.forEach(file => formDataToSend.append('newManuals', file));

        // Append removed IDs
        formDataToSend.append('removedImageIds', removedImageIds.join(','));
        formDataToSend.append('removedManualIds', removedManualIds.join(','));

        try {
            const result = isEditing
                ? await updateProduct(product.documentId || product.id.toString(), formDataToSend)
                : await createProduct(formDataToSend);

            if (result.success) {
                router.push(`/${lang}/dashboard/products`);
            } else {
                alert(`${dict.error}: ${result.error}`);
            }
        } catch (error) {
            alert(`${dict.error}: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAIDescriptionUpdate = (language: 'es' | 'en' | 'it', description: string) => {
        setFormData((prev) => ({
            ...prev,
            [`description_${language}`]: description,
        }));
    };

    const handleRemoveExistingImage = (id: number) => {
        setRemovedImageIds(prev => [...prev, id]);
    };

    const handleRemoveExistingManual = (id: number) => {
        setRemovedManualIds(prev => [...prev, id]);
    };

    const categories = ['Kites', 'Boards', 'Harnesses', 'Wetsuits', 'Accessories'];

    // Filter out removed images/manuals for display
    const imagesData = attributes.images?.data || attributes.images || [];
    const manualsData = attributes.manuals?.data || attributes.manuals || [];

    const displayImages = imagesData.filter(
        (img: any) => !removedImageIds.includes(img.id)
    );

    const displayManuals = manualsData.filter(
        (m: any) => !removedManualIds.includes(m.id)
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{dict.productDetails}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">{dict.productName}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">{dict.productCategory}</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {dict[cat.toLowerCase() as keyof typeof dict] || cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">{dict.productPrice}</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{dict.productStock}</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{dict.shortDescription}</label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    maxLength={200}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Marca (Brand)</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: North, Duotone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Número de Producto</label>
                                    <input
                                        type="text"
                                        name="productNumber"
                                        value={formData.productNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: N85000.200001.27"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Colores (separados por coma)</label>
                                    <input
                                        type="text"
                                        name="colors"
                                        value={formData.colors}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: Blue, Red, Green"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Medidas/Tallas (separadas por coma)</label>
                                    <input
                                        type="text"
                                        name="sizes"
                                        value={formData.sizes}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: 7m, 9m, 12m o S, M, L"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Accesorios (separados por coma)</label>
                                <input
                                    type="text"
                                    name="accessories"
                                    value={formData.accessories}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Ej: + Bar, + Pumpe, + Leash"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Uploads */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                        <h2 className="text-xl font-semibold">Multimedia y Manuales</h2>

                        <ImageUploader
                            images={displayImages}
                            onImagesChange={setNewImages}
                            onRemoveExisting={handleRemoveExistingImage}
                        />

                        <ManualUploader
                            productId={product?.documentId || product?.id?.toString()}
                            manuals={displayManuals}
                            manualsIndexed={attributes.manualsIndexed}
                            onManualsChange={setNewManuals}
                            onRemoveExisting={handleRemoveExistingManual}
                        />
                    </div>

                    {/* Descriptions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h2 className="text-xl font-semibold mb-4">{dict.descriptions}</h2>

                        {/* Language Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('es')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'es'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {dict.spanish}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('en')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'en'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {dict.english}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('it')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'it'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {dict.italian}
                            </button>
                        </div>

                        {/* Description Textareas */}
                        <div>
                            {activeTab === 'es' && (
                                <textarea
                                    name="description_es"
                                    value={formData.description_es}
                                    onChange={handleChange}
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Descripción en español..."
                                />
                            )}
                            {activeTab === 'en' && (
                                <textarea
                                    name="description_en"
                                    value={formData.description_en}
                                    onChange={handleChange}
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Description in English..."
                                />
                            )}
                            {activeTab === 'it' && (
                                <textarea
                                    name="description_it"
                                    value={formData.description_it}
                                    onChange={handleChange}
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Descrizione in italiano..."
                                />
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            {isSubmitting ? 'Guardando...' : dict.save}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <X className="w-5 h-5" />
                            {dict.cancel}
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Panel */}
            <div className="lg:col-span-1">
                {isEditing && (
                    <AITextPanel
                        lang={lang}
                        productId={product.documentId || product.id.toString()}
                        productName={formData.name}
                        category={formData.category}
                        manualsIndexed={attributes.manualsIndexed}
                        onDescriptionUpdate={handleAIDescriptionUpdate}
                    />
                )}
            </div>
        </div>
    );
}
