'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, type Language } from './db';
import { createProduct, updateProduct } from '@/actions/product-actions-prisma';
import { uploadFiles, deleteMedia } from '@/actions/media-actions';
import { getCategories } from '@/actions/category-actions-prisma';
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

    const initialTranslations = product?.translations || [];
    const getTrans = (loc: string) => initialTranslations.find((t: any) => t.locale === loc) || {};

    const [formData, setFormData] = useState({
        name: getTrans('es').name || attributes.name || '',
        category: attributes.categories?.[0]?.id || '',
        price: attributes.price || (attributes.variants?.[0]?.price || ''),
        shortDescription: getTrans('es').shortDescription || '',
        description_es: getTrans('es').description || '',
        description_en: getTrans('en').description || '',
        description_it: getTrans('it').description || '',
        stock: attributes.stock || (attributes.variants?.[0]?.stock || ''),
        brand: attributes.brand || '',
        productNumber: attributes.productNumber || '',
        accessories: attributes.accessories ? (typeof attributes.accessories === 'string' ? attributes.accessories : JSON.stringify(attributes.accessories)) : '',
        saleBadge: attributes.saleInfo?.type || attributes.saleBadge || 'None',
        discountPercent: attributes.saleInfo?.discountPercent || attributes.discountPercent || '',
        slug: attributes.slug || ''
    });

    const [variants, setVariants] = useState<any[]>(attributes.variants || []);

    const [newImages, setNewImages] = useState<File[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

    const [newManuals, setNewManuals] = useState<File[]>([]);
    const [removedManualIds, setRemovedManualIds] = useState<string[]>([]);

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

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, name: value };
            if (!isEditing && !prev.slug) {
                newData.slug = value.toLowerCase().trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            return newData;
        });
    };

    const handleVariantChange = (index: number, field: string, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, {
            name: 'New Variant',
            sku: `${formData.slug}-var-${variants.length + 1}`,
            stock: 0,
            price: parseFloat(formData.price as string) || 0,
            attributes: {
                color: '',
                size: ''
            }
        }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Upload new files
            let uploadedImageIds: string[] = [];
            let uploadedManualIds: string[] = [];

            if (newImages.length > 0) {
                const imageFormData = new FormData();
                newImages.forEach(file => imageFormData.append('files', file));
                const uploadRes = await uploadFiles(imageFormData);
                if (uploadRes.success && uploadRes.data) {
                    uploadedImageIds = uploadRes.data.map((m: any) => m.id);
                }
            }

            if (newManuals.length > 0) {
                const manualFormData = new FormData();
                newManuals.forEach(file => manualFormData.append('files', file));
                const uploadRes = await uploadFiles(manualFormData);
                if (uploadRes.success && uploadRes.data) {
                    uploadedManualIds = uploadRes.data.map((m: any) => m.id);
                }
            }

            // 2. Aggregate final media IDs
            const currentImages = (product?.images || []).map((img: any) => img.id);
            const currentManuals = []; // Assuming manuals are managed via specific filter or relation, here we just keep existing logical ones if we had them separated. 
            // NOTE: The previous form didn't clearly distinguish manuals in the 'images' relation. 
            // We assume all 'Media' are in the same relation.
            // We filter out removed IDs.

            const existingMediaIds = (product?.images || [])
                .map((img: any) => img.id)
                .filter((id: string) => !removedImageIds.includes(id) && !removedManualIds.includes(id));

            const finalMediaIds = [...existingMediaIds, ...uploadedImageIds, ...uploadedManualIds];

            // 3. Prepare structured data
            const translations = [
                {
                    locale: 'es',
                    name: formData.name,
                    description: formData.description_es,
                    shortDescription: formData.shortDescription
                }
            ];
            if (formData.description_en) {
                translations.push({
                    locale: 'en',
                    name: formData.name, // Or specific field if added
                    description: formData.description_en,
                    shortDescription: ''
                });
            }
            if (formData.description_it) {
                translations.push({
                    locale: 'it',
                    name: formData.name,
                    description: formData.description_it,
                    shortDescription: ''
                });
            }

            // Fix variants structure explicitly
            const finalVariants = variants.map(v => ({
                name: v.name || v.attributes?.color || 'Variant',
                sku: v.sku,
                price: parseFloat(v.price) || 0,
                stock: parseInt(v.stock) || 0,
                attributes: v.attributes || { color: v.color, size: v.size }
            }));

            // If no variants, create default from root data (legacy support)
            if (finalVariants.length === 0) {
                finalVariants.push({
                    name: 'Default',
                    sku: formData.slug || 'sku-default',
                    price: parseFloat(formData.price as string) || 0,
                    stock: parseInt(formData.stock as string) || 0,
                    attributes: {}
                });
            }

            const productData: any = {
                slug: formData.slug,
                productNumber: formData.productNumber,
                brand: formData.brand,
                accessories: formData.accessories,
                categories: formData.category ? [formData.category] : [],
                images: finalMediaIds,
                translations,
                variants: finalVariants,
                saleInfo: {
                    onSale: formData.saleBadge !== 'None',
                    salePrice: 0, // Calculate if needed
                    // Store badge type in metadata or handle differently? 
                    // Prisma schema for SaleInfo has generic fields. We'll stick to basic.
                }
            };

            const result = isEditing
                ? await updateProduct(product.id, { ...productData, id: product.id })
                : await createProduct(productData);

            if (result.success) {
                router.push(`/${lang}/dashboard/products`);
                router.refresh();
            } else {
                alert(`${dict.error}: ${result.error}`);
            }

        } catch (error) {
            console.error(error);
            alert(`${dict.error || 'Error'}: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveExistingImage = (id: string) => {
        setRemovedImageIds(prev => [...prev, id]);
    };

    const handleRemoveExistingManual = (id: string) => {
        setRemovedManualIds(prev => [...prev, id]);
    };

    // Filter out removed images/manuals for display
    // We try to identify manuals by mimeType or extension if possible, or just separated inputs
    const allMedia = product?.images || [];

    // Naive separation for display if we don't have a type field
    const displayImages = allMedia.filter(
        (img: any) => !removedImageIds.includes(img.id) && img.mimeType?.startsWith('image/')
    );

    const displayManuals = allMedia.filter(
        (m: any) => !removedManualIds.includes(m.id) && !m.mimeType?.startsWith('image/')
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
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Slug</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
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
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.translations?.[0]?.name || cat.name || cat.slug}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">{dict.productPrice} (€)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Marca</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{dict.productStock}</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Uploads */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                        <h2 className="text-xl font-semibold">Multimedia</h2>
                        <ImageUploader
                            images={displayImages}
                            onImagesChange={setNewImages}
                            onRemoveExisting={(id) => handleRemoveExistingImage(String(id))}
                        />
                        <div className="mt-4">
                            <h3 className="font-medium mb-2">Manuales (PDF)</h3>
                            {/* Reusing ImageUploader logical slot or dedicated one if exists. 
                                 Ideally assuming ManualUploader handles file inputs similarly */}
                            <ManualUploader
                                productId={product?.id}
                                manuals={displayManuals}
                                manualsIndexed={product?.manualsIndexed}
                                onManualsChange={setNewManuals}
                                onRemoveExisting={(id) => handleRemoveExistingManual(String(id))}
                            />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h2 className="text-xl font-semibold mb-4">{dict.descriptions}</h2>
                        <div className="flex gap-2 mb-4">
                            {['es', 'en', 'it'].map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setActiveTab(l as any)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === l ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'es' && (
                            <textarea
                                name="description_es"
                                value={formData.description_es}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        )}
                        {activeTab === 'en' && (
                            <textarea
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        )}
                        {activeTab === 'it' && (
                            <textarea
                                name="description_it"
                                value={formData.description_it}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        )}
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
                            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
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
                        productId={product.id}
                        productName={formData.name}
                        category={formData.category}
                        manualsIndexed={product.manualsIndexed}
                        onDescriptionUpdate={(l, d) => setFormData(prev => ({ ...prev, [`description_${l}`]: d }))}
                    />
                )}
            </div>
        </div>
    );
}
