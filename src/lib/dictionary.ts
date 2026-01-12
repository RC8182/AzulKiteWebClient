
const dictionaries = {
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    it: () => import('@/dictionaries/it.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
    // @ts-ignore
    return dictionaries[locale]?.() ?? dictionaries.es();
};
