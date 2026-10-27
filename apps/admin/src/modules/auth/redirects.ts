import { APP_URL } from './config'

const DEFAULT_REDIRECT = '/account'

export function safeRedirect(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT,
): string {
  if (!value) return fallback
  if (value.length > 2048) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.includes('\\') || /[\u0000-\u001f]/.test(value)) return fallback

  try {
    const url = new URL(value, 'https://local.invalid')
    if (url.origin !== 'https://local.invalid') return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function appUrl(path: string): URL {
  return new URL(path, APP_URL)
}

export function redirectResponse(path: string, cookies: string[] = []): Response {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    Location: appUrl(path).toString(),
  })

  for (const cookie of cookies) {
    headers.append('Set-Cookie', cookie)
  }

  return new Response(null, { status: 302, headers })
}

export function redirectWithError(
  redirectTo: string,
  code: string,
  cookies: string[] = [],
): Response {
  const safe = safeRedirect(redirectTo)
  const url = new URL(safe, 'https://local.invalid')
  url.searchParams.set('auth_error', code)
  return redirectResponse(`${url.pathname}${url.search}`, cookies)
}
