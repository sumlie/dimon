import { jsonError, AuthError } from '../errors'
import { checkOrigin } from './me'
import { enforceRateLimit } from '../rateLimit'
import { getAuthContext } from '../request'
import { clearedLegacySessionCookie } from '../session'
import { completeOnboarding, sanitizeCustomer } from '../service'
import { clearedPendingCookie, readPendingCookie } from '../state'

export async function handleOnboardingProfile(request: Request): Promise<Response> {
  try {
    const profile = await readPendingCookie(request.headers)

    return Response.json(
      {
        provider: profile.provider,
        email: profile.email || '',
        name: profile.name || '',
        username: profile.username || '',
        emailVerified: profile.emailVerified,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return jsonError(error)
  }
}

type OnboardingBody = {
  consent?: boolean
  email?: string
  name?: string
}

export async function handleOnboarding(request: Request): Promise<Response> {
  const originError = checkOrigin(request)
  if (originError) return originError

  try {
    enforceRateLimit({
      request,
      scope: 'onboarding',
      limit: 10,
      windowMs: 10 * 60 * 1000,
    })

    const profile = await readPendingCookie(request.headers)

    let body: OnboardingBody
    try {
      body = (await request.json()) as OnboardingBody
    } catch {
      throw new AuthError('invalid_request', 'Invalid request body', 400)
    }

    if (typeof body.email !== 'string' || typeof body.name !== 'string') {
      throw new AuthError('invalid_request', 'Email and name are required', 400)
    }

    const { payload, req } = await getAuthContext(request)
    const result = await completeOnboarding({
      payload,
      req,
      profile,
      email: body.email,
      name: body.name,
      consent: body.consent === true,
    })

    const redirectUrl = new URL(result.redirectTo, 'https://local.invalid')
    redirectUrl.searchParams.set('auth', 'success')
    const redirectTo = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`

    const headers = new Headers({ 'Cache-Control': 'no-store' })
    headers.append('Set-Cookie', clearedPendingCookie())
    headers.append('Set-Cookie', clearedLegacySessionCookie())
    headers.append('Set-Cookie', result.session.cookie)

    return Response.json(
      {
        ok: true,
        redirectTo,
        customer: sanitizeCustomer(result.customer),
      },
      { headers },
    )
  } catch (error) {
    return jsonError(error)
  }
}
