import { use } from 'react';
import { getDictionary } from '@/components/dashboard/db';
import { getProduct } from '@/actions/product-actions';
import ProductForm from '@/components/dashboard/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string, lang: string }>;
}) {
    const { id, lang } = await params;
    const dict = getDictionary(lang as any);

    try {
        const product = await getProduct(id);

        if (!product) {
            notFound();
        }

        return (
            <div>
                <h1 className="text-3xl font-bold mb-8">
                    {dict.edit}: {product.name || '...'}
                </h1>
                <ProductForm lang={lang} product={product} />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
