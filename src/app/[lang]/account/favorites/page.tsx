import { getUserFavorites, toggleFavorite } from '@/actions/user-actions';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function FavoritesPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const favorites = await getUserFavorites();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Mis Favoritos</h1>
                <p className="text-zinc-500">
                    Guarda los productos que te encantan para más tarde.
                </p>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="bg-pink-50 dark:bg-pink-900/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-pink-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Tu lista de deseos está vacía</h3>
                    <p className="text-zinc-500 mb-6">Explora y guarda lo que te gusta.</p>
                    <Link
                        href={`/${lang}/shop`}
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Explorar Productos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => {
                        const product = fav.product;
                        const translation = product.translations[0]; // Assuming ES locale for now or passed locale
                        const image = product.images[0]?.url || '/placeholder.jpg';

                        return (
                            <div key={fav.id} className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all">
                                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                    <img
                                        src={image}
                                        alt={translation?.name || product.slug}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <form action={async () => {
                                            'use server';
                                            await toggleFavorite(product.id);
                                        }}>
                                            <button className="p-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-1">{translation?.name || product.slug}</h3>
                                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{translation?.shortDescription}</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="font-bold text-xl">
                                            {product.variants?.[0]?.price} €
                                        </div>
                                        <Link
                                            href={`/${lang}/${product.categories?.[0]?.slug || 'shop'}/${product.slug}`}
                                            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Ver Detalles
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
