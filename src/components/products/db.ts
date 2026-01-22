export type Language = 'es' | 'en' | 'it';

const dictionary = {
    es: {
        breadcrumb: {
            home: 'Inicio',
            products: 'Productos'
        },
        features: {
            freeShipping: 'Envío Gratis',
            from100: 'Desde 100€',
            returns: 'Devoluciones',
            for30Days: 'Por 30 días',
            warranty: 'Garantía',
            officialBrand: 'Oficial de Marca'
        },
        product: {
            description: 'Descripción',
            noDescription: 'No hay descripción disponible para este producto.',
            color: 'Color',
            size: 'Medida',
            accessories: 'Accesorios',
            quantity: 'Cantidad',
            sku: 'Referencia',
            brand: 'Marca',
            stock: {
                inStock: 'En stock',
                units: 'unidades',
                shipping: 'envío en 2-5 días',
                outOfStock: 'Agotado',
                shippingCalc: 'Envío calculado en checkout',
                inclVat: 'IVA incluido'
            },
            actions: {
                addToCart: 'Añadir al Carrito',
                buyNow: 'Comprar Ahora',
                wishlist: 'Lista de Deseos',
                share: 'Compartir'
            }
        }
    },
    en: {
        breadcrumb: {
            home: 'Home',
            products: 'Products'
        },
        features: {
            freeShipping: 'Free Shipping',
            from100: 'From €100',
            returns: 'Returns',
            for30Days: 'For 30 Days',
            warranty: 'Warranty',
            officialBrand: 'Official Brand'
        },
        product: {
            description: 'Description',
            noDescription: 'No description available for this product.',
            color: 'Color',
            size: 'Size',
            accessories: 'Accessories',
            quantity: 'Quantity',
            sku: 'SKU',
            brand: 'Brand',
            stock: {
                inStock: 'In Stock',
                units: 'units',
                shipping: 'ships in 2-5 days',
                outOfStock: 'Out of Stock',
                shippingCalc: 'Shipping calculated at checkout',
                inclVat: 'Incl. VAT'
            },
            actions: {
                addToCart: 'Add to Cart',
                buyNow: 'Buy Now',
                wishlist: 'Wishlist',
                share: 'Share'
            }
        }
    },
    it: {
        breadcrumb: {
            home: 'Home',
            products: 'Prodotti'
        },
        features: {
            freeShipping: 'Spedizione Gratuita',
            from100: 'Da €100',
            returns: 'Resi',
            for30Days: 'Per 30 Giorni',
            warranty: 'Garanzia',
            officialBrand: 'Marchio Ufficiale'
        },
        product: {
            description: 'Descrizione',
            noDescription: 'Nessuna descrizione disponibile per questo prodotto.',
            color: 'Colore',
            size: 'Taglia',
            accessories: 'Accessori',
            quantity: 'Quantità',
            sku: 'SKU',
            brand: 'Marca',
            stock: {
                inStock: 'Disponibile',
                units: 'unità',
                shipping: 'spedizione in 2-5 giorni',
                outOfStock: 'Esaurito',
                shippingCalc: 'Spedizione calcolata al checkout',
                inclVat: 'IVA incl.'
            },
            actions: {
                addToCart: 'Aggiungi al Carrello',
                buyNow: 'Compra Ora',
                wishlist: 'Lista dei Desideri',
                share: 'Condividi'
            }
        }
    }
};

export function getDictionary(lang: Language) {
    return dictionary[lang as Language] || dictionary.es;
}
