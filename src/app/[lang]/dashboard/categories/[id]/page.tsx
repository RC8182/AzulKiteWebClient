import CategoryForm from '@/components/dashboard/CategoryForm';
import { getDictionary } from '@/components/dashboard/db';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditCategoryPage({
    params
}: {
    params: Promise<{ lang: string, id: string }>
}) {
    const { lang, id } = await params;
    const dict = getDictionary(lang as any);

    // Fetch category with ALL translations directly for editing
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            translations: true,
            parent: true
        }
    });

    if (!category) {
        notFound();
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{dict.editCategory || 'Editar Categoría'}</h1>
            </div>
            <CategoryForm lang={lang} category={category} />
        </div>
    );
}
