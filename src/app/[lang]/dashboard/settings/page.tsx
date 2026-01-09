import { getDictionary } from '@/components/dashboard/db';

export default async function SettingsPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{dict.settings}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 dark:text-gray-400">
                    Opciones de configuración del sistema (Próximamente).
                </p>

                <div className="mt-8 space-y-6">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-lg font-medium">Idioma del Panel</h3>
                        <p className="text-sm text-gray-500">El idioma del panel se detecta automáticamente de la URL.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
