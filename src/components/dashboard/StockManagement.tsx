'use client';

import { useState, useEffect } from 'react';
import { getProducts, bulkUpdateProducts } from '@/actions/product-actions';
import { Loader2, Save, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StockManagement({ lang }: { lang: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [stockChanges, setStockChanges] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await getProducts(1, 100);
                setProducts(data?.data || []);
            } catch (error) {
                console.error('Error loading products for stock:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleStockChange = (variantId: string, value: string) => {
        setStockChanges(prev => ({
            ...prev,
            [variantId]: parseInt(value) || 0
        }));
    };

    const saveStock = async (productId: string, variantIndex: number, newStock: number) => {
        setSaving(`${productId}-${variantIndex}`);
        try {
            const product = products.find(p => p.documentId === productId);
            if (!product) return;

            const updatedVariants = [...(product.variants || [])];
            updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                stock: newStock
            };

            const result = await bulkUpdateProducts([productId], { variants: updatedVariants });

            if (result.success) {
                // Update local state
                setProducts(prev => prev.map(p =>
                    p.documentId === productId ? { ...p, variants: updatedVariants } : p
                ));
                // Clear change
                const key = `${productId}-${variantIndex}`;
                const newChanges = { ...stockChanges };
                delete newChanges[key];
                setStockChanges(newChanges);
            }
        } catch (error) {
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

    // Flatten products and their variants for the table
    const rows: any[] = [];
    products.forEach(product => {
        const variants = product.variants || [];
        if (variants.length === 0) {
            rows.push({
                productId: product.documentId,
                name: product.name,
                variantName: 'Estándar',
                currentStock: product.stock || 0,
                sku: product.productNumber || 'N/A',
                isVariant: false,
                index: 0
            });
        } else {
            variants.forEach((v: any, idx: number) => {
                rows.push({
                    productId: product.documentId,
                    name: product.name,
                    variantName: `${v.color || ''} ${v.size || ''}`.trim() || `Variante ${idx + 1}`,
                    currentStock: v.stock || 0,
                    sku: v.sku || product.productNumber || 'N/A',
                    isVariant: true,
                    index: idx
                });
            });
        }
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Producto</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Variante</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">SKU</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Stock Actual</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Nuevo Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rows.map((row, i) => {
                            const changeKey = `${row.productId}-${row.index}`;
                            const hasChange = stockChanges[changeKey] !== undefined;
                            const isSaving = saving === changeKey;

                            return (
                                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {row.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                            {row.variantName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                        {row.sku}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`font-bold ${row.currentStock < 3 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                {row.currentStock}
                                            </span>
                                            {row.currentStock < 3 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
                                                placeholder={row.currentStock}
                                                onChange={(e) => handleStockChange(changeKey, e.target.value)}
                                                value={stockChanges[changeKey] ?? ''}
                                            />
                                            <button
                                                disabled={!hasChange || isSaving}
                                                onClick={() => saveStock(row.productId, row.index, stockChanges[changeKey])}
                                                className={`p-1.5 rounded transition-colors ${hasChange
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
    );
}
