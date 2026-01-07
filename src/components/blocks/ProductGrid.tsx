'use client';

import { Card, CardBody, CardFooter, Button, Chip } from '@heroui/react';
import { getStrapiMedia } from '@/lib/strapi';
import { useCart } from '@/store/useCart';
import { useProductFilters } from '@/hooks/useProductFilters';
import { ShoppingCart, Filter } from 'lucide-react';
import { useMemo } from 'react';
import NextImage from 'next/image';

interface ProductGridProps {
    title: string;
    products: any[];
}

const CATEGORIES = ["Kites", "Boards", "Harnesses", "Wetsuits", "Accessories"];

export default function ProductGrid({ title, products }: ProductGridProps) {
    const addItem = useCart((state) => state.addItem);
    const { filters, setFilter } = useProductFilters();

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((p) => {
            const matchesCategory = !filters.category || p.category === filters.category;
            const matchesSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, filters]);

    if (!products) return null;

    return (
        <section className="py-20 px-4 bg-gray-50/50">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">
                        {title}
                    </h2>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                        <Button
                            size="sm"
                            variant={!filters.category ? "solid" : "flat"}
                            color={!filters.category ? "primary" : "default"}
                            onPress={() => setFilter('category', '')}
                            radius="full"
                            className="font-bold"
                        >
                            Todos
                        </Button>
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat}
                                size="sm"
                                variant={filters.category === cat ? "solid" : "flat"}
                                color={filters.category === cat ? "primary" : "default"}
                                onPress={() => setFilter('category', cat)}
                                radius="full"
                                className="font-bold shrink-0"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-xl text-gray-500 font-medium">No se encontraron productos con estos filtros.</p>
                        <Button variant="light" color="primary" onPress={() => setFilter('category', '')} className="mt-4 font-bold">
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <Card key={product.id} shadow="sm" className="border-none bg-white group hover:-translate-y-1 transition-transform duration-300">
                                <CardBody className="p-0 relative overflow-hidden aspect-square">
                                    <NextImage
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src={getStrapiMedia(product.images?.[0]?.url) || "https://placehold.co/400x400?text=No+Image"}
                                        fill
                                    />
                                    <div className="absolute top-3 right-3 z-10">
                                        <Chip size="sm" color="primary" variant="flat" className="bg-white/90 backdrop-blur font-bold">
                                            {product.category}
                                        </Chip>
                                    </div>
                                </CardBody>
                                <CardFooter className="flex flex-col items-start gap-1 p-5">
                                    <h3 className="text-lg font-bold line-clamp-1">{product.name}</h3>
                                    <div className="flex justify-between items-center w-full mt-3">
                                        <p className="text-2xl font-black text-[var(--color-primary)]">
                                            {product.price}€
                                        </p>
                                        <Button
                                            size="sm"
                                            isIconOnly
                                            radius="full"
                                            className="bg-[var(--color-accent)] text-white shadow-lg shadow-orange-500/30"
                                            onPress={() => addItem({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                category: product.category,
                                                image: getStrapiMedia(product.images?.[0]?.url) || "https://placehold.co/400x400?text=No+Image"
                                            })}
                                        >
                                            <ShoppingCart size={18} />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
