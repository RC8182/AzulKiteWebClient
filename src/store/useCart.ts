import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string | number;
    productId?: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
    variant?: {
        color?: string | null;
        size?: string | null;
        accessories?: string[];
        originalPrice?: number;
        discount?: number;
    };
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (id: string | number) => void;
    updateQuantity: (id: string | number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem, quantity = 1) => {
                const currentItems = get().items;
                // Create a unique key for items with variants
                const getItemKey = (item: any) => {
                    const variantStr = item.variant
                        ? `${item.variant.color || ''}-${item.variant.size || ''}-${(item.variant.accessories || []).sort().join(',')}`
                        : '';
                    return `${item.id}-${variantStr}`;
                };

                const newItemKey = getItemKey(newItem);
                const existingItem = currentItems.find((item) => item.id === newItemKey);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === newItemKey
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...newItem, id: newItemKey, productId: String(newItem.id), quantity }] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                const currentItems = get().items;
                if (quantity <= 0) {
                    set({ items: currentItems.filter((item) => item.id !== id) });
                    return;
                }
                set({
                    items: currentItems.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () => {
                const items = get().items;
                return items.reduce((acc, item) => acc + item.quantity, 0);
            },
            getTotalPrice: () => {
                const items = get().items;
                return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
