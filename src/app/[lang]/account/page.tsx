import { Suspense } from 'react';
import { getUserProfile, getUserOrders } from '@/actions/user-actions';
import Link from 'next/link';
import { Package, User, Wind, ArrowRight, Star } from 'lucide-react';

export default async function AccountPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const profile = await getUserProfile();
    const orders = await getUserOrders();
    const points = profile?.user?.points || 0;

    const recentOrders = orders.slice(0, 3);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Bienvenido, {profile?.user?.name}</h1>
                <p className="text-zinc-500">Este es tu panel de control personal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile Stats */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <User size={24} />
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">Perfil</span>
                    </div>
                    <div className="space-y-1">
                        <p className="opacity-80 text-sm">Nivel de Kitesurf</p>
                        <h3 className="text-2xl font-bold capitalize">{profile?.skillLevel || 'No definido'}</h3>
                    </div>
                    {(!profile?.weight || !profile?.skillLevel) && (
                        <Link
                            href={`/${lang}/account/profile`}
                            className="mt-6 inline-block w-full text-center bg-white text-blue-600 font-medium py-2 rounded-xl text-sm hover:bg-zinc-100 transition-colors"
                        >
                            Completar Perfil
                        </Link>
                    )}
                </div>

                {/* Points Stats */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-500">Loyalty</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-sm">Puntos Acumulados</p>
                        <h3 className="text-2xl font-bold">{points}</h3>
                    </div>
                    <p className="mt-4 text-xs text-zinc-400">
                        Ganas puntos con cada compra confirmada.
                    </p>
                </div>

                {/* Orders Stats */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white">
                            <Package size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-sm">Pedidos Totales</p>
                        <h3 className="text-2xl font-bold">{orders.length}</h3>
                    </div>
                    <div className="mt-6">
                        <Link
                            href={`/${lang}/account/orders`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            Ver historial <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>

            {/* Recent Orders Section */}
            <div>
                <h2 className="text-xl font-bold mb-4">Pedidos Recientes</h2>
                {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold">#{order.orderNumber}</p>
                                    <p className="text-sm text-zinc-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="font-bold">{order.total} {order.currency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Package className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No tienes pedidos aún</h3>
                        <p className="text-zinc-500 mb-4">Explora nuestra tienda y encuentra el mejor equipo.</p>
                        <Link href={`/${lang}/shop`} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                            Ir a la Tienda
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
