import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

import { SignJWT, jwtVerify } from 'jose'
import { generateCookie, parseCookies } from 'payload/shared'

import {
  AUTH_SECRET,
  PENDING_COOKIE,
  PENDING_TTL_SECONDS,
  STATE_COOKIE,
  STATE_TTL_SECONDS,
  cookieBase,
  type AuthProviderId,
} from './config'
import { AuthError } from './errors'

export type OAuthMode = 'login' | 'link'

export type OAuthState = {
  provider: AuthProviderId
  state: string
  codeVerifier: string
  nonce?: string
  redirectTo: string
  mode: OAuthMode
  customerId?: number
  consent: boolean
}

type StateClaims = OAuthState & {
  kind: 'oauth-state'
}

export type PendingProfile = {
  provider: AuthProviderId
  providerId: string
  email?: string
  emailVerified: boolean
  name?: string
  username?: string
  consent: boolean
  redirectTo: string
}

type PendingClaims = PendingProfile & {
  kind: 'oauth-pending'
}

const key = new TextEncoder().encode(AUTH_SECRET)

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64url')
}

export function randomToken(bytes = 32): string {
  return base64Url(randomBytes(bytes))
}

export async function createState(options: {
  provider: AuthProviderId
  redirectTo: string
  mode: OAuthMode
  customerId?: number
  consent: boolean
}): Promise<{ state: OAuthState; cookie: string; codeChallenge: string }> {
  const state: OAuthState = {
    ...options,
    state: randomToken(),
    codeVerifier: randomToken(48),
    nonce: randomToken(),
  }

  const codeChallenge = base64Url(createHash('sha256').update(state.codeVerifier).digest())

  const token = await new SignJWT({ ...state, kind: 'oauth-state' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(key)

  const cookie = generateCookie<false>({
    ...cookieBase,
    maxAge: STATE_TTL_SECONDS,
    name: STATE_COOKIE,
    path: '/api/auth',
    returnCookieAsObject: false,
    value: token,
  })

  return { state, cookie, codeChallenge }
}

export async function readStateCookie(headers: Headers): Promise<OAuthState> {
  const token = parseCookies(headers).get(STATE_COOKIE)
  if (!token) throw new AuthError('invalid_state', 'OAuth state cookie is missing', 400)

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    const claims = payload as unknown as StateClaims

    if (claims.kind !== 'oauth-state') {
      throw new AuthError('invalid_state', 'Invalid OAuth state', 400)
    }

    return claims
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('state_expired', 'OAuth state expired or invalid', 400)
  }
}

export function verifyStateValue(expected: string, received: string | null): void {
  if (!received) throw new AuthError('invalid_state', 'OAuth state is missing', 400)

  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new AuthError('invalid_state', 'OAuth state mismatch', 400)
  }
}

export function clearedStateCookie(): string {
  return generateCookie<false>({
    ...cookieBase,
    expires: new Date(Date.now() - 1000),
    maxAge: 0,
    name: STATE_COOKIE,
    path: '/api/auth',
    returnCookieAsObject: false,
    value: '',
  })
}

export async function createPendingCookie(profile: PendingProfile): Promise<string> {
  const token = await new SignJWT({ ...profile, kind: 'oauth-pending' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_TTL_SECONDS}s`)
    .sign(key)

  return generateCookie<false>({
    ...cookieBase,
    maxAge: PENDING_TTL_SECONDS,
    name: PENDING_COOKIE,
    path: '/api/auth',
    returnCookieAsObject: false,
    value: token,
  })
}

export async function readPendingCookie(headers: Headers): Promise<PendingProfile> {
  const token = parseCookies(headers).get(PENDING_COOKIE)
  if (!token) throw new AuthError('invalid_request', 'Signup session expired', 400)

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    const claims = payload as unknown as PendingClaims

    if (claims.kind !== 'oauth-pending') {
      throw new AuthError('invalid_request', 'Invalid signup session', 400)
    }

    return claims
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('invalid_request', 'Signup session expired', 400)
  }
}

export function clearedPendingCookie(): string {
  return generateCookie<false>({
    ...cookieBase,
    expires: new Date(Date.now() - 1000),
    maxAge: 0,
    name: PENDING_COOKIE,
    path: '/api/auth',
    returnCookieAsObject: false,
    value: '',
  })
}
