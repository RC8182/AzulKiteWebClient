import { getPageBySlug } from "@/actions/page-actions-prisma";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { notFound } from "next/navigation";

interface GenericPageProps {
    params: Promise<{ lang: string; slug: string }>;
}

export default async function GenericPage({ params }: GenericPageProps) {
    const { lang, slug } = await params;

    // Skip checkout route
    if (slug === 'checkout') return null;

    // Skip file-like extensions
    if (slug.includes('.')) {
        notFound();
    }

    const page = await getPageBySlug(slug, lang);

    if (!page) {
        notFound();
    }

    const hasHero = page.blocks?.some((b: any) =>
        b.type === 'hero' || b.type === 'hero-slider'
    );

    return (
        <main className="min-h-screen">
            {!hasHero && page.title && (
                <div className="bg-[#003366] text-white py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                            {page.title}
                        </h1>
                    </div>
                </div>
            )}
            <BlockRenderer blocks={page.blocks || []} />
        </main>
    );
}
