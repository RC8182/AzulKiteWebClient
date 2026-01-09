import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default async function ClientLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    return (
        <>
            <Navbar lang={lang} />
            {children}
            <Footer lang={lang} />
        </>
    );
}
