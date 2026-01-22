'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDictionary, type Language } from './db';
import { deleteProduct } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { Edit, Trash2, Sparkles } from 'lucide-react';

interface Product {
    id: number;
    documentId: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    aiGenerated: boolean;
    manualsIndexed: boolean;
    images?: any;
    attributes?: any; // For backward compatibility
}

interface ProductTableProps {
    products: Product[];
    lang: string;
}

export default function ProductTable({ products, lang }: ProductTableProps) {
    const dict = getDictionary(lang as Language);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    const filteredProducts = products.filter((product) => {
        const attributes = product.attributes || (product as any);
        const name = attributes.name || '';
        const category = attributes.category || '';

        const matchesSearch = name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || category === categoryFilter;
        return matchesSearch && matchesCategory;
    });


    const handleDelete = async (documentId: string) => {
        if (confirm(dict.confirmDelete)) {
            const result = await deleteProduct(documentId);
            if (result.success) {
                window.location.reload();
            } else {
                alert(`${dict.error}: ${result.error}`);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder={dict.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">{dict.allCategories}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.documentId}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.image}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.name}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.category}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.price}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.stock}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.aiGenerated}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {dict.actions}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProducts.map((product) => {
                            const attributes = product.attributes || (product as any);
                            const name = attributes.name || 'Sin nombre';
                            const category = attributes.category || 'Sin categoría';
                            const price = typeof attributes.price === 'number' ? attributes.price : 0;
                            const stock = typeof attributes.stock === 'number' ? attributes.stock : 0;
                            const images = attributes.images?.data || attributes.images || [];
                            const aiGenerated = attributes.aiGenerated || false;

                            return (
                                <tr key={product.documentId || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                            {images[0] ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${images[0].attributes?.url || images[0].url}`}
                                                    alt={name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-xs">No img</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            {name}
                                            {attributes.saleBadge && attributes.saleBadge !== 'None' && (
                                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold uppercase">
                                                    {attributes.saleBadge}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {attributes.categories?.length > 0 ? (
                                                attributes.categories.map((cat: any) => (
                                                    <span key={cat.id} className="px-2 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {cat.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-[10px]">Sin categoría</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        <div className="flex flex-col">
                                            {attributes.saleInfo?.discountPercent > 0 && (
                                                <span className="text-[10px] text-red-500 font-bold">-{attributes.saleInfo.discountPercent}%</span>
                                            )}
                                            <span>€{price.toFixed(2)}</span>
                                            {attributes.variants?.length > 0 && attributes.variants.some((v: any) => v.price && v.price !== price) && (
                                                <span className="text-[10px] text-gray-400">(Varios precios)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {attributes.variants && attributes.variants.length > 0 ? (
                                            <div className="flex flex-col">
                                                <span>{attributes.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)}</span>
                                                <span className="text-[10px] text-gray-400">({attributes.variants.length} variantes)</span>
                                            </div>
                                        ) : (
                                            typeof attributes.stock === 'number' ? attributes.stock : 0
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {aiGenerated && (
                                            <Sparkles className="w-5 h-5 text-purple-500" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/${lang}/dashboard/products/${product.documentId || product.id}`}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title={dict.edit}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.documentId || product.id.toString())}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title={dict.delete}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No se encontraron productos
                    </div>
                )}
            </div>
        </div>
    );
}
