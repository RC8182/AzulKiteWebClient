'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/context/DashboardContext';
import { deleteCategory } from '@/actions/category-actions-prisma';
import { Edit, Trash2, Search, Package, Layers, FolderTree } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    parent?: { name: string };
    children?: any[];
    _count?: {
        products: number;
        children: number;
    };
}

interface CategoryTableProps {
    categories: Category[];
}

export default function CategoryTable({ categories }: CategoryTableProps) {
    const { lang, dict } = useDashboard();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = categories.filter((category) => {
        const name = category.name || '';
        const slug = category.slug || '';

        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slug.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDelete = async (id: string) => {
        if (confirm(dict.confirmDelete || '¿Estás seguro de que quieres eliminar esta categoría?')) {
            const result = await deleteCategory(id);
            if (result.success) {
                // Refresh handled by server action revalidatePath, but client update might need reload or state update
                // For simplicity similar to ProductTable
                window.location.reload();
            } else {
                alert(`${dict.error || 'Error'}: ${result.error}`);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={dict.search || 'Buscar...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none"
                    />
                </div>
            </div>

            {/* Desktop View: Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{dict.name}</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Slug</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Padre</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Subcategorías</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Productos</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">{dict.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <FolderTree className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                            {category.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        {category.parent ? (
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {category.parent.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Raíz</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium">{category._count?.children || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium">{category._count?.products || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/${lang}/dashboard/categories/${category.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl dark:hover:bg-blue-900/20 transition-colors"
                                                title={dict.edit}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/20 transition-colors"
                                                title={dict.delete}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: Simple List */}
            <div className="lg:hidden grid gap-4">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FolderTree className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                                    <code className="text-xs text-gray-500">{category.slug}</code>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Link
                                    href={`/${lang}/dashboard/categories/${category.id}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" /> {category._count?.products || 0} Productos
                            </div>
                            <div className="flex items-center gap-1">
                                <Layers className="w-4 h-4" /> {category._count?.children || 0} Subcategorías
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron categorías.</p>
                </div>
            )}
        </div>
    );
}
