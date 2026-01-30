'use client';

import { useCart } from '@/store/useCart';
import { ShoppingBag, ChevronRight, Trash2, Plus, Minus, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { createCheckoutSession } from '@/actions/checkout';
import { useState, use } from 'react';
import Link from 'next/link';
import { getDictionary } from './db';
import AddonPaymentForm from '@/components/checkout/AddonPaymentForm';

interface CheckoutPageProps {
    params: Promise<{
        lang: string;
    }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
    const { lang } = use(params);
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<{ url: string; params: string; signature: string; version: string } | null>(null);
    const dict = getDictionary(lang);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'ES',
        phone: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await createCheckoutSession({
                customer_email: formData.email,
                shipping_address: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    addressLine1: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    phone: formData.phone
                },
                products: items.map(item => ({
                    id: String(item.id),
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image,
                    color: item.variant?.color,
                    size: item.variant?.size
                })),
            });

            if (result.error) throw new Error(result.error);
            if (!result.paymentData) throw new Error('No payment data returned');

            setPaymentData(result.paymentData);
            // Form inside AddonPaymentForm will auto-submit
        } catch (err: any) {
            alert(err.message || 'Error processing payment');
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                    <ShoppingBag size={48} className="text-gray-200" />
                </div>
                <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter mb-4 italic">
                    {dict.empty}
                </h1>
                <Link
                    href={`/${lang}`}
                    className="bg-[#0051B5] text-white font-black px-10 py-4 text-xs uppercase tracking-widest hover:bg-[#003B95] transition-all italic"
                >
                    {dict.continue}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Hidden Auto-Submit Form */}
            {paymentData && <AddonPaymentForm {...paymentData} />}

            {/* Header */}
            <div className="bg-white border-b border-gray-100 mb-8">
                <div className="container mx-auto px-4 py-8">
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        <Link href={`/${lang}`} className="hover:text-[#0051B5] transition-colors">Azul Kite</Link>
                        <ChevronRight size={10} />
                        <span className="text-[#0051B5]">{dict.checkout}</span>
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter italic">
                        {dict.title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Form & Items */}
                    <div className="flex-grow space-y-8">

                        {/* Shipping Form */}
                        <div className="bg-white p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0051B5] mb-8 flex items-center gap-2">
                                <ShieldCheck size={14} />
                                {dict.checkout} {/* Assuming 'Checkout' or 'Shipping' */}
                            </h2>
                            <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" placeholder="tu@email.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre</label>
                                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Apellidos</label>
                                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Dirección</label>
                                    <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Ciudad</label>
                                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Código Postal</label>
                                    <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">País</label>
                                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors">
                                        <option value="ES">España</option>
                                        <option value="PT">Portugal</option>
                                        <option value="FR">Francia</option>
                                        <option value="IT">Italia</option>
                                        <option value="DE">Alemania</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Teléfono</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0051B5] transition-colors" />
                                </div>
                            </form>
                        </div>

                        {/* Items List */}
                        <div className="bg-white p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0051B5] mb-8 flex items-center gap-2">
                                <ShoppingBag size={14} />
                                {dict.summary} ({getTotalItems()})
                            </h2>
                            <div className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <div key={item.id} className="py-6 flex gap-6">
                                        <div className="w-24 h-24 bg-gray-50 border border-gray-100 p-2 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-black text-[11px] uppercase tracking-wider text-[#003366] mb-1">{item.name}</h3>
                                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end mt-4">
                                                <div className="flex items-center border border-gray-100 bg-white">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 text-gray-400 hover:text-[#0051B5]"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-10 text-center font-bold text-xs text-[#003366]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 text-gray-400 hover:text-[#0051B5]"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <p className="font-black text-xl text-[#FF6600] italic">{item.price * item.quantity}€</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 border border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#0051B5]">
                                    <Truck size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">Envío Express <br /><span className="text-gray-300">24/48 Horas</span></span>
                            </div>
                            <div className="bg-white p-6 border border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">Pago Seguro <br /><span className="text-gray-300">Encriptación SSL</span></span>
                            </div>
                            <div className="bg-white p-6 border border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-[#FF6600]">
                                    <CreditCard size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">Garantía Oficial <br /><span className="text-gray-300">2 Años de Fábrica</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:w-[400px] shrink-0">
                        <div className="bg-[#003366] p-8 text-white sticky top-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-10 pb-4 border-b border-white/10">
                                {dict.total}
                            </h2>
                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-60">
                                    <span>{dict.subtotal}</span>
                                    <span>{getTotalPrice()}€</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-60">
                                    <span>{dict.shipping}</span>
                                    <span className="text-green-400 font-black">{dict.free}</span>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-baseline">
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">{dict.total}</span>
                                    <span className="text-4xl font-black italic text-[#FF6600]">{getTotalPrice()}€</span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={isLoading || !!paymentData}
                                className="w-full bg-[#FF6600] text-white font-black py-4 text-xs uppercase tracking-widest hover:bg-white hover:text-[#003366] transition-all flex items-center justify-center gap-3 italic disabled:opacity-50"
                            >
                                {isLoading || paymentData ? (
                                    <span className="animate-pulse">{paymentData ? 'Redirigiendo...' : dict.processing}</span>
                                ) : (
                                    <>
                                        <CreditCard size={16} />
                                        {dict.checkout}
                                    </>
                                )}
                            </button>

                            <p className="mt-6 text-center text-[9px] font-bold uppercase tracking-widest opacity-40 leading-relaxed">
                                {dict.taxes}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
