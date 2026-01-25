'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getDictionary, type Language } from '@/components/dashboard/db';

interface DashboardContextType {
    lang: string;
    dict: any;
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    isQuickAddOpen: boolean;
    setQuickAddOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
    children,
    lang
}: {
    children: ReactNode;
    lang: string;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isQuickAddOpen, setQuickAddOpen] = useState(false);
    const dict = getDictionary(lang as Language);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <DashboardContext.Provider
            value={{
                lang,
                dict,
                isSidebarOpen,
                setSidebarOpen,
                toggleSidebar,
                isQuickAddOpen,
                setQuickAddOpen
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
