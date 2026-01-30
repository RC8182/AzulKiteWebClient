'use client';

import { Bell, Search, User, Menu, LogOut, Settings, Home, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDictionary, Language } from './db';
import Link from 'next/link';

export default function DashboardNavbar() {
    const { toggleSidebar } = useDashboard();
    const { data: session } = useSession();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    const lang = (params?.lang as Language) || 'es';
    const dict = getDictionary(lang);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userInitial = session?.user?.name?.substring(0, 1).toUpperCase() ||
        session?.user?.email?.substring(0, 1).toUpperCase() || 'A';

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden sm:flex items-center gap-4 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg w-64 md:w-96">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder={`${dict.search}...`}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white"
                    />
                </div>

                {/* Mobile search icon only */}
                <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Search className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden xs:block" />

                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all">
                            {userInitial}
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-none">
                            <span className="text-sm font-bold dark:text-white">
                                {session?.user?.name?.split(' ')[0] || 'Admin'}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                                Dashboard
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 truncate">
                                    {session?.user?.name || 'Administrador'}
                                </p>
                                <p className="text-[10px] font-medium text-gray-400 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>

                            <Link
                                href={`/${lang}`}
                                className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <Home size={16} />
                                {dict.home}
                            </Link>

                            <Link
                                href={`/${lang}/account`}
                                className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <User size={16} />
                                {dict.profile}
                            </Link>

                            <div className="px-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} />
                                    {dict.logout}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
