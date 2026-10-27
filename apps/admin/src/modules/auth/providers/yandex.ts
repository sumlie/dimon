import { getOAuthEnv, isProviderConfigured } from '../config'
import { AuthError } from '../errors'
import type { OAuthProvider } from './types'

const YANDEX_AUTH_URL = 'https://oauth.yandex.ru/authorize'
const YANDEX_TOKEN_URL = 'https://oauth.yandex.ru/token'
const YANDEX_PROFILE_URL = 'https://login.yandex.ru/info?format=json'

type YandexProfile = {
  default_email?: string
  display_name?: string
  emails?: string[]
  first_name?: string
  id?: string
  last_name?: string
  login?: string
  real_name?: string
}

function pickName(profile: YandexProfile): string | undefined {
  if (profile.real_name) return profile.real_name
  if (profile.display_name) return profile.display_name

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  if (fullName) return fullName

  return profile.login
}

export const yandexProvider: OAuthProvider = {
  id: 'yandex',
  buildAuthorizationUrl: ({ state, codeChallenge }) => {
    if (!isProviderConfigured('yandex')) {
      throw new AuthError('provider_not_configured', 'Yandex login is not configured', 503)
    }

    const env = getOAuthEnv('yandex')
    const url = new URL(YANDEX_AUTH_URL)
    url.searchParams.set('client_id', env.clientId)
    url.searchParams.set('redirect_uri', env.redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'login:email login:info')
    url.searchParams.set('state', state)
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')
    return url
  },
  exchangeCode: async ({ code, codeVerifier }) => {
    if (!isProviderConfigured('yandex')) {
      throw new AuthError('provider_not_configured', 'Yandex login is not configured', 503)
    }

    const env = getOAuthEnv('yandex')
    const tokenResponse = await fetch(YANDEX_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    if (!tokenResponse.ok) {
      throw new AuthError('provider_error', 'Yandex token exchange failed', 502)
    }

    const tokens = (await tokenResponse.json()) as { access_token?: string }
    if (!tokens.access_token) {
      throw new AuthError('provider_error', 'Yandex did not return an access token', 502)
    }

    const profileResponse = await fetch(YANDEX_PROFILE_URL, {
      headers: {
        Authorization: `OAuth ${tokens.access_token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    if (!profileResponse.ok) {
      throw new AuthError('provider_error', 'Yandex profile request failed', 502)
    }

    const profile = (await profileResponse.json()) as YandexProfile
    if (!profile.id) {
      throw new AuthError('provider_error', 'Yandex profile has no id', 502)
    }

    return {
      provider: 'yandex',
      providerId: String(profile.id),
      email: profile.default_email || profile.emails?.[0],
      // Yandex does not expose an email verification flag in this API.
      emailVerified: false,
      name: pickName(profile),
      username: profile.login,
    }
  },
}
