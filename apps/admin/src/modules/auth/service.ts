import type { Payload, PayloadRequest } from 'payload'

import { AuthError } from './errors'
import {
  createIdentity,
  findCustomerByEmail,
  findIdentity,
  getCustomer,
  identityCustomerId,
  listCustomerIdentities,
  updateIdentityLastLogin,
  type CustomerIdentity,
} from './identities'
import { createCustomerSession, revokeCustomerSession, type SessionResult } from './session'
import { createPendingCookie, randomToken, type PendingProfile } from './state'
import type { ProviderIdentity } from './providers'
import type { OAuthMode } from './state'

export type SignInResult =
  | { type: 'session'; customer: any; session: SessionResult; redirectTo: string }
  | {
      type: 'onboarding'
      pendingCookie: string
      profile: PendingProfile
      redirectTo: string
    }
  | { type: 'linked'; customer: any; redirectTo: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function requireEmail(email: string | undefined | null): string {
  if (!email) throw new AuthError('email_required', 'Email is required', 400)
  const normalized = normalizeEmail(email)
  if (!EMAIL_RE.test(normalized)) {
    throw new AuthError('invalid_request', 'Email is invalid', 400)
  }
  return normalized
}

function requireName(name: string | undefined | null): string {
  const normalized = name?.trim()
  if (!normalized) {
    throw new AuthError('name_required', 'Name is required', 400)
  }
  if (normalized.length > 120) {
    throw new AuthError('invalid_request', 'Name is too long', 400)
  }
  return normalized
}

export function sanitizeCustomer(customer: any) {
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    username: customer.username || null,
    phone: customer.phone || null,
    addresses: customer.addresses || [],
    defaultPaymentMethod: customer.defaultPaymentMethod || null,
    emailVerifiedAt: customer.emailVerifiedAt || null,
    registrationCompletedAt: customer.registrationCompletedAt || null,
    createdAt: customer.createdAt,
  }
}

export function sanitizeIdentity(identity: CustomerIdentity) {
  return {
    provider: identity.provider,
    providerId: identity.providerId,
    email: identity.email || null,
    emailVerified: Boolean(identity.emailVerified),
    linkedAt: identity.linkedAt || null,
    lastLoginAt: identity.lastLoginAt || null,
  }
}

export async function getCustomerProfile(payload: Payload, customerId: number) {
  const customer = await getCustomer(payload, customerId)
  if (!customer) throw new AuthError('not_found', 'Customer not found', 404)
  const identities = await listCustomerIdentities(payload, customerId)

  return {
    customer: sanitizeCustomer(customer),
    identities: identities.map(sanitizeIdentity),
  }
}

function pendingProfile(
  identity: ProviderIdentity,
  consent: boolean,
  redirectTo: string,
): PendingProfile {
  return {
    provider: identity.provider,
    providerId: identity.providerId,
    email: identity.email,
    emailVerified: identity.emailVerified,
    name: identity.name,
    username: identity.username,
    consent,
    redirectTo,
  }
}

async function createCustomerWithIdentity(args: {
  payload: Payload
  req: PayloadRequest
  profile: PendingProfile
  email: string
  name: string
  consent: boolean
}): Promise<{ customer: any; identity: CustomerIdentity }> {
  const { payload, req, profile, email, name, consent } = args

  if (!consent) {
    throw new AuthError('invalid_request', 'Consent is required', 400)
  }

  const existingCustomer = await findCustomerByEmail(payload, email)
  if (existingCustomer) {
    throw new AuthError(
      'email_exists',
      'An account with this email already exists. Sign in first to link this provider.',
      409,
    )
  }

  const now = new Date().toISOString()

  let customer: any
  try {
    customer = await payload.create({
      collection: 'customers',
      data: {
        email,
        name,
        password: randomToken(32),
        socialOnly: true,
        ...(profile.emailVerified ? { _verified: true, emailVerifiedAt: now } : {}),
        consentAt: now,
        registrationCompletedAt: now,
      } as any,
      overrideAccess: true,
      req,
    })
  } catch {
    const racedCustomer = await findCustomerByEmail(payload, email)
    if (racedCustomer) {
      throw new AuthError(
        'email_exists',
        'An account with this email already exists. Sign in first to link this provider.',
        409,
      )
    }
    throw new AuthError('internal_error', 'Could not create customer', 500)
  }

  try {
    const identity = await createIdentity(payload, req, {
      customer: customer.id,
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email,
      emailVerified: profile.emailVerified,
    })

    return { customer, identity }
  } catch (error) {
    // Do not leave an orphan customer if the identity was linked concurrently.
    await payload.delete({
      collection: 'customers',
      id: customer.id,
      overrideAccess: true,
      req,
    })
    throw error
  }
}

export async function signInWithIdentity(args: {
  payload: Payload
  req: PayloadRequest
  identity: ProviderIdentity
  mode: OAuthMode
  customerId?: number
  consent: boolean
  redirectTo: string
}): Promise<SignInResult> {
  const { payload, req, identity, mode, customerId, consent, redirectTo } = args

  if (mode === 'link') {
    if (!customerId) {
      throw new AuthError('unauthorized', 'Sign in before linking a provider', 401)
    }

    const customer = await getCustomer(payload, customerId, req)
    if (!customer || customer.isBlocked) {
      throw new AuthError('unauthorized', 'Customer session is not valid', 401)
    }

    const existing = await findIdentity(payload, identity.provider, identity.providerId)
    if (existing) {
      if (String(identityCustomerId(existing)) !== String(customer.id)) {
        throw new AuthError('identity_taken', 'This social account is already linked', 409)
      }
      await updateIdentityLastLogin(payload, req, existing, identity)
      return { type: 'linked', customer, redirectTo }
    }

    await createIdentity(payload, req, {
      customer: customer.id,
      provider: identity.provider,
      providerId: identity.providerId,
      email: identity.email,
      emailVerified: identity.emailVerified,
    })

    return { type: 'linked', customer, redirectTo }
  }

  const existing = await findIdentity(payload, identity.provider, identity.providerId)
  if (existing) {
    const customer = await getCustomer(payload, identityCustomerId(existing), req)
    if (!customer) throw new AuthError('internal_error', 'Linked customer was not found', 500)
    if (customer.isBlocked) throw new AuthError('blocked', 'Account is blocked', 403)

    await updateIdentityLastLogin(payload, req, existing, identity)
    const session = await createCustomerSession({
      payload,
      req,
      customer,
      provider: identity.provider,
    })

    return { type: 'session', customer, session, redirectTo }
  }

  const email = identity.email ? normalizeEmail(identity.email) : undefined
  const name = identity.name?.trim()

  if (!email || !name || !consent) {
    const profile = pendingProfile(identity, consent, redirectTo)
    return {
      type: 'onboarding',
      pendingCookie: await createPendingCookie(profile),
      profile,
      redirectTo,
    }
  }

  if (await findCustomerByEmail(payload, email)) {
    throw new AuthError(
      'email_exists',
      'An account with this email already exists. Sign in first to link this provider.',
      409,
    )
  }

  const { customer } = await createCustomerWithIdentity({
    payload,
    req,
    profile: pendingProfile(identity, consent, redirectTo),
    email: requireEmail(email),
    name: requireName(name),
    consent,
  })

  const session = await createCustomerSession({
    payload,
    req,
    customer,
    provider: identity.provider,
  })

  return { type: 'session', customer, session, redirectTo }
}

export async function completeOnboarding(args: {
  payload: Payload
  req: PayloadRequest
  profile: PendingProfile
  email: string
  name: string
  consent: boolean
}): Promise<{ customer: any; session: SessionResult; redirectTo: string }> {
  const { payload, req, profile, email, name, consent } = args
  const normalizedEmail = requireEmail(email)
  const normalizedName = requireName(name)

  const existingIdentity = await findIdentity(payload, profile.provider, profile.providerId)
  if (existingIdentity) {
    const customer = await getCustomer(payload, identityCustomerId(existingIdentity), req)
    if (!customer) throw new AuthError('internal_error', 'Linked customer was not found', 500)
    if (customer.isBlocked) throw new AuthError('blocked', 'Account is blocked', 403)

    const session = await createCustomerSession({
      payload,
      req,
      customer,
      provider: profile.provider,
    })
    return { customer, session, redirectTo: profile.redirectTo }
  }

  const { customer } = await createCustomerWithIdentity({
    payload,
    req,
    profile,
    email: normalizedEmail,
    name: normalizedName,
    consent,
  })

  const session = await createCustomerSession({
    payload,
    req,
    customer,
    provider: profile.provider,
  })

  return { customer, session, redirectTo: profile.redirectTo }
}

export async function unlinkProvider(args: {
  payload: Payload
  req: PayloadRequest
  customerId: number
  provider: string
}): Promise<void> {
  const { payload, req, customerId, provider } = args
  const customer = await getCustomer(payload, customerId, req)
  if (!customer) throw new AuthError('unauthorized', 'Customer session is not valid', 401)
  if (customer.isBlocked) throw new AuthError('blocked', 'Account is blocked', 403)

  const identities = await listCustomerIdentities(payload, customerId)
  const identity = identities.find((item) => item.provider === provider)
  if (!identity) throw new AuthError('not_found', 'Provider is not linked', 404)

  const hasPassword = Boolean(customer.hash) && !customer.socialOnly
  if (identities.length <= 1 && !hasPassword) {
    throw new AuthError(
      'last_login_method',
      'Cannot unlink the last login method without a password',
      409,
    )
  }

  await payload.delete({
    collection: 'customer-identities',
    id: identity.id,
    overrideAccess: true,
    req,
  })
}

export async function logoutCustomer(args: {
  payload: Payload
  req: PayloadRequest
  customer: any
}): Promise<void> {
  const { payload, req, customer } = args
  await revokeCustomerSession({
    payload,
    req,
    customer,
    sid: customer._sid,
  })
}
