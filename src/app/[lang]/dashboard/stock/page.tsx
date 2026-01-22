import StockManagement from '@/components/dashboard/StockManagement';

export default async function StockPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Control de Stock</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Gestión rápida de inventario por variantes y productos.
                </p>
            </div>

            <StockManagement lang={lang} />
        </div>
    );
}
