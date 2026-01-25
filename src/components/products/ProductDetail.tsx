'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Truck, Undo2, Check } from 'lucide-react';
import { getStrapiMedia } from '@/lib/media-utils';
import { useCart } from '@/store/useCart';
import { getDictionary, type Language } from './db';

interface ProductDetailProps {
    product: any;
    lang: string;
}

export default function ProductDetail({ product, lang }: ProductDetailProps) {
    const { addItem } = useCart();
    const dict = getDictionary(lang as Language);
    const {
        name,
        price: fallbackProductPrice,
        description: topDescription,
        description_es,
        description_en,
        description_it,
        category: productCategory,
        images,
        brand: topBrand,
        technicalDetails,
        productNumber,
        variants = [],
        accessories = [],
        saleInfo: productSaleInfo = { type: 'None', discountPercent: 0 },
        stock: productStock
    } = product;

    // Brand logic: check top level then technicalDetails
    const brand = topBrand || technicalDetails?.brand;

    // Choose description based on language
    // In Strapi 5 localized fetch, 'description' usually contains the translation for the requested locale
    const description = topDescription || (lang === 'en' ? description_en : lang === 'it' ? description_it : description_es);

    const productImages = images?.data || images || [];
    const productPrice = fallbackProductPrice || 0;

    // Compute unique colors and sizes from variants
    const availableColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];
    const availableSizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];
    const accessoryList = Array.isArray(accessories) ? accessories : (typeof accessories === 'string' ? (accessories as string).split(',').map(s => s.trim()).filter(Boolean) : []) as string[];

    // State
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(availableColors.length > 0 ? availableColors[0] : null);
    const [selectedSize, setSelectedSize] = useState(availableSizes.length > 0 ? availableSizes[0] : null);
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);

    // Find current variant based on selection to get stock and price
    const currentVariant = variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);

    // Logic: If variants exist, depend on variant stock. If not, use product-level stock.
    const stock = variants.length > 0 ? (currentVariant?.stock ?? 0) : (productStock ?? 0);

    // Price logic also needs similar fallback if no variants
    const variantPrice = currentVariant?.price || productPrice || 0;
    const variantSaleInfo = currentVariant?.saleInfo;
    const variantDiscount = (variantSaleInfo?.discountPercent > 0) ? (variantSaleInfo.discountPercent || 0) : (productSaleInfo?.discountPercent || 0);
    const finalPrice = variantDiscount > 0 ? variantPrice * (1 - variantDiscount / 100) : variantPrice;

    const activeBadge = (variantSaleInfo?.type && variantSaleInfo.type !== 'None') ? variantSaleInfo.type : (productSaleInfo?.type || 'None');


    const mainImageUrl = getStrapiMedia(productImages[selectedImage]?.attributes?.url || productImages[selectedImage]?.url) || "https://placehold.co/800x800?text=No+Image";

    const handleAddToCart = () => {
        if (stock === 0) return;
        addItem({
            id: product.documentId || product.id,
            name: name,
            price: finalPrice,
            category: productCategory,
            image: getStrapiMedia(productImages[0]?.attributes?.url || productImages[0]?.url) || "",
            // Additional info for cart item
            variant: {
                color: selectedColor,
                size: selectedSize,
                accessories: selectedAccessories,
                originalPrice: variantPrice,
                discount: variantDiscount
            }
        }, quantity);
    };

    const toggleAccessory = (acc: string) => {
        setSelectedAccessories(prev =>
            prev.includes(acc) ? prev.filter(item => item !== acc) : [...prev, acc]
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Gallery Section */}
            <div className="lg:col-span-7 space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
                    <Image
                        src={mainImageUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                    {brand && (
                        <div className="absolute top-6 right-6 z-10">
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm font-black text-[#003366] tracking-tighter uppercase italic">{brand}</p>
                            </div>
                        </div>
                    )}
                </div>

                {productImages.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {productImages.map((img: any, idx: number) => {
                            const thumbUrl = getStrapiMedia(img?.attributes?.url || img?.url) || "https://placehold.co/400x400";
                            return (
                                <div
                                    key={img.id || idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-23 h-23 md:w-24 md:h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-gray-50 flex-shrink-0 ${selectedImage === idx ? 'border-[#0072f5]' : 'border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    <Image
                                        src={thumbUrl}
                                        alt={`${name} thumb ${idx}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0">
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h1 className="text-3xl md:text-5xl font-black text-[#003366] leading-tight tracking-tight">
                            {name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex flex-col">
                            {(activeBadge !== 'None' || variantDiscount > 0) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-400 line-through">
                                        {variantPrice.toFixed(2)}€
                                    </span>
                                    <span className="bg-[#FF6600] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">
                                        {variantDiscount > 0 ? `-${variantDiscount}%` : activeBadge}
                                    </span>
                                </div>
                            )}
                            <span className="text-4xl md:text-5xl font-black text-[#003366] italic tracking-tighter">
                                {finalPrice.toFixed(2)}€
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{dict.product.stock.inclVat}</span>
                            <span className="text-xs text-[#0072f5] font-bold underline cursor-pointer hover:text-[#005bb5] transition-colors">{dict.product.stock.shippingCalc}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Selection - Colors */}
                    {availableColors.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#003366] uppercase tracking-widest flex items-center gap-2">
                                {dict.product.color}: <span className="text-[#0072f5]">{selectedColor}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableColors.map((color: any) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-6 py-2 rounded-xl border-2 font-bold text-sm transition-all ${selectedColor === color
                                            ? 'border-[#0072f5] bg-[#0072f5]/5 text-[#0072f5]'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selection - Sizes */}
                    {availableSizes.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#003366] uppercase tracking-widest flex items-center gap-2">
                                {dict.product.size}: <span className="text-[#0072f5]">{selectedSize}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size: any) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-6 py-2 rounded-xl border-2 font-bold text-sm transition-all ${selectedSize === size
                                            ? 'border-[#0072f5] bg-[#0072f5]/5 text-[#0072f5]'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selection - Accessories */}
                    {accessoryList.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#003366] uppercase tracking-widest">
                                {dict.product.accessories}
                            </label>
                            <div className="space-y-2">
                                {accessoryList.map((acc: any) => (
                                    <div
                                        key={acc}
                                        onClick={() => toggleAccessory(acc)}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer group ${selectedAccessories.includes(acc)
                                            ? 'border-[#0072f5] bg-[#0072f5]/5'
                                            : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <span className={`text-sm font-bold ${selectedAccessories.includes(acc) ? 'text-[#003366]' : 'text-gray-600'
                                            }`}>{acc}</span>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedAccessories.includes(acc) ? 'border-[#0072f5] bg-[#0072f5]' : 'border-gray-200 group-hover:border-[#0072f5]'
                                            }`}>
                                            {selectedAccessories.includes(acc) && <Check size={12} className="text-white" strokeWidth={4} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Status */}
                    <div className="flex items-center gap-3 py-2">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-bold ${stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {stock > 0 ? `${dict.product.stock.inStock} (${stock} ${dict.product.stock.units}), ${dict.product.stock.shipping}` : dict.product.stock.outOfStock}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex items-center border-2 border-gray-100 rounded-2xl px-4 py-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-gray-400 font-black hover:text-[#003366] px-2 transition-colors"
                                >-</button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-12 text-center font-black text-[#003366] focus:outline-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-gray-400 font-black hover:text-[#003366] px-2 transition-colors"
                                >+</button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-grow flex items-center justify-center gap-3 bg-[#FF6600] text-white rounded-2xl px-8 py-4 font-black text-lg hover:bg-[#e65c00] transition-colors shadow-lg shadow-[#FF6600]/20 active:scale-95 duration-200 uppercase tracking-tight"
                            >
                                <ShoppingCart size={24} />
                                {dict.product.actions.addToCart}
                            </button>
                        </div>
                        <button className="w-full bg-[#003366] text-white rounded-2xl px-8 py-4 font-black text-lg hover:bg-[#002244] transition-colors shadow-lg shadow-[#003366]/20 active:scale-95 duration-200 uppercase tracking-tight">
                            {dict.product.actions.buyNow}
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-center gap-8 py-4 border-t border-gray-100 mt-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#003366] transition-colors uppercase tracking-wider">
                            <Heart size={16} />
                            {dict.product.actions.wishlist}
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#003366] transition-colors uppercase tracking-wider">
                            <Share2 size={16} />
                            {dict.product.actions.share}
                        </button>
                    </div>

                    {/* Product meta */}
                    {productNumber && (
                        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center">
                            {dict.product.sku}: {productNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

