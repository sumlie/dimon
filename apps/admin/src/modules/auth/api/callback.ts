import { type AuthProviderId } from '../config'
import { AuthError, isAuthError } from '../errors'
import { getOAuthProvider } from '../providers'
import { enforceRateLimit } from '../rateLimit'
import { redirectWithError, redirectResponse, safeRedirect } from '../redirects'
import { getAuthContext } from '../request'
import { clearedLegacySessionCookie } from '../session'
import { signInWithIdentity } from '../service'
import { clearedStateCookie, readStateCookie, verifyStateValue, type OAuthState } from '../state'

export async function handleOAuthCallback(
  provider: AuthProviderId,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url)
  let state: OAuthState | null = null

  try {
    state = await readStateCookie(request.headers)
  } catch {
    // The state cookie is re-read below to produce a specific error.
  }

  const fallbackRedirect = safeRedirect(state?.redirectTo)

  const providerError = url.searchParams.get('error')
  if (providerError) {
    return redirectWithError(
      fallbackRedirect,
      providerError === 'access_denied' ? 'cancelled' : 'provider_error',
      [clearedStateCookie()],
    )
  }

  try {
    enforceRateLimit({
      request,
      scope: `callback:${provider}`,
      limit: 30,
      windowMs: 5 * 60 * 1000,
    })

    if (!state) {
      state = await readStateCookie(request.headers)
    }

    if (state.provider !== provider) {
      throw new AuthError('invalid_state', 'OAuth state provider mismatch', 400)
    }

    verifyStateValue(state.state, url.searchParams.get('state'))

    const code = url.searchParams.get('code')
    if (!code) throw new AuthError('invalid_callback', 'Authorization code is missing', 400)

    if (provider === 'telegram') {
      throw new AuthError('invalid_callback', 'Telegram uses the widget endpoint', 400)
    }

    const identity = await getOAuthProvider(provider).exchangeCode({
      code,
      codeVerifier: state.codeVerifier,
      nonce: state.nonce || '',
    })

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
      return redirectResponse(`/auth/complete?provider=${encodeURIComponent(provider)}`, [
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
      console.error('OAuth callback failed:', {
        provider,
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Unknown error',
      })

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
