import { createRemoteJWKSet, jwtVerify } from 'jose'

import { getOAuthEnv, isProviderConfigured } from '../config'
import { AuthError } from '../errors'
import type { OAuthProvider } from './types'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

type GoogleIdToken = {
  aud?: string
  email?: string
  email_verified?: boolean | string
  exp?: number
  given_name?: string
  iss?: string
  name?: string
  nonce?: string
  sub?: string
}

export const googleProvider: OAuthProvider = {
  id: 'google',
  buildAuthorizationUrl: ({ state, codeChallenge, nonce }) => {
    if (!isProviderConfigured('google')) {
      throw new AuthError('provider_not_configured', 'Google login is not configured', 503)
    }

    const env = getOAuthEnv('google')
    const url = new URL(GOOGLE_AUTH_URL)
    url.searchParams.set('client_id', env.clientId)
    url.searchParams.set('redirect_uri', env.redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('state', state)
    url.searchParams.set('nonce', nonce)
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')
    url.searchParams.set('prompt', 'select_account')
    return url
  },
  exchangeCode: async ({ code, codeVerifier, nonce }) => {
    if (!isProviderConfigured('google')) {
      throw new AuthError('provider_not_configured', 'Google login is not configured', 503)
    }

    const env = getOAuthEnv('google')
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: env.redirectUri,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      throw new AuthError('provider_error', 'Google token exchange failed', 502)
    }

    const tokens = (await response.json()) as {
      id_token?: string
    }

    if (!tokens.id_token) {
      throw new AuthError('provider_error', 'Google did not return an id_token', 502)
    }

    let payload: GoogleIdToken
    try {
      const verified = await jwtVerify(tokens.id_token, GOOGLE_JWKS, {
        audience: env.clientId,
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
      })
      payload = verified.payload as GoogleIdToken
    } catch {
      throw new AuthError('provider_error', 'Google id_token verification failed', 401)
    }

    if (!payload.sub) {
      throw new AuthError('provider_error', 'Google profile has no subject', 502)
    }

    if (!payload.nonce || payload.nonce !== nonce) {
      throw new AuthError('invalid_callback', 'Google nonce mismatch', 401)
    }

    return {
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true || payload.email_verified === 'true',
      name: payload.name || payload.given_name,
    }
  },
}
