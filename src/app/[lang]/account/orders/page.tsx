import { getUserOrders } from '@/actions/user-actions';
import { Package, Search } from 'lucide-react';
import Link from 'next/link';

export default async function OrdersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const orders = await getUserOrders();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
                <p className="text-zinc-500">
                    Historial completo de tus compras.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-zinc-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No tienes pedidos aún</h3>
                    <p className="text-zinc-500 mb-6">¿Buscas algo nuevo?</p>
                    <Link
                        href={`/${lang}/shop`}
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Ir a la Tienda
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors shadow-sm"
                        >
                            {/* Order Header */}
                            <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex gap-8">
                                    <div>
                                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">
                                            Pedido
                                        </label>
                                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                            #{order.orderNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">
                                            Fecha
                                        </label>
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">
                                            Total
                                        </label>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                            {order.total} {order.currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                                    {item.productName}
                                                </h4>
                                                <div className="text-sm text-zinc-500 flex gap-3 mt-1">
                                                    <span>Cant: {item.quantity}</span>
                                                    {item.attributes && typeof item.attributes === 'object' && Object.entries(item.attributes).map(([key, value]) => (
                                                        <span key={key} className="capitalize">{String(value)}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right font-medium">
                                                {item.price} €
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
