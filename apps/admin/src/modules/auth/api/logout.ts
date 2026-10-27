import { generateExpiredPayloadCookie } from 'payload/shared'

import { jsonError } from '../errors'
import { checkOrigin } from './me'
import { authenticateRequest } from '../request'
import { clearedSessionCookie } from '../session'
import { logoutCustomer } from '../service'

export async function handleLogout(request: Request): Promise<Response> {
  const originError = checkOrigin(request)
  if (originError) return originError

  try {
    const { payload, req, user } = await authenticateRequest(request)
    const cookies = [clearedSessionCookie()]

    if (user && user.collection === 'customers') {
      await logoutCustomer({ payload, req, customer: user })
    }

    const collectionConfig = payload.collections.customers.config
    cookies.push(
      generateExpiredPayloadCookie({
        collectionAuthConfig: collectionConfig.auth,
        cookiePrefix: payload.config.cookiePrefix,
      }),
    )

    const headers = new Headers({ 'Cache-Control': 'no-store' })
    for (const cookie of cookies) headers.append('Set-Cookie', cookie)

    return Response.json({ ok: true }, { headers })
  } catch (error) {
    return jsonError(error)
  }
}
