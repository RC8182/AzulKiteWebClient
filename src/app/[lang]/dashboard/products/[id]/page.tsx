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
        const [productEs, productEn, productIt] = await Promise.all([
            getProduct(id, 'es').catch(() => null),
            getProduct(id, 'en').catch(() => null),
            getProduct(id, 'it').catch(() => null),
        ]);

        const baseProduct = productEs || productEn || productIt;

        if (!baseProduct) {
            notFound();
        }

        const product = {
            ...baseProduct,
            attributes: {
                ...(baseProduct.attributes || baseProduct),
                description_es: productEs?.description || '',
                description_en: productEn?.description || '',
                description_it: productIt?.description || '',
            }
        };

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
