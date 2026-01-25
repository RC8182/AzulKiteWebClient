'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/context/DashboardContext';
import { deletePage } from '@/actions/page-actions-prisma';
import { Edit, Trash2, Search, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Page {
    id: string;
    title: string;
    slug: string;
    published: boolean;
}

interface PageTableProps {
    pages: Page[];
}

export default function PageTable({ pages }: PageTableProps) {
    const { lang, dict } = useDashboard();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPages = pages.filter((page) => {
        const title = page.title || '';
        const slug = page.slug || '';

        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slug.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDelete = async (id: string) => {
        if (confirm(dict.confirmDelete || '¿Estás seguro de que quieres eliminar esta página?')) {
            const result = await deletePage(id);
            if (result.success) {
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
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Título</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Slug</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">{dict.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {filteredPages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{page.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                            {page.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        {page.published ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 tracking-tight">
                                                <CheckCircle className="w-3 h-3" /> PUBLICADO
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 tracking-tight">
                                                <XCircle className="w-3 h-3" /> BORRADOR
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/${lang}/dashboard/pages/${page.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl dark:hover:bg-blue-900/20 transition-colors"
                                                title={dict.edit}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(page.id)}
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

            {/* Mobile View */}
            <div className="lg:hidden grid gap-4">
                {filteredPages.map((page) => (
                    <div key={page.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{page.title}</h3>
                                    <code className="text-xs text-gray-500">{page.slug}</code>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Link
                                    href={`/${lang}/dashboard/pages/${page.id}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(page.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            {page.published ? (
                                <span className="text-xs font-bold text-green-600">Publicado</span>
                            ) : (
                                <span className="text-xs font-bold text-gray-500">Borrador</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPages.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron páginas.</p>
                </div>
            )}
        </div>
    );
}
