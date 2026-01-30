'use client';

import { useDashboard } from '@/context/DashboardContext';
import Link from 'next/link';
import {
    Package,
    Sparkles,
    Activity,
    ArrowUpRight,
    ChevronRight,
    Plus,
    AlertTriangle,
    CheckCircle2,
    Users
} from 'lucide-react';

interface DashboardOverviewProps {
    dict: any;
    lang: string;
    totalProducts: number;
    totalCustomers?: number;
    aiGeneratedCount: number;
    healthScore: number;
    lowStockCount: number;
    missingDescriptionCount: number;
    uncategorizedCount: number;
    recentProducts: any[];
}

export default function DashboardOverview({
    dict,
    lang,
    totalProducts,
    totalCustomers,
    aiGeneratedCount,
    healthScore,
    lowStockCount,
    missingDescriptionCount,
    uncategorizedCount,
    recentProducts
}: DashboardOverviewProps) {
    const { setQuickAddOpen } = useDashboard();

    const stats = [
        { label: dict.products, value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
        { label: 'Clientes', value: totalCustomers || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-emerald-600' },
        { label: dict.aiGenerated, value: aiGeneratedCount, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
        { label: 'Stock Bajo', value: lowStockCount, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
    ];

    return (
        <div className="space-y-8">
            {/* Header section with Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {dict.dashboard}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Bienvenido de nuevo. Aquí tienes el pulso de tu catálogo hoy.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setQuickAddOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Añadir Rápido
                    </button>
                    <Link
                        href={`/${lang}/dashboard/products/new`}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm active:scale-95"
                    >
                        Editor Pro
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${stat.gradient}`} />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Catalog Health Widget */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                Estado del Catálogo
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${healthScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                {healthScore > 80 ? 'Óptimo' : 'Atención Requerida'}
                            </span>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Descripciones</span>
                                    <span className="font-bold">{totalProducts - missingDescriptionCount}/{totalProducts}</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${totalProducts ? ((totalProducts - missingDescriptionCount) / totalProducts) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Categorizado</span>
                                    <span className="font-bold">{totalProducts - uncategorizedCount}/{totalProducts}</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${totalProducts ? ((totalProducts - uncategorizedCount) / totalProducts) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Stock OK</span>
                                    <span className="font-bold">{totalProducts - lowStockCount}/{totalProducts}</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${totalProducts ? ((totalProducts - lowStockCount) / totalProducts) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Issues List */}
                        {(missingDescriptionCount > 0 || uncategorizedCount > 0) && (
                            <div className="px-6 pb-6 space-y-3">
                                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Acciones Sugeridas</h3>
                                {missingDescriptionCount > 0 && (
                                    <Link
                                        href={`/${lang}/dashboard/products?filter=missing_description`}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                <Sparkles className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generar descripciones para {missingDescriptionCount} productos</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Products List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Productos Recientes</h2>
                            <Link href={`/${lang}/dashboard/products`} className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                Ver todos <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="p-0">
                            {recentProducts.slice(0, 5).map((product: any, idx) => (
                                <Link
                                    key={idx}
                                    href={`/${lang}/dashboard/products/${product.documentId}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {(product.attributes?.images?.data || product.attributes?.images)?.[0] ? (
                                                <img
                                                    src={(product.attributes.images.data || product.attributes.images)[0].attributes?.url?.startsWith('/uploads/') || (product.attributes.images.data || product.attributes.images)[0].url?.startsWith('/uploads/')
                                                        ? ((product.attributes.images.data || product.attributes.images)[0].attributes?.url || (product.attributes.images.data || product.attributes.images)[0].url)
                                                        : `${process.env.NEXT_PUBLIC_STRAPI_URL || ''}${(product.attributes.images.data || product.attributes.images)[0].attributes?.url || (product.attributes.images.data || product.attributes.images)[0].url}`}
                                                    className="w-full h-full object-cover"
                                                    alt={product.attributes?.name}
                                                    onError={(e: any) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const fallback = document.createElement('div');
                                                        fallback.className = 'w-5 h-5 text-gray-400 flex items-center justify-center';
                                                        fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
                                                        e.currentTarget.parentElement?.appendChild(fallback);
                                                    }}
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">{product.attributes?.name}</p>
                                            <p className="text-xs text-gray-500 uppercase font-mono">{product.attributes?.productNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">€{product.attributes?.price?.toFixed(2) || '0.00'}</p>
                                        <p className={`text-[10px] font-bold ${product.attributes?.stock < 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {product.attributes?.stock || 0} en stock
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                        <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Tip del Agente IA
                        </h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            "Puedes subir fotos de nuevos productos directamente desde tu móvil y el Agente generará las descripciones técnicas automáticamente."
                        </p>
                        <button
                            onClick={() => setQuickAddOpen(true)}
                            className="mt-4 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm border border-white/20"
                        >
                            Probar ahora
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auditar Inventario</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </button>
                            <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumen de Ventas</span>
                                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
