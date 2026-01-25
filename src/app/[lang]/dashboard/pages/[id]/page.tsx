import PageForm from '@/components/dashboard/PageForm';
import { getDictionary } from '@/components/dashboard/db';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditPagePage({
    params
}: {
    params: Promise<{ lang: string, id: string }>
}) {
    const { lang, id } = await params;
    const dict = getDictionary(lang as any);

    // Fetch page with ALL translations and blocks for editing
    const page = await prisma.page.findUnique({
        where: { id },
        include: {
            translations: true,
            blocks: {
                include: {
                    translations: true
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });

    if (!page) {
        notFound();
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{dict.editPage || 'Editar Página'}</h1>
            </div>
            <PageForm lang={lang} page={page} />
        </div>
    );
}
