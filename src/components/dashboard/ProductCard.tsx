'use client';

import Link from 'next/link';
import { Edit, Trash2, Sparkles, Package, Euro, Database, Layers, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface ProductCardProps {
    product: any;
    onDelete: (documentId: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
    const { lang, dict } = useDashboard();
    const attributes = product.attributes || product;
    const name = attributes.name || 'Sin nombre';
    const variants = attributes.variants || [];
    const isVariable = variants.length > 0;

    // Get price and stock from variants (new structure)
    let price = 0;
    if (variants.length > 0) {
        price = variants[0].price || 0;
    }

    let stock = 0;
    if (variants.length > 0) {
        stock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    }

    const images = attributes.images?.data || attributes.images || [];
    const aiGenerated = attributes.aiGenerated || false;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
            {/* Image & Badges */}
            <div className="relative h-44 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center overflow-hidden">
                {images[0] ? (
                    <img
                        src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${images[0].attributes?.url || images[0].url}`}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <Package className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {attributes.saleInfo?.discountPercent > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-extrabold rounded-lg shadow-sm">
                            -{attributes.saleInfo.discountPercent}%
                        </span>
                    )}
                    {aiGenerated && (
                        <div className="p-1.5 bg-white/90 dark:bg-gray-800/90 text-purple-600 rounded-lg shadow-sm backdrop-blur-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-3 left-3">
                    {isVariable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-sm shadow-sm">
                            <Layers className="w-3 h-3" /> VARIABLE
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-sm shadow-sm">
                            <Package className="w-3 h-3" /> SIMPLE
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm leading-snug h-10">{name}</h3>
                    <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-tighter">{attributes.productNumber}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                    {attributes.categories?.length > 0 ? (
                        attributes.categories.slice(0, 2).map((cat: any) => (
                            <span key={cat.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md dark:bg-gray-700 dark:text-gray-300">
                                {cat.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-[10px]">Sin categoría</span>
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-4 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Precio</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-lg">€{price.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stock</span>
                        <span className={`font-extrabold text-sm ${stock < 5 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                            {stock} {isVariable && <span className="text-[10px] text-gray-400">(T)</span>}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-50 dark:border-gray-700">
                <Link
                    href={`/${lang}/dashboard/products/${product.documentId || product.id}`}
                    className="col-span-3 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-gray-800 text-blue-600 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
                >
                    <Edit className="w-4 h-4" />
                    {dict.edit}
                    <ChevronRight className="w-3 h-3 ml-auto mr-2 text-gray-300" />
                </Link>
                <button
                    onClick={() => onDelete(product.documentId || product.id.toString())}
                    className="col-span-1 flex items-center justify-center p-2 text-red-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

