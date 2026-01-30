import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { getCategories } from "@/actions/category-actions";
import { getGlobalData } from "@/actions/global-actions";
import { WindSocketProvider } from "@/components/navbar/wind-context/WindSocketContext";
import { AuthProvider } from "@/components/providers/SessionProvider";

export default async function ClientLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    // Skip global fetch for invalid routes (like browser-internal requests)
    if (lang === 'favicon.ico' || lang.includes('.')) {
        return <>{children}</>;
    }

    const [categories, globalData] = await Promise.all([
        getCategories(lang),
        getGlobalData(lang)
    ]);

    return (
        <AuthProvider>
            <WindSocketProvider>
                <Navbar lang={lang} categories={categories} />
                {children}
                <Footer lang={lang} customDescription={globalData?.footerText || undefined} />
            </WindSocketProvider>
        </AuthProvider>
    );
}
