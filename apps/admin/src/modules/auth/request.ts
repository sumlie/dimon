import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'

export async function getAuthContext(request: Request) {
  const payload = await getPayload({ config })
  const req = await createPayloadRequest({
    payload,
    req: { headers: request.headers },
  })

  return { payload, req }
}

export async function authenticateRequest(request: Request) {
  const { payload, req } = await getAuthContext(request)
  const result = await payload.auth({
    canSetHeaders: true,
    headers: request.headers,
    req,
  })

  return { ...result, payload, req }
}
