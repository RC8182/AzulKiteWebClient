export type Language = 'es' | 'en' | 'it';

export const dictionary = {
    es: {
        all: "Todos",
        noProducts: "No hay productos en esta categoría.",
        backToHome: "Volver al inicio",
        categories: {
            kitesurf: "Kitesurf",
            "wing-foil": "Wing Foil",
            accesorios: "Accesorios",
            cometas: "Cometas",
            tablas: "Tablas",
            outlet: "Outlet",
            hydrofoil: "Hydrofoil",
            alas: "Alas",
            componentes: "Componentes",
            "nueva-temporada": "Nueva Temporada",
            usado: "Usado"
        }
    },
    en: {
        all: "All",
        noProducts: "No products in this category.",
        backToHome: "Back to home",
        categories: {
            kitesurf: "Kitesurf",
            "wing-foil": "Wing Foil",
            accesorios: "Accessories",
            cometas: "Kites",
            tablas: "Boards",
            outlet: "Outlet",
            hydrofoil: "Hydrofoil",
            alas: "Wings",
            componentes: "Components",
            "nueva-temporada": "New Season",
            usado: "Used"
        }
    },
    it: {
        all: "Tutti",
        noProducts: "Nessun prodotto in questa categoria.",
        backToHome: "Torna alla home",
        categories: {
            kitesurf: "Kitesurf",
            "wing-foil": "Wing Foil",
            accesorios: "Accessori",
            cometas: "Aquiloni",
            tablas: "Tavole",
            outlet: "Outlet",
            hydrofoil: "Hydrofoil",
            alas: "Ali",
            componentes: "Componenti",
            "nueva-temporada": "Nuova Stagione",
            usado: "Usato"
        }
    }
};

export function getDictionary(lang: string) {
    return dictionary[lang as Language] || dictionary.es;
}
