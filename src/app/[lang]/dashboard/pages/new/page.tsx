import PageForm from '@/components/dashboard/PageForm';
import { getDictionary } from '@/components/dashboard/db';

export default async function NewPagePage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{dict.newPage || 'Nueva Página'}</h1>
            </div>
            <PageForm lang={lang} />
        </div>
    );
}
