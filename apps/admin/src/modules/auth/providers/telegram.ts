import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

import { TELEGRAM_AUTH_MAX_AGE, telegramEnv } from '../config'
import { AuthError } from '../errors'
import type { ProviderIdentity } from './types'

const ALLOWED_FIELDS = new Set([
  'auth_date',
  'first_name',
  'hash',
  'id',
  'last_name',
  'photo_url',
  'username',
])

export function verifyTelegramWidget(
  searchParams: URLSearchParams,
  options?: { botToken?: string; maxAgeSeconds?: number; now?: number },
): ProviderIdentity {
  const botToken = options?.botToken ?? telegramEnv.botToken
  if (!botToken) {
    throw new AuthError('provider_not_configured', 'Telegram login is not configured', 503)
  }

  const data = new Map<string, string>()
  for (const [key, value] of searchParams.entries()) {
    if (!ALLOWED_FIELDS.has(key)) {
      throw new AuthError('invalid_callback', `Unexpected Telegram field: ${key}`, 400)
    }
    data.set(key, value)
  }

  const hash = data.get('hash')
  if (!hash) throw new AuthError('invalid_callback', 'Telegram hash is missing', 400)

  data.delete('hash')

  const dataCheckString = [...data.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const expected = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const receivedBuffer = Buffer.from(hash, 'utf8')

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new AuthError('invalid_callback', 'Telegram signature mismatch', 401)
  }

  const authDate = Number(data.get('auth_date'))
  if (!Number.isFinite(authDate)) {
    throw new AuthError('invalid_callback', 'Telegram auth_date is invalid', 400)
  }

  const now = options?.now ?? Math.floor(Date.now() / 1000)
  const maxAge = options?.maxAgeSeconds ?? TELEGRAM_AUTH_MAX_AGE

  if (authDate > now + 60) {
    throw new AuthError('invalid_callback', 'Telegram auth_date is in the future', 400)
  }

  if (now - authDate > maxAge) {
    throw new AuthError('invalid_callback', 'Telegram auth data is too old', 400)
  }

  const id = data.get('id')
  if (!id || !/^\d+$/.test(id)) {
    throw new AuthError('invalid_callback', 'Telegram user id is invalid', 400)
  }

  const firstName = data.get('first_name') || ''
  const lastName = data.get('last_name') || ''
  const name = [firstName, lastName].filter(Boolean).join(' ') || data.get('username') || undefined

  return {
    provider: 'telegram',
    providerId: id,
    email: undefined,
    emailVerified: false,
    name,
    username: data.get('username') || undefined,
  }
}
