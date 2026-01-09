import { NextResponse } from 'next/server'
import { i18n } from '../i18n'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request) {
    const negotiatorHeaders = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))
    const locales = i18n.locales
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)

    try {
        const locale = matchLocale(languages, locales, i18n.defaultLocale)
        return locale
    } catch (e) {
        return i18n.defaultLocale
    }
}

export function proxy(request) {
    const pathname = request.nextUrl.pathname

    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Exceptions for specific routes
    if (
        pathname.startsWith('/public') ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/logo') ||
        pathname.includes('.') ||
        pathname.startsWith('/_next')
        // pathname.startsWith('/dashboard')
    ) {
        return;
    }

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)
        const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
        return NextResponse.redirect(newUrl)
    }
}
