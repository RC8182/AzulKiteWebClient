import { use } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/components/dashboard/db';
import { getProducts } from '@/actions/product-actions';
import ProductTable from '@/components/dashboard/ProductTable';
import { Plus } from 'lucide-react';

export default async function ProductsPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);
    const productsData = await getProducts(1, 50, null, lang);
    const products = productsData?.data || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{dict.productList}</h1>
                <Link
                    href={`/${lang}/dashboard/products/new`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {dict.newProduct}
                </Link>
            </div>

            <ProductTable products={products} lang={lang} />
        </div>
    );
}
