import { isProviderConfigured, type AuthProviderId } from '../config'
import { AuthError, isAuthError } from '../errors'
import { getOAuthProvider } from '../providers'
import { enforceRateLimit } from '../rateLimit'
import { redirectWithError, safeRedirect } from '../redirects'
import { authenticateRequest } from '../request'
import { createState, type OAuthMode } from '../state'

export async function handleOAuthStart(
  provider: AuthProviderId,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url)
  const redirectTo = safeRedirect(url.searchParams.get('redirectTo'))

  try {
    enforceRateLimit({
      request,
      scope: `start:${provider}`,
      limit: 20,
      windowMs: 5 * 60 * 1000,
    })

    if (provider === 'telegram') {
      throw new AuthError('invalid_request', 'Telegram uses the widget endpoint', 400)
    }

    if (!isProviderConfigured(provider)) {
      throw new AuthError('provider_not_configured', `${provider} login is not configured`, 503)
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

    const { state, cookie, codeChallenge } = await createState({
      provider,
      redirectTo,
      mode,
      customerId,
      consent,
    })

    const authorizeUrl = getOAuthProvider(provider).buildAuthorizationUrl({
      state: state.state,
      codeChallenge,
      nonce: state.nonce || '',
    })

    const headers = new Headers({
      'Cache-Control': 'no-store',
      Location: authorizeUrl.toString(),
    })
    headers.append('Set-Cookie', cookie)

    return new Response(null, { status: 302, headers })
  } catch (error) {
    const code = isAuthError(error) ? error.code : 'internal_error'
    return redirectWithError(redirectTo, code)
  }
}
