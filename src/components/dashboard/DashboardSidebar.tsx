'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDictionary, type Language } from './db';
import { LayoutDashboard, Package, Settings, FileText } from 'lucide-react';

interface DashboardSidebarProps {
    lang: string;
}

export default function DashboardSidebar({ lang }: DashboardSidebarProps) {
    const pathname = usePathname();
    const dict = getDictionary(lang as Language);

    const navigation = [
        {
            name: dict.dashboard,
            href: `/${lang}/dashboard`,
            icon: LayoutDashboard,
        },
        {
            name: dict.products,
            href: `/${lang}/dashboard/products`,
            icon: Package,
        },
        {
            name: dict.settings,
            href: `/${lang}/dashboard/settings`,
            icon: Settings,
        },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-600">Azul Kite</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dashboard</p>
            </div>

            <nav className="px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
