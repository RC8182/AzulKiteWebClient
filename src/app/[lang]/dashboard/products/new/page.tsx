
import { getDictionary } from '@/components/dashboard/db';
import ProductForm from '@/components/dashboard/ProductForm';

export default async function NewProductPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{dict.newProduct}</h1>
            <ProductForm lang={lang} />
        </div>
    );
}

