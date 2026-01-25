'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { createProduct } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { X, Plus, Package, Euro, Database, Loader2, Check } from 'lucide-react';

export default function QuickAddSimpleModal() {
    const { isQuickAddOpen, setQuickAddOpen, dict } = useDashboard();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: ''
    });

    useEffect(() => {
        if (isQuickAddOpen) {
            const fetchCats = async () => {
                const cats = await getCategories();
                setCategories(cats);
            };
            fetchCats();
        }
    }, [isQuickAddOpen]);

    if (!isQuickAddOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('price', formData.price);
            fd.append('stock', formData.stock);
            fd.append('category', formData.category);
            fd.append('description', `Nuevo producto simple: ${formData.name}`);

            const result = await createProduct(fd);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setQuickAddOpen(false);
                    setFormData({ name: '', price: '', stock: '', category: '' });
                    window.location.reload();
                }, 1500);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Quick add failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => !loading && setQuickAddOpen(false)}
            />

            <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Producto Simple</h2>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Carga rápida a inventario</p>
                    </div>
                    <button
                        onClick={() => setQuickAddOpen(false)}
                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">¡Producto creado!</h3>
                        <p className="text-gray-500 mt-2">Inventario actualizado con éxito</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Crema Solar Factor 50"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Precio (€)</label>
                                <div className="relative">
                                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-extrabold dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Stock Inicial</label>
                                <div className="relative">
                                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="number"
                                        placeholder="10"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-extrabold dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-white appearance-none"
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.documentId}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            CREAR PRODUCTO
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
