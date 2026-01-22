'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, type Language } from './db';
import { createProduct, updateProduct } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
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
        shortDescription: attributes.shortDescription || '',
        description_es: attributes.description_es || '',
        description_en: attributes.description_en || '',
        description_it: attributes.description_it || '',
        brand: attributes.brand || '',
        productNumber: attributes.productNumber || '',
        accessories: Array.isArray(attributes.accessories) ? attributes.accessories.join(', ') : '',
        saleBadge: attributes.saleBadge || 'None',
        discountPercent: attributes.discountPercent || '',
    });

    const [variants, setVariants] = useState<any[]>(attributes.variants || []);

    const [newImages, setNewImages] = useState<File[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

    const [newManuals, setNewManuals] = useState<File[]>([]);
    const [removedManualIds, setRemovedManualIds] = useState<number[]>([]);

    const [categories, setCategories] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'es' | 'en' | 'it'>('es');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index: number, field: string, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, {
            color: '',
            size: '',
            stock: 0,
            price: formData.price,
            saleInfo: {
                type: formData.saleBadge,
                discountPercent: formData.discountPercent
            }
        }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formDataToSend = new FormData();
        // Append standard fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value.toString());
        });

        // Append variants as JSON string
        formDataToSend.append('variants', JSON.stringify(variants));

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
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.documentId}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="invisible">
                                    {/* Price removed as per user request */}
                                </div>
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
                                    <label className="block text-sm font-medium mb-2">Etiqueta de Oferta (Sale Badge)</label>
                                    <select
                                        name="saleBadge"
                                        value={formData.saleBadge}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="None">Sin oferta</option>
                                        <option value="Black Friday">Black Friday</option>
                                        <option value="Sales">Rebajas (Sales)</option>
                                        <option value="Winter Sales">Winter Sales</option>
                                        <option value="Summer Sales">Summer Sales</option>
                                        <option value="Christmas Sales">Christmas Sales</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Descuento Global (%)</label>
                                    <input
                                        type="number"
                                        name="discountPercent"
                                        value={formData.discountPercent}
                                        onChange={handleChange}
                                        placeholder="Ej: 15"
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Variants Management */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium">Variantes (Color, Medida y Stock)</h3>
                                    <button
                                        type="button"
                                        onClick={addVariant}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                        + Añadir Variante
                                    </button>
                                </div>

                                {variants.length > 0 ? (
                                    <div className="space-y-3">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Color</label>
                                                    <input
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                        placeholder="Azul, Rojo..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Medida</label>
                                                    <input
                                                        type="text"
                                                        value={variant.size}
                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                        placeholder="9m, L, 42..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Precio</label>
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Oferta</label>
                                                        <select
                                                            value={variant.saleInfo?.type || 'None'}
                                                            onChange={(e) => handleVariantChange(index, 'saleInfo', { ...variant.saleInfo, type: e.target.value })}
                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                        >
                                                            <option value="None">Sin oferta</option>
                                                            <option value="Black Friday">Black Friday</option>
                                                            <option value="Sales">Rebajas</option>
                                                            <option value="Winter Sales">Winter Sales</option>
                                                            <option value="Summer Sales">Summer Sales</option>
                                                            <option value="Christmas Sales">Christmas Sales</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Desc %</label>
                                                        <input
                                                            type="number"
                                                            value={variant.saleInfo?.discountPercent || 0}
                                                            onChange={(e) => handleVariantChange(index, 'saleInfo', { ...variant.saleInfo, discountPercent: parseFloat(e.target.value) || 0 })}
                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Stock</label>
                                                        <input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-500">No hay variantes configuradas. Añade una para empezar.</p>
                                    </div>
                                )}
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
