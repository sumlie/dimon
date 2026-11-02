import { AuthError, jsonError } from '../errors'
import { authenticateRequest } from '../request'
import { sanitizeCustomer } from '../service'
import { checkOrigin } from './me'

type ProfileBody = {
  name?: unknown
  phone?: unknown
  username?: unknown
  deliveryRegion?: unknown
  deliveryMethod?: unknown
  deliveryAddress?: unknown
  cdekPointCode?: unknown
}

const REGIONS = [
  'belarus',
  'moscow',
  'russia',
  'cis',
  'world',
] as const

type DeliveryRegion = (typeof REGIONS)[number]

const METHODS = ['cdek', 'belmail', 'euromail'] as const

function isDeliveryRegion(value: string): value is DeliveryRegion {
  return REGIONS.some((region) => region === value)
}

function optionalText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    throw new AuthError('invalid_request', 'Invalid profile field', 400)
  }

  const result = value.trim()

  if (result.length > maxLength) {
    throw new AuthError('invalid_request', 'Profile field is too long', 400)
  }

  return result
}

export async function handleUpdateProfile(request: Request): Promise<Response> {
  const originError = checkOrigin(request)

  if (originError) return originError

  try {
    const { user, payload, req, responseHeaders } =
      await authenticateRequest(request)

    if (!user || user.collection !== 'customers' || user.isBlocked) {
      throw new AuthError('unauthorized', 'Sign in first', 401)
    }

    let body: ProfileBody

    try {
      const data: unknown = await request.json()

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid request body')
      }

      body = data as ProfileBody
    } catch {
      throw new AuthError('invalid_request', 'Invalid request body', 400)
    }

    const name = optionalText(body.name, 120)
    const phone = optionalText(body.phone, 30)
    const username = optionalText(body.username, 33)

    const deliveryRegion = optionalText(body.deliveryRegion, 30)
    const deliveryMethod = optionalText(body.deliveryMethod, 50)
    const deliveryAddress = optionalText(body.deliveryAddress, 500)
    const cdekPointCode = optionalText(body.cdekPointCode, 100)

    if (!name) {
      throw new AuthError('name_required', 'Name is required', 400)
    }

    if (deliveryRegion && !isDeliveryRegion(deliveryRegion)) {
      throw new AuthError('invalid_request', 'Invalid delivery region', 400)
    }

    if (
      deliveryMethod &&
      !METHODS.some((method) => method === deliveryMethod)
    ) {
      throw new AuthError('invalid_request', 'Invalid delivery method', 400)
    }

    const hasDeliveryData = Boolean(
      deliveryRegion || deliveryMethod || deliveryAddress || cdekPointCode,
    )

    if (
      hasDeliveryData &&
      (!deliveryRegion || !deliveryMethod || !deliveryAddress)
    ) {
      throw new AuthError(
        'invalid_request',
        'Delivery region, method and address are required',
        400,
      )
    }

    const usesCdekMap =
      deliveryMethod === 'cdek' &&
      (
        deliveryRegion === 'belarus' ||
        deliveryRegion === 'moscow' ||
        deliveryRegion === 'russia'
      )

    if (!usesCdekMap && cdekPointCode) {
      throw new AuthError(
        'invalid_request',
        'Unexpected CDEK pickup point',
        400,
      )
    }

    const existingAddresses = user.addresses ?? []

    const defaultIndex = existingAddresses.findIndex(
      (address) => address.isDefault,
    )

    let addresses = [...existingAddresses]

    if (deliveryAddress) {
      const previousDefault =
        defaultIndex >= 0
          ? existingAddresses[defaultIndex]
          : undefined

      const updatedDefault = {
        ...previousDefault,
        deliveryMethod,
        address: deliveryAddress,
        isDefault: true,
      }

      if (defaultIndex >= 0) {
        addresses[defaultIndex] = updatedDefault
      } else {
        if (addresses.length >= 5) {
          throw new AuthError(
            'invalid_request',
            'Maximum number of addresses reached',
            400,
          )
        }

        addresses.push(updatedDefault)
      }
    } else if (defaultIndex >= 0) {
      addresses = addresses.filter(
        (_, index) => index !== defaultIndex,
      )
    }

    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        name,
        phone: phone || null,
        username: username || null,

        deliveryRegion:
          deliveryRegion && isDeliveryRegion(deliveryRegion)
            ? deliveryRegion
            : null,

        cdekPointCode: usesCdekMap ? cdekPointCode : null,

        addresses,
      },
      user,
      req,
      overrideAccess: false,
    })

    const headers = new Headers(responseHeaders)
    headers.set('Cache-Control', 'no-store')

    return Response.json(
      {
        ok: true,
        customer: sanitizeCustomer(updatedCustomer),
      },
      { headers },
    )
  } catch (error) {
    console.error('Profile update failed:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error',
    })

    return jsonError(error)
  }
}