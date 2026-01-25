import { getDictionary } from '@/components/dashboard/db';
import { getCategories } from '@/actions/category-actions-prisma';
import CategoryTable from '@/components/dashboard/CategoryTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function CategoriesPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);
    const categories = await getCategories(lang);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{dict.categories || 'Categorías'}</h1>
                <Link
                    href={`/${lang}/dashboard/categories/new`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {dict.newCategory || 'Nueva Categoría'}
                </Link>
            </div>

            <CategoryTable categories={categories} />
        </div>
    );
}
