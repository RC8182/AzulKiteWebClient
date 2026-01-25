'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings, Database, Bot, X, FileText, ImageIcon, Layers } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { lang, dict, isSidebarOpen, setSidebarOpen } = useDashboard();

    const navigationGroups = [
        {
            title: 'Resumen',
            items: [
                { name: dict.dashboard, href: `/${lang}/dashboard`, icon: LayoutDashboard },
            ]
        },
        {
            title: 'Tienda',
            items: [
                { name: dict.products, href: `/${lang}/dashboard/products`, icon: Package },
                { name: dict.categories, href: `/${lang}/dashboard/categories`, icon: Layers },
                { name: dict.navStock || 'Stock', href: `/${lang}/dashboard/stock`, icon: Database },
            ]
        },
        {
            title: 'Contenido',
            items: [
                { name: dict.pages, href: `/${lang}/dashboard/pages`, icon: FileText },
                { name: dict.media, href: `/${lang}/dashboard/media`, icon: ImageIcon },
            ]
        },
        {
            title: 'IA & Automatización',
            items: [
                { name: 'Asistente IA', href: `/${lang}/dashboard/agent`, icon: Bot },
            ]
        },
        {
            title: 'Sistema',
            items: [
                { name: dict.settings, href: `/${lang}/dashboard/settings`, icon: Settings },
            ]
        }
    ];

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto
    `;

    return (
        <>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="p-6 flex items-center justify-between">
                    <Link href={`/${lang}/dashboard`} className="flex flex-col">
                        <h2 className="text-2xl font-black text-[#003366] dark:text-white uppercase tracking-tighter italic">
                            Azul <span className="text-[#FF6600]">Kite</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Dashboard</p>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="px-4 pb-8 space-y-6">
                    {navigationGroups.map((group) => (
                        <div key={group.title} className="space-y-1">
                            <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                                ? 'bg-[#003366] text-white shadow-lg shadow-blue-900/20'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-[#003366] dark:hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className="text-sm font-semibold">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
