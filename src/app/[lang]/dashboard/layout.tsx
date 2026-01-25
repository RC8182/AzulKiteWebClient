import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { DashboardProvider } from '@/context/DashboardContext';
import QuickAddSimpleModal from '@/components/dashboard/QuickAddSimpleModal';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    return (
        <DashboardProvider lang={lang}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
                <div className="flex">
                    {/* Sidebar */}
                    <DashboardSidebar />

                    <div className="flex-1 flex flex-col min-h-screen">
                        {/* Top Navbar */}
                        <DashboardNavbar />

                        {/* Main Content */}
                        <main className="flex-1 p-4 md:p-8">
                            <div className="max-w-7xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>

                {/* Global Modals */}
                <QuickAddSimpleModal />
            </div>
        </DashboardProvider>
    );
}
