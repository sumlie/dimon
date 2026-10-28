import { APP_URL, isProviderConfigured, telegramEnv } from '../config'
import { AuthError, isAuthError } from '../errors'
import { verifyTelegramWidget } from '../providers'
import { enforceRateLimit } from '../rateLimit'
import { redirectWithError, redirectResponse, safeRedirect } from '../redirects'
import { getAuthContext, authenticateRequest } from '../request'
import { clearedLegacySessionCookie } from '../session'
import { signInWithIdentity } from '../service'
import {
  clearedStateCookie,
  createState,
  readStateCookie,
  verifyStateValue,
  type OAuthMode,
} from '../state'

export async function handleTelegramStart(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const redirectTo = safeRedirect(url.searchParams.get('redirectTo'))

  try {
    enforceRateLimit({
      request,
      scope: 'start:telegram',
      limit: 20,
      windowMs: 5 * 60 * 1000,
    })

    if (!isProviderConfigured('telegram')) {
      throw new AuthError('provider_not_configured', 'Telegram login is not configured', 503)
    }

    const mode: OAuthMode = url.searchParams.get('mode') === 'link' ? 'link' : 'login'
    const consent = url.searchParams.get('consent') === '1'
    let customerId: number | undefined

    if (mode === 'link') {
      const { user } = await authenticateRequest(request)
      if (!user || user.collection !== 'customers' || user.isBlocked) {
        throw new AuthError('unauthorized', 'Sign in before linking a provider', 401)
      }
      customerId = user.id
    }

    const { state, cookie } = await createState({
      provider: 'telegram',
      redirectTo,
      mode,
      customerId,
      consent,
    })

    const authUrl = new URL('/api/auth/telegram/callback', APP_URL)
    authUrl.searchParams.set('state', state.state)

    return Response.json(
      {
        botUsername: telegramEnv.botUsername,
        authUrl: authUrl.toString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Set-Cookie': cookie,
        },
      },
    )
  } catch (error) {
    const code = isAuthError(error) ? error.code : 'internal_error'
    const status = isAuthError(error) ? error.status : 400
    return Response.json({ error: code }, { status })
  }
}

export async function handleTelegramCallback(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const state = await readStateCookie(request.headers).catch(() => null)
  const fallbackRedirect = safeRedirect(state?.redirectTo)

  try {
    enforceRateLimit({
      request,
      scope: 'callback:telegram',
      limit: 30,
      windowMs: 5 * 60 * 1000,
    })

    if (!state) {
      throw new AuthError('invalid_state', 'Telegram login session expired', 400)
    }

    verifyStateValue(state.state, url.searchParams.get('state'))

    const widgetParams = new URLSearchParams(url.searchParams)
    widgetParams.delete('state')
    const identity = verifyTelegramWidget(widgetParams)

    const { payload, req } = await getAuthContext(request)

    if (state.mode === 'link') {
      const auth = await payload.auth({
        canSetHeaders: true,
        headers: request.headers,
        req,
      })

      if (
        !auth.user ||
        auth.user.collection !== 'customers' ||
        String(auth.user.id) !== String(state.customerId)
      ) {
        throw new AuthError('unauthorized', 'Sign in again before linking a provider', 401)
      }
    }

    const result = await signInWithIdentity({
      payload,
      req,
      identity,
      mode: state.mode,
      customerId: state.customerId,
      consent: state.consent,
      redirectTo: state.redirectTo,
    })

    if (result.type === 'onboarding') {
      return redirectResponse('/auth/complete?provider=telegram', [
        clearedStateCookie(),
        result.pendingCookie,
      ])
    }

    if (result.type === 'linked') {
      return redirectResponse(addQuery(result.redirectTo, 'auth', 'linked'), [clearedStateCookie()])
    }

    return redirectResponse(addQuery(result.redirectTo, 'auth', 'success'), [
      clearedStateCookie(),
      clearedLegacySessionCookie(),
      result.session.cookie,
    ])
  } catch (error) {
    const code = isAuthError(error) ? error.code : 'internal_error'
    return redirectWithError(fallbackRedirect, code, [clearedStateCookie()])
  }
}

function addQuery(path: string, key: string, value: string): string {
  const safe = safeRedirect(path)
  const url = new URL(safe, 'https://local.invalid')
  url.searchParams.set(key, value)
  return `${url.pathname}${url.search}`
}
