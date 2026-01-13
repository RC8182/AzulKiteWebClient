import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { getCategories } from "@/actions/category-actions";

export default async function ClientLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const categories = await getCategories(lang);

    return (
        <>
            <Navbar lang={lang} categories={categories} />
            {children}
            <Footer lang={lang} />
        </>
    );
}
