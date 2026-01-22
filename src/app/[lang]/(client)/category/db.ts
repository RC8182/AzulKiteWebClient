export type Language = 'es' | 'en' | 'it';

export const dictionary = {
    es: {
        all: "Todos",
        noProducts: "No hay productos en esta categoría.",
        backToHome: "Volver al inicio",
        // Las categorías se obtendrán dinámicamente de Strapi
        // No hardcodear nombres de categoría aquí
    },
    en: {
        all: "All",
        noProducts: "No products in this category.",
        backToHome: "Back to home",
    },
    it: {
        all: "Tutti",
        noProducts: "Nessun prodotto in esta categoría.",
        backToHome: "Torna alla home",
    }
};

export function getDictionary(lang: string) {
    return dictionary[lang as Language] || dictionary.es;
}
