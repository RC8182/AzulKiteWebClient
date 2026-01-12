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
            noDescription: 'No hay descripción disponible para este producto.'
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
            noDescription: 'No description available for this product.'
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
            noDescription: 'Nessuna descrizione disponibile per questo prodotto.'
        }
    }
};

export function getDictionary(lang: Language) {
    return dictionary[lang as Language] || dictionary.es;
}
