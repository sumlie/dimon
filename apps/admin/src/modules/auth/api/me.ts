import { jsonError } from '../errors'
import { getCustomerProfile } from '../service'
import { authenticateRequest } from '../request'
import { isTrustedOrigin } from '../config'

function noStoreHeaders(extra?: Headers): Headers {
  const headers = new Headers(extra)
  headers.set('Cache-Control', 'no-store')
  return headers
}

export async function handleMe(request: Request): Promise<Response> {
  try {
    const { user, payload, responseHeaders } = await authenticateRequest(request)

    if (!user || user.collection !== 'customers') {
      return Response.json(
        { customer: null, identities: [] },
        { headers: noStoreHeaders(responseHeaders) },
      )
    }

    if (user.isBlocked) {
      return Response.json(
        { customer: null, identities: [] },
        { status: 403, headers: noStoreHeaders(responseHeaders) },
      )
    }

    const profile = await getCustomerProfile(payload, user.id)

    return Response.json(profile, { headers: noStoreHeaders(responseHeaders) })
  } catch (error) {
    return jsonError(error)
  }
}

export async function handleLinks(request: Request): Promise<Response> {
  try {
    const { user, payload, responseHeaders } = await authenticateRequest(request)

    if (!user || user.collection !== 'customers' || user.isBlocked) {
      return Response.json(
        { error: 'unauthorized' },
        { status: 401, headers: noStoreHeaders(responseHeaders) },
      )
    }

    const profile = await getCustomerProfile(payload, user.id)
    return Response.json(
      { identities: profile.identities },
      { headers: noStoreHeaders(responseHeaders) },
    )
  } catch (error) {
    return jsonError(error)
  }
}

export function checkOrigin(request: Request): Response | null {
  if (isTrustedOrigin(request.headers.get('origin'), request.headers.get('referer'))) {
    return null
  }

  return Response.json({ error: 'invalid_request' }, { status: 403 })
}
