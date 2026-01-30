import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AccountSidebar from '@/components/account/AccountSidebar';
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { getCategories } from "@/actions/category-actions";
import { getGlobalData } from "@/actions/global-actions";
import { WindSocketProvider } from "@/components/navbar/wind-context/WindSocketContext";
import { AuthProvider } from "@/components/providers/SessionProvider";

export default async function AccountLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const session = await auth();
    const { lang } = await params;

    // If not authenticated, redirect to sign in
    if (!session) {
        redirect(`/${lang}/auth/signin?callbackUrl=/${lang}/account`);
    }

    const [categories, globalData] = await Promise.all([
        getCategories(lang),
        getGlobalData(lang)
    ]);

    return (
        <AuthProvider>
            <WindSocketProvider>
                <div className="flex flex-col min-h-screen">
                    <Navbar lang={lang} categories={categories} />
                    <div className="container mx-auto px-4 py-12 flex-grow">
                        <div className="flex flex-col md:flex-row gap-8">
                            <aside className="w-full md:w-64 flex-shrink-0">
                                <div className="sticky top-24">
                                    <AccountSidebar lang={lang} user={session.user} />
                                </div>
                            </aside>
                            <main className="flex-1">
                                {children}
                            </main>
                        </div>
                    </div>
                    <Footer lang={lang} customDescription={globalData?.footerText || undefined} />
                </div>
            </WindSocketProvider>
        </AuthProvider>
    );
}
