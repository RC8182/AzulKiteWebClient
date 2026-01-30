'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/context/DashboardContext';
import { deleteProduct, updateProductStock } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { Edit, Trash2, Search, Filter, Package, Layers, Plus, Minus, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
    id: string;
    documentId?: string;
    name: string;
    category?: string;
    categories?: any[];
    price?: number;
    stock?: number;
    productNumber?: string;
    aiGenerated?: boolean;
    manualsIndexed?: boolean;
    images?: any[];
    saleInfo?: {
        onSale?: boolean;
        salePrice?: number;
        discountPercent?: number;
    };
    variants?: any[];
}

interface ProductTableProps {
    products: Product[];
    lang: string;
}

export default function ProductTable({ products, lang }: ProductTableProps) {
    const { dict } = useDashboard();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [updatingStock, setUpdatingStock] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getCategories(lang);
            setCategories(cats);
        };
        fetchCategories();
    }, [lang]);

    const filteredProducts = products.filter((product) => {
        const name = product.name || '';
        const hasCategory = !categoryFilter || product.categories?.some(c => c.id === categoryFilter);

        const matchesSearch = name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesSearch && hasCategory;
    });


    const handleDelete = async (id: string) => {
        if (confirm(dict.confirmDelete)) {
            const result = await deleteProduct(id);
            if (result.success) {
                window.location.reload();
            } else {
                alert(`${dict.error}: ${result.error}`);
            }
        }
    };

    const handleQuickStock = async (product: any, delta: number) => {
        const id = product.id;
        const variants = product.variants || [];
        const isVariable = variants.length > 0;

        let currentStock = 0;
        if (isVariable) {
            currentStock = variants[0].stock || 0;
        } else {
            currentStock = product.stock || 0;
        }

        const newStock = Math.max(0, currentStock + delta);
        setUpdatingStock(id);

        try {
            const result = await updateProductStock(id, 0, newStock, isVariable);
            if (result.success) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Quick stock update failed:', error);
        } finally {
            setUpdatingStock(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={dict.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none transition-all outline-none min-w-[200px]"
                        >
                            <option value="">{dict.allCategories}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden px-1">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{dict.image}</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{dict.name}</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tipo</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{dict.category}</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{dict.price}</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{dict.stock} Inv.</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">{dict.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {filteredProducts.map((product) => {
                                const name = product.name || 'Sin nombre';
                                const variants = product.variants || [];
                                const isVariable = variants.length > 0;

                                let price = 0;
                                if (variants.length > 0) {
                                    price = variants[0].price || 0;
                                }

                                let stock = product.stock || 0;
                                if (isVariable) {
                                    stock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                                }

                                const images = product.images || [];

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 group-hover:scale-110 transition-transform">
                                                {images[0] ? (
                                                    <img
                                                        src={images[0].url?.startsWith('/uploads/')
                                                            ? images[0].url
                                                            : `${process.env.NEXT_PUBLIC_STRAPI_URL || ''}${images[0].url}`}
                                                        alt={name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e: any) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const fallback = document.createElement('div');
                                                            fallback.className = 'w-5 h-5 text-gray-300 flex items-center justify-center';
                                                            fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
                                                            e.currentTarget.parentElement?.appendChild(fallback);
                                                        }}
                                                    />
                                                ) : (
                                                    <Package className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{name}</span>
                                                <span className="text-[10px] font-mono text-gray-400 uppercase">{product.productNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isVariable ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 tracking-tight">
                                                    <Layers className="w-3 h-3" /> VARIABLE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 tracking-tight">
                                                    <Package className="w-3 h-3" /> SIMPLE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {product.categories && product.categories.length > 0 ? (
                                                    product.categories.map((cat: any) => (
                                                        <span key={cat.id} className="px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                            {cat.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-[10px]">Sin categoría</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex flex-col">
                                                {/* @ts-ignore */}
                                                {product.saleInfo?.discountPercent && product.saleInfo.discountPercent > 0 && (
                                                    <span className="text-[10px] text-red-500 font-extrabold">-{product.saleInfo.discountPercent}%</span>
                                                )}
                                                <span className="font-extrabold text-gray-900 dark:text-white">€{price.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {!isVariable ? (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        disabled={updatingStock === product.id}
                                                        onClick={() => handleQuickStock(product, -1)}
                                                        className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 transition-colors text-gray-500"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className={`text-sm font-bold w-6 text-center ${stock < 5 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                        {updatingStock === product.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-blue-500" /> : stock}
                                                    </span>
                                                    <button
                                                        disabled={updatingStock === product.id}
                                                        onClick={() => handleQuickStock(product, 1)}
                                                        className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-500 transition-colors text-gray-500"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${stock < 5 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                        {stock}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400">Total</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/${lang}/dashboard/products/${product.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl dark:hover:bg-blue-900/20 transition-colors"
                                                    title={dict.edit}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/20 transition-colors"
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
                </div>
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{dict.noProductsFound || 'No se encontraron productos'}</p>
                    <button
                        onClick={() => { setSearchTerm(''); setCategoryFilter(''); }}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}
        </div>
    );
}

