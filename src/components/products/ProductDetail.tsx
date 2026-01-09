'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Truck, Undo2, Check } from 'lucide-react';
import { getStrapiMedia } from '@/lib/strapi';
import { useCart } from '@/store/useCart';

interface ProductDetailProps {
    product: any;
    lang: string;
}

export default function ProductDetail({ product, lang }: ProductDetailProps) {
    const { addItem } = useCart();
    const { name, price, description_es, description_en, description_it, category, images, brand, productNumber, colors, sizes, accessories } = product;

    // Choose description based on language
    const description = lang === 'en' ? description_en : lang === 'it' ? description_it : description_es;

    const productImages = images?.data || images || [];

    // State
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(colors && colors.length > 0 ? colors[0] : null);
    const [selectedSize, setSelectedSize] = useState(sizes && sizes.length > 0 ? sizes[0] : null);
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);

    const mainImageUrl = getStrapiMedia(productImages[selectedImage]?.attributes?.url || productImages[selectedImage]?.url) || "https://placehold.co/800x800?text=No+Image";

    const handleAddToCart = () => {
        addItem({
            id: product.documentId || product.id,
            name,
            price,
            category,
            image: getStrapiMedia(productImages[0]?.attributes?.url || productImages[0]?.url) || "",
            // Additional info for cart item
            variant: {
                color: selectedColor,
                size: selectedSize,
                accessories: selectedAccessories
            }
        }, quantity);
        // You could add a toast here
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
                                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-gray-50 flex-shrink-0 ${selectedImage === idx ? 'border-[#0072f5]' : 'border-transparent hover:border-gray-200'
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
                        <span className="text-4xl md:text-5xl font-black text-[#FF6600]">
                            {price}€
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Incl. VAT</span>
                            <span className="text-xs text-[#0072f5] font-bold underline cursor-pointer">Envío calculado en checkout</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Selection - Colors */}
                    {colors && colors.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#003366] uppercase tracking-widest flex items-center gap-2">
                                Color: <span className="text-[#0072f5]">{selectedColor}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color: string) => (
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
                    {sizes && sizes.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#003366] uppercase tracking-widest flex items-center gap-2">
                                Medida: <span className="text-[#0072f5]">{selectedSize}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size: string) => (
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
                    {accessories && accessories.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#003366] uppercase tracking-widest">
                                Accesorios
                            </label>
                            <div className="space-y-2">
                                {accessories.map((acc: string) => (
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
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-green-700">Listo para enviar, 2-5 días laborables</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex items-center border-2 border-gray-100 rounded-2xl px-4 py-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-gray-400 font-black hover:text-[#003366] px-2"
                                >-</button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-12 text-center font-black text-[#003366] focus:outline-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-gray-400 font-black hover:text-[#003366] px-2"
                                >+</button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-grow flex items-center justify-center gap-3 bg-[#FF6600] text-white rounded-2xl px-8 py-4 font-black text-lg hover:bg-[#e65c00] transition-colors shadow-lg shadow-[#FF6600]/20 active:scale-95 duration-200"
                            >
                                <ShoppingCart size={24} />
                                Añadir al Carrito
                            </button>
                        </div>
                        <button className="w-full bg-[#003366] text-white rounded-2xl px-8 py-4 font-black text-lg hover:bg-[#002244] transition-colors shadow-lg shadow-[#003366]/20 active:scale-95 duration-200">
                            Comprar Ahora
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-center gap-8 py-4 border-t border-gray-100 mt-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#003366] transition-colors">
                            <Heart size={16} />
                            Lista de Deseos
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#003366] transition-colors">
                            <Share2 size={16} />
                            Compartir
                        </button>
                    </div>

                    {/* Product meta */}
                    {productNumber && (
                        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center">
                            Product Number: {productNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
