'use client';

import { useCart } from '@/store/useCart';
import { ShoppingBag, ChevronRight, Trash2, Plus, Minus, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { createCheckoutSession } from '@/actions/checkout';
import { getUserProfile } from '@/actions/user-actions';
import { useState, use, useEffect } from 'react';
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
    const [paymentData, setPaymentData] = useState<{ url: string; fields: Record<string, string> } | null>(null);
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

    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'paypal' | 'card'>('card');
    const shippingCost = 14; // Matching the image

    // Auto-fill from Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getUserProfile();
                if (profile) {
                    setFormData({
                        email: profile.user.email || '',
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        address: profile.addressLine1 || '',
                        city: profile.city || '',
                        postalCode: profile.postalCode || '',
                        country: profile.country || 'ES',
                        phone: profile.phone || ''
                    });
                }
            } catch (error) {
                console.error('[Checkout] Failed to fetch profile:', error);
            }
        };
        fetchProfile();
    }, []);

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
                payment_method: paymentMethod,
                products: items.map(item => ({
                    id: String(item.productId || item.id),
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image,
                    color: item.variant?.color,
                    size: item.variant?.size
                })),
            });

            if (result.error) throw new Error(result.error);

            if (paymentMethod === 'card') {
                if (!result.paymentData) throw new Error('No payment data returned');
                setPaymentData(result.paymentData);
            } else {
                window.location.href = `/${lang}/checkout/success?order=${result.orderNumber}&method=${paymentMethod}`;
            }
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
                        <span className="text-[#0051B5] uppercase">{dict.checkout}</span>
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter italic">
                        {dict.title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Shipping Form */}
                    <div className="bg-white p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0051B5] mb-8 flex items-center gap-2">
                            <ShieldCheck size={14} />
                            {dict.shipping_form}
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

                    {/* Tu Pedido Table */}
                    <div className="bg-white p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#003366] mb-8 italic">
                            {dict.summary}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <th className="py-4 text-left">{dict.product}</th>
                                        <th className="py-4 text-right">{dict.subtotal}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 p-1 shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-[#003366]">{item.name}</span>
                                                        <span className="text-gray-400 mx-2 font-black">× {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-right font-bold text-[#003366]">
                                                {item.price * item.quantity}€
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="divide-y divide-gray-100 bg-gray-50/30">
                                    <tr>
                                        <td className="py-4 px-2 font-bold text-gray-500 uppercase text-[10px] tracking-widest">{dict.subtotal}</td>
                                        <td className="py-4 px-2 text-right font-bold text-[#003366]">{getTotalPrice()}€</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-2 font-bold text-gray-500 uppercase text-[10px] tracking-widest">{dict.shipping}</td>
                                        <td className="py-4 px-2 text-right font-bold text-gray-500 italic">{dict.shipping_method}</td>
                                    </tr>
                                    <tr className="bg-white border-t border-gray-100">
                                        <td className="py-6 px-2 text-lg font-black text-[#003366] uppercase tracking-tighter italic">{dict.total}</td>
                                        <td className="py-6 px-2 text-right text-2xl font-black text-[#FF6600] italic">{getTotalPrice() + shippingCost}€</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="bg-white p-8 shadow-sm border border-gray-100">
                        <div className="space-y-4">
                            {/* Bank Transfer */}
                            <div className={`border border-gray-100 rounded-lg overflow-hidden transition-all ${paymentMethod === 'bank' ? 'ring-1 ring-[#0051B5] border-transparent' : ''}`}>
                                <label className="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === 'bank'}
                                        onChange={() => setPaymentMethod('bank')}
                                        className="mt-1 accent-[#0051B5]"
                                    />
                                    <div className="flex-grow">
                                        <span className="block font-bold text-sm text-[#003366] uppercase tracking-wider">{dict.payment_methods.bank}</span>
                                        {paymentMethod === 'bank' && (
                                            <div className="mt-4 p-4 bg-gray-50 text-xs text-gray-500 leading-relaxed rounded border-t border-gray-100">
                                                {dict.payment_methods.bank_desc}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* PayPal */}
                            <div className={`border border-gray-100 rounded-lg overflow-hidden transition-all ${paymentMethod === 'paypal' ? 'ring-1 ring-[#0051B5] border-transparent' : ''}`}>
                                <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={() => setPaymentMethod('paypal')}
                                        className="accent-[#0051B5]"
                                    />
                                    <div className="flex items-center gap-2 flex-grow">
                                        <span className="font-bold text-sm text-[#003366] uppercase tracking-wider">{dict.payment_methods.paypal}</span>
                                        <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-4" />
                                    </div>
                                </label>
                            </div>

                            {/* Card */}
                            <div className={`border border-gray-100 rounded-lg overflow-hidden transition-all ${paymentMethod === 'card' ? 'ring-1 ring-[#0051B5] border-transparent' : ''}`}>
                                <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="accent-[#0051B5]"
                                    />
                                    <div className="flex items-center gap-2 flex-grow">
                                        <span className="font-bold text-sm text-[#003366] uppercase tracking-wider">{dict.payment_methods.card}</span>
                                        <div className="flex gap-1 ml-2">
                                            <img src="https://www.thegymcity.com/wp-content/uploads/2018/11/visa-mastercard-icon.png" alt="Visa/Mastercard" className="h-4 opacity-70" />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-8">
                                {dict.legal_notice}
                            </p>

                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={isLoading || !!paymentData}
                                className="w-full bg-[#0051B5] text-white font-black py-5 text-sm uppercase tracking-[0.2em] hover:bg-[#003366] transition-all flex items-center justify-center gap-3 italic shadow-xl shadow-blue-900/10 disabled:opacity-50"
                            >
                                {isLoading || paymentData ? (
                                    <span className="animate-pulse">{paymentData ? 'Redirigiendo...' : dict.processing}</span>
                                ) : (
                                    <>
                                        {paymentMethod === 'card' && <CreditCard size={18} />}
                                        {dict.place_order}
                                    </>
                                )}
                            </button>
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
            </div>
        </div>
    );
}
