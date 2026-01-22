import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
            <div className="flex">
                {/* Sidebar */}
                <DashboardSidebar lang={lang} />

                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Top Navbar */}
                    <DashboardNavbar lang={lang} />

                    {/* Main Content */}
                    <main className="flex-1 p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
