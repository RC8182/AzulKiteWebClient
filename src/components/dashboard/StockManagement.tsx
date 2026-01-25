'use client';

import { useState, useEffect } from 'react';
import { getProducts, updateProductStock } from '@/actions/product-actions';
import { Loader2, Save, AlertTriangle, Package, Search, Filter } from 'lucide-react';

export default function StockManagement({ lang }: { lang: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [stockChanges, setStockChanges] = useState<{ [key: string]: number }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts(1, 250, null, lang); // Fetch more for stock management
            setProducts(data?.data || []);
        } catch (error) {
            console.error('Error loading products for stock:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleStockChange = (key: string, value: string) => {
        const val = parseInt(value);
        setStockChanges(prev => ({
            ...prev,
            [key]: isNaN(val) ? 0 : val
        }));
    };

    const saveStock = async (productId: string, variantIndex: number, newStock: number, isVariant: boolean) => {
        const key = `${productId}-${variantIndex}`;
        setSaving(key);
        try {
            const result = await updateProductStock(productId, variantIndex, newStock, isVariant);

            if (result.success) {
                // Actualizar estado local de forma inteligente
                setProducts(prev => prev.map(p => {
                    if (p.id !== productId) return p;

                    const updated = { ...p };
                    if (isVariant && updated.variants?.[variantIndex]) {
                        updated.variants[variantIndex].stock = newStock;
                    } else if (!isVariant) {
                        updated.stock = newStock;
                        if (updated.variants?.[0]) updated.variants[0].stock = newStock;
                    }
                    return updated;
                }));

                // Limpiar cambio
                setStockChanges(prev => {
                    const newChanges = { ...prev };
                    delete newChanges[key];
                    return newChanges;
                });
            } else {
                alert('Error al guardar el stock: ' + (result.error || 'Desconocido'));
            }
        } catch (error) {
            console.error('Save stock error:', error);
            alert('Error al guardar el stock');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.productNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' ||
            (product.categories?.[0]?.name === selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const categoriesList = ['All', ...Array.from(new Set(products.map(p => p.categories?.[0]?.name).filter(Boolean)))];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All' ? 'Todas las categorías' : cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Producto</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Variante</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Stock Actual</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Nuevo Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => {
                                    const variants = product.variants || [];
                                    const hasVariants = variants.length > 0;
                                    const name = product.name || 'Sin nombre';
                                    const productNumber = product.productNumber || 'N/A';

                                    return (
                                        <div key={product.id} className="contents">
                                            {/* Product Header Row if it has variants, or just the single row if simple */}
                                            {!hasVariants ? (
                                                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900 dark:text-white leading-none mb-1">{name}</span>
                                                            <span className="text-[10px] font-mono text-gray-400 uppercase">{productNumber}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-medium"> Simple </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className={`font-bold text-lg ${product.stock < 3 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                                {product.stock || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                                placeholder={(product.stock || 0).toString()}
                                                                onChange={(e) => handleStockChange(`${product.id}-0`, e.target.value)}
                                                                value={stockChanges[`${product.id}-0`] ?? ''}
                                                            />
                                                            <button
                                                                disabled={stockChanges[`${product.id}-0`] === undefined || saving === `${product.id}-0`}
                                                                onClick={() => saveStock(product.id, 0, stockChanges[`${product.id}-0`], false)}
                                                                className={`p-2 rounded-lg shadow-sm transition-all flex items-center gap-2 ${stockChanges[`${product.id}-0`] !== undefined && saving !== `${product.id}-0`
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                                                                    }`}
                                                            >
                                                                {saving === `${product.id}-0` ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <>
                                                    <tr className="bg-gray-50/30 dark:bg-gray-800/50">
                                                        <td colSpan={2} className="px-6 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="w-4 h-4 text-gray-400" />
                                                                <span className="font-bold text-gray-900 dark:text-white">{name}</span>
                                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">VARIABLE</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className="text-xs font-bold text-gray-400">Total: {product.stock || 0}</span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right"></td>
                                                    </tr>
                                                    {variants.map((v: any, idx: number) => {
                                                        const changeKey = `${product.id}-${idx}`;
                                                        const hasChange = stockChanges[changeKey] !== undefined;
                                                        const isSaving = saving === changeKey;

                                                        return (
                                                            <tr key={`${product.id}-v-${idx}`} className="hover:bg-gray-50/10 dark:hover:bg-gray-700/20 transition-colors border-l-4 border-blue-500/10">
                                                                <td className="px-6 py-3 pl-12 text-gray-500 text-sm">
                                                                    {productNumber}
                                                                </td>
                                                                <td className="px-6 py-3">
                                                                    <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded font-bold">
                                                                        {v.name}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <span className={`font-bold ${v.stock < 3 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                                            {v.stock || 0}
                                                                        </span>
                                                                        {v.stock < 3 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-3">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                                            placeholder={(v.stock || 0).toString()}
                                                                            onChange={(e) => handleStockChange(changeKey, e.target.value)}
                                                                            value={stockChanges[changeKey] ?? ''}
                                                                        />
                                                                        <button
                                                                            disabled={!hasChange || isSaving}
                                                                            onClick={() => saveStock(product.id, idx, stockChanges[changeKey], true)}
                                                                            className={`p-1.5 rounded transition-all ${hasChange && !isSaving ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                                                                        >
                                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/10">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

}
