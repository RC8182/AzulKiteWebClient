'use client';

import { Bell, Search, User } from 'lucide-react';

interface DashboardNavbarProps {
    lang: string;
}

export default function DashboardNavbar({ lang }: DashboardNavbarProps) {
    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg w-96">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <span className="text-sm font-medium dark:text-white">Admin</span>
                </button>
            </div>
        </header>
    );
}
