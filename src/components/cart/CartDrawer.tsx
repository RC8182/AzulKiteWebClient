'use client';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Button,
    Image,
    Divider,
} from '@heroui/react';
import { useCart } from '@/store/useCart';
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from '@/actions/checkout';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CartDrawerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function CartDrawer({ isOpen, onOpenChange }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const { sessionId, error } = await createCheckoutSession({
                customer_email: 'test@example.com', // In a real app, get from auth or form
                products: items.map(item => ({ id: item.id, quantity: item.quantity })),
            });

            if (error) throw new Error(error);

            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe failed to load');

            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId,
            });

            if (stripeError) throw new Error(stripeError.message);
        } catch (err: any) {
            alert(err.message || 'Error al procesar el pago');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[var(--color-primary)]">
                                <ShoppingBag size={24} />
                                <span className="text-2xl font-bold">Tu Carrito</span>
                                <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                    {getTotalItems()} ítems
                                </span>
                            </div>
                        </DrawerHeader>
                        <DrawerBody>
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                                    <ShoppingBag size={64} className="opacity-20" />
                                    <p className="text-xl">Tu carrito está vacío</p>
                                    <Button color="primary" variant="flat" onPress={onClose}>
                                        Seguir Comprando
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-lg line-clamp-1">{item.name}</h4>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onPress={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{item.category}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-100">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            radius="full"
                                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus size={14} />
                                                        </Button>
                                                        <span className="w-8 text-center font-bold text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            radius="full"
                                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus size={14} />
                                                        </Button>
                                                    </div>
                                                    <p className="font-bold text-[var(--color-primary)]">
                                                        {item.price * item.quantity}€
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DrawerBody>
                        <DrawerFooter className="flex flex-col gap-4 border-t border-gray-100 pt-6">
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{getTotalPrice()}€</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold text-[var(--color-primary)]">
                                    <span>Total</span>
                                    <span>{getTotalPrice()}€</span>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-[var(--color-accent)] text-white font-bold h-14 text-lg"
                                radius="full"
                                isDisabled={items.length === 0 || isLoading}
                                isLoading={isLoading}
                                onPress={handleCheckout}
                                startContent={!isLoading && <ShoppingBag size={20} />}
                            >
                                {isLoading ? 'Procesando...' : 'Pagar Ahora'}
                            </Button>
                            <p className="text-center text-xs text-gray-400">
                                Gastos de envío e impuestos calculados al procesar el pago.
                            </p>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
