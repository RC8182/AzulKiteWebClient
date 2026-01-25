import { getDictionary } from '@/components/dashboard/db';
import { getProducts } from '@/actions/product-actions-prisma';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { AlertCircle } from 'lucide-react';

export default async function DashboardPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);

    let productsData = { data: [], meta: { pagination: { total: 0 } } };
    let connectionError = false;

    try {
        productsData = await getProducts(1, 100, null, lang);
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        connectionError = true;
    }

    const allProducts = productsData?.data || [];
    const totalProducts = productsData?.meta?.pagination?.total || 0;

    // Stats calculation
    const aiGeneratedCount = allProducts.filter((p: any) => {
        return p.aiGenerated;
    }).length;

    // Health Check logic
    const lowStockProducts = allProducts.filter((p: any) => {
        const variantStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
        return variantStock < 5;
    });

    const missingDescription = allProducts.filter((p: any) => {
        const translation = p.translations?.[0];
        return !translation?.description || translation.description.length < 10;
    });

    const uncategorized = allProducts.filter((p: any) => {
        return !p.categories || p.categories.length === 0;
    });

    const healthScore = totalProducts === 0 ? 100 : Math.round(
        ((totalProducts - (lowStockProducts.length + missingDescription.length + uncategorized.length)) / totalProducts) * 100
    );

    return (
        <div className="pb-12">
            {connectionError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex gap-4 items-start mb-8">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-red-800 dark:text-red-200 font-bold">Error de Conexión backend</h3>
                         <p className="text-red-700/80 dark:text-red-300/80 text-sm mt-1">
                             No se pudo conectar con la base de datos. Verifica que PostgreSQL esté activo.
                         </p>
                    </div>
                </div>
            )}

            <DashboardOverview
                dict={dict}
                lang={lang}
                totalProducts={totalProducts}
                aiGeneratedCount={aiGeneratedCount}
                healthScore={healthScore}
                lowStockCount={lowStockProducts.length}
                missingDescriptionCount={missingDescription.length}
                uncategorizedCount={uncategorized.length}
                recentProducts={allProducts}
            />
        </div>
    );
}

