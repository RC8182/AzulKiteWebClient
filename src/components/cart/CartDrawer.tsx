'use client';

import { useCart } from '@/store/useCart';
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dictionary } from '../navbar/db';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export default function CartDrawer({ isOpen, onClose, lang }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const t = dictionary[lang as keyof typeof dictionary]?.cartDrawer || dictionary['es'].cartDrawer;

    // Disable body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleCheckout = () => {
        onClose();
        router.push(`/${lang}/checkout`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer Content */}
            <div className={`relative w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 py-4 px-6 h-16 shrink-0">
                    <div className="flex items-center gap-2 text-[#0051B5]">
                        <ShoppingBag size={22} strokeWidth={2.5} />
                        <span className="text-xl font-black italic tracking-tighter uppercase">{t.title}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-400 font-bold ml-1">
                            {getTotalItems()} {t.items}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                            <ShoppingBag size={64} strokeWidth={1} className="opacity-20 translate-y-[-20px]" />
                            <p className="text-sm font-bold tracking-widest uppercase">{t.empty}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-[#0051B5] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#003B95] transition-colors"
                            >
                                {t.continue}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-sm overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-[11px] uppercase tracking-wider text-[#0051B5] line-clamp-2">{item.name}</h4>
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">{item.category}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center border border-gray-100 rounded-none bg-white">
                                                <button
                                                    className="p-1 px-2.5 text-gray-400 hover:text-[#0051B5] transition-colors"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-[11px] text-[#0051B5]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="p-1 px-2.5 text-gray-400 hover:text-[#0051B5] transition-colors"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {item.variant?.discount && item.variant.discount > 0 && item.variant.originalPrice && (
                                                    <span className="text-[10px] text-gray-400 line-through mb-[-2px]">
                                                        {(item.variant.originalPrice * item.quantity).toFixed(2)}€
                                                    </span>
                                                )}
                                                <p className="font-black text-sm text-[var(--color-accent)] italic">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-6 bg-gray-50 mt-auto">
                    <div className="w-full space-y-3 mb-6">
                        <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>{t.subtotal}</span>
                            <span>{getTotalPrice()}€</span>
                        </div>
                        <div className="flex justify-between text-lg font-black italic text-[#0051B5] uppercase">
                            <span>{t.total}</span>
                            <span className="text-[var(--color-accent)]">{getTotalPrice()}€</span>
                        </div>
                    </div>
                    <button
                        className="w-full bg-[var(--color-accent)] text-white font-black tracking-widest py-4 text-xs uppercase hover:bg-[#003B95] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 italic"
                        disabled={items.length === 0 || isLoading}
                        onClick={handleCheckout}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">{t.processing}</span>
                        ) : (
                            <>
                                <ShoppingBag size={16} />
                                {t.checkout}
                            </>
                        )}
                    </button>
                    <p className="text-center text-[9px] font-medium text-gray-300 uppercase tracking-widest mt-4">
                        {t.taxes}
                    </p>
                </div>
            </div>
        </div>
    );
}
