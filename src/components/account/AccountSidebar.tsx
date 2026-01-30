'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Heart, LogOut, LayoutDashboard, Star } from 'lucide-react';

export default function AccountSidebar({ lang, user }: { lang: string, user: any }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === `/${lang}/account${path}`;

    const links = [
        { href: '', label: 'Overview', icon: LayoutDashboard },
        { href: '/profile', label: 'Mi Perfil', icon: User },
        { href: '/orders', label: 'Mis Pedidos', icon: Package },
        { href: '/favorites', label: 'Favoritos', icon: Heart },
        // { href: '/points', label: 'Mis Puntos', icon: Star }, // Future implementation
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mb-3 overflow-hidden border-2 border-blue-500">
                    {user?.image ? (
                        <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user?.name?.charAt(0) || 'U'}</span>
                    )}
                </div>
                <h3 className="font-bold text-lg">{user?.name}</h3>
                <p className="text-sm text-zinc-500">{user?.email}</p>
                {user?.points !== undefined && (
                    <div className="mt-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        {user.points} Puntos
                    </div>
                )}
            </div>

            <nav className="space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={`/${lang}/account${link.href}`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Link
                        href="/api/auth/signout"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
