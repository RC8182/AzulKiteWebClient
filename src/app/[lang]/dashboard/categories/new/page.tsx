import CategoryForm from '@/components/dashboard/CategoryForm';
import { getDictionary } from '@/components/dashboard/db';

export default async function NewCategoryPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{dict.newCategory || 'Nueva Categoría'}</h1>
            </div>
            <CategoryForm lang={lang} />
        </div>
    );
}
