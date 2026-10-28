export const AUTH_PROVIDERS = ['google', 'yandex', 'telegram'] as const
export const ALL_PROVIDERS = ['google', 'yandex', 'telegram', 'vk'] as const

export type AuthProviderId = (typeof AUTH_PROVIDERS)[number]
export type SocialProviderId = (typeof ALL_PROVIDERS)[number]

export const SESSION_COOKIE = 'dimon_customer_session_v2'
export const LEGACY_SESSION_COOKIE = 'dimon_customer_session'
export const AUTH_COOKIE_PATH = '/api/auth'
export const STATE_COOKIE = 'dimon_oauth_state'
export const PENDING_COOKIE = 'dimon_oauth_pending'

export const STATE_TTL_SECONDS = 10 * 60
export const PENDING_TTL_SECONDS = 15 * 60

const isProduction = process.env.NODE_ENV === 'production'

export const APP_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
export const ADMIN_URL = (process.env.ADMIN_URL || 'http://localhost:3001').replace(/\/+$/, '')
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined
export const IS_PRODUCTION = isProduction

const secret = process.env.OAUTH_SESSION_SECRET || process.env.PAYLOAD_SECRET

if (!secret && isProduction) {
  throw new Error('OAUTH_SESSION_SECRET or PAYLOAD_SECRET must be set in production')
}

export const AUTH_SECRET =
  secret ||
  // Local development only. Never used in production because of the guard above.
  'dimon-development-only-auth-secret'

export const TRUSTED_ORIGINS = (process.env.TRUSTED_REDIRECT_ORIGINS || `${APP_URL},${ADMIN_URL}`)
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const telegramMaxAge = Number(process.env.TELEGRAM_AUTH_MAX_AGE || 300)
export const TELEGRAM_AUTH_MAX_AGE =
  Number.isFinite(telegramMaxAge) && telegramMaxAge > 0 ? telegramMaxAge : 300

export type ProviderEnv = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

const providerEnv: Record<Exclude<AuthProviderId, 'telegram'>, ProviderEnv> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${APP_URL}/api/auth/google/callback`,
  },
  yandex: {
    clientId: process.env.YANDEX_CLIENT_ID || '',
    clientSecret: process.env.YANDEX_CLIENT_SECRET || '',
    redirectUri: process.env.YANDEX_REDIRECT_URI || `${APP_URL}/api/auth/yandex/callback`,
  },
}

export const telegramEnv = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botUsername: (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, ''),
}

export function getOAuthEnv(provider: Exclude<AuthProviderId, 'telegram'>): ProviderEnv {
  return providerEnv[provider]
}

export function isProviderConfigured(provider: AuthProviderId): boolean {
  if (provider === 'telegram') {
    return Boolean(telegramEnv.botToken && telegramEnv.botUsername)
  }

  const env = providerEnv[provider]
  return Boolean(env.clientId && env.clientSecret && env.redirectUri)
}

export const cookieBase = {
  domain: COOKIE_DOMAIN,
  httpOnly: true,
  path: '/',
  sameSite: 'Lax' as const,
  secure: isProduction,
}

export function isTrustedOrigin(origin: string | null, referer: string | null): boolean {
  if (!origin && !referer) return true

  try {
    const value = origin || (referer ? new URL(referer).origin : null)
    if (!value) return false
    return TRUSTED_ORIGINS.includes(value.replace(/\/+$/, ''))
  } catch {
    return false
  }
}
