'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const setFilter = (name: string, value: string) => {
        router.push(pathname + '?' + createQueryString(name, value), { scroll: false });
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    return {
        filters: {
            category: searchParams.get('category') || '',
            search: searchParams.get('search') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
        },
        setFilter,
        clearFilters,
    };
}
