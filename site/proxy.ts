import { NextRequest, NextResponse } from 'next/server';
import { COUNTRY_CONFIG, DEFAULT_LOCALE, LOCALE_COOKIE } from '@/lib/utils';

const LOCALES = Object.keys(COUNTRY_CONFIG);
const DEFAULT_LOCALE_STRING = DEFAULT_LOCALE.locale; // 'en-US'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const matchedLocale = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (matchedLocale) {
    const headers = new Headers(request.headers);
    headers.set('x-next-intl-locale', matchedLocale);
    const response = NextResponse.next({ request: { headers } });
    // The BFF routes read this cookie to resolve country / currency for the shopper.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== matchedLocale) {
      response.cookies.set(LOCALE_COOKIE, matchedLocale, { path: '/', sameSite: 'lax', maxAge: COOKIE_MAX_AGE });
    }
    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE_STRING;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|favicon|.*\\..*).*)', '/'],
};
