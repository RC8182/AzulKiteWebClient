'use client';

import { ShoppingBag, Star, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/store/useCart';

interface ProductCardProps {
    product: any;
    lang: string;
}

export default function ProductCard({ product, lang }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const addToCart = useCart((state) => state.addItem);
    
    const mainImage = product.images?.[0] || product.attributes?.images?.data?.[0];
    const imageUrl = mainImage?.url || mainImage?.attributes?.url || '/placeholder-product.jpg';
    const imageAlt = mainImage?.alternativeText || mainImage?.attributes?.alternativeText || product.name;
    
    // Obtener precio de la primera variant
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.price || product.price || product.attributes?.price || 0;
    const discountPrice = firstVariant?.saleInfo?.discountPercent ? 
        price * (1 - (firstVariant.saleInfo.discountPercent / 100)) : 
        product.discountPrice || product.attributes?.discountPrice;
    const hasDiscount = discountPrice && discountPrice < price;
    
    const category = product.category || product.attributes?.category?.data?.attributes;
    const categoryName = category?.name || 'Kitesurf';
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        addToCart({
            id: product.id || product.documentId,
            name: product.name,
            price: discountPrice || price,
            image: imageUrl,
            category: categoryName,
        }, 1);
    };

    return (
        <Link href={`/${lang}/products/${product.slug || product.attributes?.slug}`}>
            <div 
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {imageUrl && (
                        <Image
                            src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:1337${imageUrl}`}
                            alt={imageAlt}
                            fill
                            className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Tag size={10} />
                            -{Math.round((1 - discountPrice / price) * 100)}%
                        </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        {categoryName}
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className={`absolute bottom-3 right-3 bg-[var(--color-accent)] text-white p-2.5 rounded-full shadow-lg transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                    >
                        <ShoppingBag size={18} />
                    </button>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                    {/* Category */}
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {categoryName}
                    </div>
                    
                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                        {product.name || product.attributes?.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={14} 
                                    className={`${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">(4.0)</span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                        {hasDiscount ? (
                            <>
                                <span className="text-lg font-bold text-gray-900">
                                    {discountPrice.toFixed(2)}€
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {price.toFixed(2)}€
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">
                                {price.toFixed(2)}€
                            </span>
                        )}
                    </div>
                    
                    {/* Product Number */}
                    <div className="text-xs text-gray-400 mt-2">
                        Ref: {product.productNumber || product.sku || 'N/A'}
                    </div>
                </div>
            </div>
        </Link>
    );
}