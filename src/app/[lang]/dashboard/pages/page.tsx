import { getDictionary } from '@/components/dashboard/db';
import { getPages } from '@/actions/page-actions-prisma';
import PageTable from '@/components/dashboard/PageTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function PagesListPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);
    const pages = await getPages(lang);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{dict.pages || 'Páginas'}</h1>
                <Link
                    href={`/${lang}/dashboard/pages/new`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {dict.newPage || 'Nueva Página'}
                </Link>
            </div>

            <PageTable pages={pages} />
        </div>
    );
}
