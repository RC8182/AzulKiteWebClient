import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string | number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
    variant?: {
        color?: string | null;
        size?: string | null;
        accessories?: string[];
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
                const existingItem = currentItems.find((item) => getItemKey(item) === newItemKey);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            getItemKey(item) === newItemKey
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...newItem, quantity }] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            getTotalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
);
