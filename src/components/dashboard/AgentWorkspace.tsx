'use client';

import { useState, useEffect } from 'react';
import { getUncategorizedProducts, getProducts } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { AlertCircle, CheckCircle, Loader2, Sparkles, Database, BarChart3, PackageSearch } from 'lucide-react';
import AgentChat from './AgentChat';

export default function AgentWorkspace({ lang }: { lang: string }) {
    const [health, setHealth] = useState({
        uncategorized: 0,
        criticalStock: 0,
        missingDescriptions: 0,
        totalProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealthData = async () => {
            setLoading(true);
            try {
                const [uncat, all, cats] = await Promise.all([
                    getUncategorizedProducts(),
                    getProducts(1, 100),
                    getCategories()
                ]);

                const products = all?.data || [];
                const lowStock = products.filter((p: any) => {
                    const variants = p.variants || [];
                    if (variants.length === 0) return (p.stock || 0) < 3;
                    return variants.some((v: any) => (v.stock || 0) < 3);
                });

                const missingDesc = products.filter((p: any) => !p.description || p.description.length < 50);

                setHealth({
                    uncategorized: uncat.length,
                    criticalStock: lowStock.length,
                    missingDescriptions: missingDesc.length,
                    totalProducts: products.length
                });
            } catch (error) {
                console.error('Error loading health data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHealthData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)] min-h-[700px]">
            {/* Left Column: Chat Integrated */}
            <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <AgentChat
                    role="product_agent"
                    variant="inline"
                    title="Analista de Catálogo IA"
                    context={{ language: lang, catalogHealth: health }}
                />
            </div>

            {/* Right Column: Health Audit & Stats */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Salud del Catálogo
                    </h3>

                    <div className="space-y-4">
                        <HealthItem
                            label="Sin Categoría"
                            value={health.uncategorized}
                            icon={PackageSearch}
                            color={health.uncategorized > 0 ? "amber" : "green"}
                        />
                        <HealthItem
                            label="Stock Crítico"
                            value={health.criticalStock}
                            icon={Database}
                            color={health.criticalStock > 0 ? "red" : "green"}
                        />
                        <HealthItem
                            label="Falta Descripción"
                            value={health.missingDescriptions}
                            icon={AlertCircle}
                            color={health.missingDescriptions > 0 ? "blue" : "green"}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Productos</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{health.totalProducts}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
                    <h4 className="font-bold mb-2">Consejo del Agente</h4>
                    <p className="text-sm text-blue-100 leading-relaxed">
                        "He detectado que varios productos nuevos no tienen categorías asignadas. Esto afecta a la navegación de los clientes. ¿Quieres que los organice por ti?"
                    </p>
                </div>
            </div>
        </div>
    );
}

function HealthItem({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: "green" | "amber" | "red" | "blue" }) {
    const colors = {
        green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
            </div>
            <span className={`text-sm font-bold ${value > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {value}
            </span>
        </div>
    );
}
