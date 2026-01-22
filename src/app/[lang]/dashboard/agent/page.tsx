import { getDictionary } from '@/components/dashboard/db';
import AgentWorkspace from '@/components/dashboard/AgentWorkspace';

export default async function AgentPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asistente IA de Catálogo</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Auditoría inteligente del inventario y herramientas de automatización.
                </p>
            </div>

            <AgentWorkspace lang={lang} />
        </div>
    );
}
