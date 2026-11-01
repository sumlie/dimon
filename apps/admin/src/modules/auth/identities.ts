import type { Payload, PayloadRequest } from 'payload'

import type { SocialProviderId } from './config'
import { AuthError } from './errors'
import { Customer } from '@/payloadTypes'

export type CustomerIdentity = {
  id: number
  customer: number | { id: number }
  provider: SocialProviderId
  providerId: string
  email?: string | null
  emailVerified?: boolean | null
  linkedAt?: string | null
  lastLoginAt?: string | null
}

export function identityCustomerId(identity: CustomerIdentity): number {
  return typeof identity.customer === 'object' ? identity.customer.id : identity.customer
}

export async function findIdentity(
  payload: Payload,
  provider: SocialProviderId,
  providerId: string,
): Promise<CustomerIdentity | null> {
  const result = await payload.find({
    collection: 'customer-identities',
    where: {
      and: [{ provider: { equals: provider } }, { providerId: { equals: providerId } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (result.docs[0] as CustomerIdentity | undefined) || null
}

export async function listCustomerIdentities(
  payload: Payload,
  customerId: number,
): Promise<CustomerIdentity[]> {
  const result = await payload.find({
    collection: 'customer-identities',
    where: { customer: { equals: customerId } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs as CustomerIdentity[]
}

export async function createIdentity(
  payload: Payload,
  req: PayloadRequest,
  data: {
    customer: number
    provider: SocialProviderId
    providerId: string
    email?: string
    emailVerified: boolean
  },
): Promise<CustomerIdentity> {
  try {
    const identity = await payload.create({
      collection: 'customer-identities',
      data: {
        ...data,
        linkedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      overrideAccess: true,
      req,
    })

    return identity as CustomerIdentity
  } catch (error) {
    const existing = await findIdentity(payload, data.provider, data.providerId)
    if (existing) {
      throw new AuthError('identity_taken', 'This social account is already linked', 409)
    }
    throw error
  }
}

export async function updateIdentityLastLogin(
  payload: Payload,
  req: PayloadRequest,
  identity: CustomerIdentity,
  fresh?: { email?: string; emailVerified: boolean },
): Promise<void> {
  await payload.update({
    collection: 'customer-identities',
    id: identity.id,
    data: {
      lastLoginAt: new Date().toISOString(),
      ...(fresh?.email ? { email: fresh.email } : {}),
      ...(fresh ? { emailVerified: fresh.emailVerified } : {}),
    },
    overrideAccess: true,
    req,
  })
}

export async function findCustomerByEmail(
  payload: Payload,
  email: string,
): Promise<{ id: number } | null> {
  const result = await payload.find({
    collection: 'customers',
    where: { email: { equals: email.toLowerCase().trim() } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (result.docs[0] as { id: number } | undefined) || null
}

export async function getCustomer(
  payload: Payload,
  customerId: number,
  req?: PayloadRequest,
): Promise<Customer | null> {
  const result = await payload.find({
    collection: 'customers',
    where: {
      id: {
        equals: customerId,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
    req,
  })

  return result.docs[0] ?? null
}