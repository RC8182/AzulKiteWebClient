import { use } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/components/dashboard/db';
import { getProducts } from '@/actions/product-actions';

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
        productsData = await getProducts(1, 10);
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        connectionError = true;
    }

    const totalProducts = productsData?.meta?.pagination?.total || 0;

    // Count products by category
    const allProducts = productsData?.data || [];
    const categoryCounts = allProducts.reduce((acc: any, product: any) => {
        const category = product.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    // Count AI-generated products
    const aiGeneratedCount = allProducts.filter((p: any) => {
        return p.aiGenerated;
    }).length;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{dict.dashboard}</h1>

            {connectionError && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-200">
                                {dict.error}: No se pudo conectar con el servidor Strapi. Asegúrate de que el backend esté corriendo en <code className="font-mono bg-red-100 dark:bg-red-800 px-1 rounded">http://localhost:1337</code>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{dict.products}</h3>
                    <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{dict.aiGenerated}</h3>
                    <p className="text-3xl font-bold mt-2">{aiGeneratedCount}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{dict.kites}</h3>
                    <p className="text-3xl font-bold mt-2">{categoryCounts.Kites || 0}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{dict.boards}</h3>
                    <p className="text-3xl font-bold mt-2">{categoryCounts.Boards || 0}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
                <div className="flex gap-4">
                    <Link
                        href={`/${lang}/dashboard/products/new`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {dict.newProduct}
                    </Link>
                    <Link
                        href={`/${lang}/dashboard/products`}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {dict.productList}
                    </Link>
                </div>
            </div>
        </div>
    );
}
