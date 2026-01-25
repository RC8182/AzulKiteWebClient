'use client';

import { Bell, Search, User, Menu } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function DashboardNavbar() {
    const { toggleSidebar } = useDashboard();

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
                        placeholder="Search..."
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
                <button className="flex items-center gap-2 p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <span className="text-sm font-medium dark:text-white hidden sm:inline">Admin</span>
                </button>
            </div>
        </header>
    );
}
