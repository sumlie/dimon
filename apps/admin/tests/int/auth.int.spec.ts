// @vitest-environment node

import { createHash, createHmac } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { safeRedirect } from '@/modules/auth/redirects'
import { createState, readStateCookie } from '@/modules/auth/state'
import { verifyTelegramWidget } from '@/modules/auth/providers/telegram'

function telegramParams(overrides: Record<string, string> = {}) {
  const botToken = '123456:test-token'
  const now = Math.floor(Date.now() / 1000)
  const data: Record<string, string> = {
    auth_date: String(now),
    first_name: 'Иван',
    id: '777000',
    last_name: 'Тестов',
    username: 'ivan',
    ...overrides,
  }

  const dataCheckString = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secret = createHash('sha256').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex')

  const params = new URLSearchParams({ ...data, hash })
  return { params, botToken, now }
}

describe('telegram widget verification', () => {
  it('accepts a valid payload', () => {
    const { params, botToken, now } = telegramParams()

    const identity = verifyTelegramWidget(params, {
      botToken,
      maxAgeSeconds: 300,
      now,
    })

    expect(identity).toMatchObject({
      provider: 'telegram',
      providerId: '777000',
      name: 'Иван Тестов',
      username: 'ivan',
    })
  })

  it('rejects a tampered payload', () => {
    const { params, botToken, now } = telegramParams()
    params.set('first_name', 'Подмена')

    expect(() => verifyTelegramWidget(params, { botToken, maxAgeSeconds: 300, now })).toThrowError(
      'Telegram signature mismatch',
    )
  })

  it('rejects stale auth_date', () => {
    const now = Math.floor(Date.now() / 1000)
    const { params, botToken } = telegramParams({
      auth_date: String(now - 1000),
    })

    expect(() => verifyTelegramWidget(params, { botToken, maxAgeSeconds: 300, now })).toThrowError(
      'Telegram auth data is too old',
    )
  })
})

describe('oauth state', () => {
  it('round-trips a signed state cookie', async () => {
    const { state, cookie, codeChallenge } = await createState({
      provider: 'google',
      redirectTo: '/account',
      mode: 'login',
      consent: true,
    })

    expect(state.state).toHaveLength(43)
    expect(codeChallenge).toHaveLength(43)

    const headers = new Headers({ cookie })
    const parsed = await readStateCookie(headers)

    expect(parsed.state).toBe(state.state)
    expect(parsed.provider).toBe('google')
    expect(parsed.redirectTo).toBe('/account')
  })

  it('rejects a tampered state cookie', async () => {
    const { cookie } = await createState({
      provider: 'yandex',
      redirectTo: '/account',
      mode: 'login',
      consent: true,
    })

    const token = cookie.match(/dimon_oauth_state=([^;]+)/)?.[1]
    if (!token) throw new Error('state cookie is missing')

    // Change a character in the signed payload, not the base64 padding bits.
    const chars = token.split('')
    chars[10] = chars[10] === 'A' ? 'B' : 'A'
    const tampered = cookie.replace(token, chars.join(''))

    await expect(readStateCookie(new Headers({ cookie: tampered }))).rejects.toThrow()
  })
})

describe('redirect allowlist', () => {
  it('accepts relative paths', () => {
    expect(safeRedirect('/account?tab=links')).toBe('/account?tab=links')
  })

  it('rejects protocol-relative and absolute URLs', () => {
    expect(safeRedirect('//evil.example')).toBe('/account')
    expect(safeRedirect('https://evil.example')).toBe('/account')
    expect(safeRedirect('/\\evil')).toBe('/account')
  })
})
