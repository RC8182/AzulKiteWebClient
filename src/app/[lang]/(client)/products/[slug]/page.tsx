import { getProductBySlug } from '@/actions/product-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Truck, Undo2, ShieldCheck } from 'lucide-react';
import ProductDetail from '@/components/products/ProductDetail';

interface PageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { lang, slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const { name, category, description_es, description_en, description_it } = product;

    // Choose description based on language
    const description = lang === 'en' ? description_en : lang === 'it' ? description_it : description_es;

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <Link href={`/ ${lang} `} className="hover:text-[#0072f5] transition-colors">Azul Kite</Link>
                        <span>/</span>
                        <Link href={`/ ${lang} /category/${category.toLowerCase()} `} className="hover:text-[#0072f5] transition-colors">{category}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-bold truncate">{name}</span>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Interactive Product Section */}
                <ProductDetail product={product} lang={lang} />

                {/* Features Mini Grid (Static) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 lg:w-max">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Truck className="text-[#0072f5]" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tight leading-tight">Envío Gratis <br /><span className="text-gray-400 text-[8px]">Desde 100€</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Undo2 className="text-[#0072f5]" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tight leading-tight">Devoluciones <br /><span className="text-gray-400 text-[8px]">Por 30 días</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <ShieldCheck className="text-[#0072f5]" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tight leading-tight">Garantía <br /><span className="text-gray-400 text-[8px]">Oficial de Marca</span></span>
                    </div>
                </div>

                {/* Description & Details */}
                <div className="mt-24 max-w-4xl">
                    <div className="inline-block border-b-4 border-[#FF6600] pb-2 mb-12">
                        <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Descripción</h2>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium">
                        {description ? (
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        ) : (
                            <p>No hay descripción disponible para este producto.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
