// @vitest-environment node

import { createPayloadRequest, getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createCustomerSession } from '@/modules/auth/session'
import {
  completeOnboarding,
  logoutCustomer,
  signInWithIdentity,
  unlinkProvider,
} from '@/modules/auth/service'
import type { ProviderIdentity } from '@/modules/auth/providers'

let payload: Payload

describe('social session strategy', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    // The test database is the local dev database; remove only rows created by tests.
    const docs = await payload.find({
      collection: 'customers',
      where: { email: { like: 'social-test-' } },
      limit: 100,
      overrideAccess: true,
    })
    for (const doc of docs.docs) {
      await payload.delete({ collection: 'customers', id: doc.id, overrideAccess: true })
    }
  })

  async function createTestCustomer(suffix: string, socialOnly = true) {
    return payload.create({
      collection: 'customers',
      data: {
        email: `social-test-${Date.now()}-${suffix}@example.invalid`,
        name: 'Social Test',
        password: 'random-password-for-tests',
        socialOnly,
        registrationCompletedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  }

  it('authenticates a customer from the social session cookie', async () => {
    const customer = await createTestCustomer('session')
    const providerId = `test-${Date.now()}`
    await payload.create({
      collection: 'customer-identities',
      data: {
        customer: customer.id,
        provider: 'google',
        providerId,
        email: customer.email,
        emailVerified: true,
      },
      overrideAccess: true,
    })

    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })
    const session = await createCustomerSession({
      payload,
      req,
      customer,
      provider: 'google',
    })

    const auth = await payload.auth({
      canSetHeaders: true,
      headers: new Headers({ cookie: session.cookie }),
      req,
    })

    expect(auth.user?.id).toBe(customer.id)
    expect(auth.user?.collection).toBe('customers')
    expect(session.cookie).toContain('dimon_customer_session_v2=')
    expect(session.cookie).toContain('Path=/api/auth')
  })

  it('does not authenticate a customer session on admin routes', async () => {
    const customer = await createTestCustomer('admin-isolation')
    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })
    const session = await createCustomerSession({
      payload,
      req,
      customer,
      provider: 'google',
    })

    const headers = new Headers({ cookie: session.cookie })
    const adminReq = await createPayloadRequest({
      payload,
      req: { headers, url: 'http://localhost/admin' },
    })
    const auth = await payload.auth({ headers, req: adminReq })

    expect(auth.user).toBeNull()
  })

  it('rejects blocked customers even with a valid session', async () => {
    const customer = await createTestCustomer('blocked')
    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })
    const session = await createCustomerSession({
      payload,
      req,
      customer,
      provider: 'telegram',
    })

    await payload.update({
      collection: 'customers',
      id: customer.id,
      data: { isBlocked: true },
      overrideAccess: true,
    })

    const auth = await payload.auth({
      canSetHeaders: true,
      headers: new Headers({ cookie: session.cookie }),
      req,
    })

    expect(auth.user).toBeNull()
  })

  it('revokes the current session on logout', async () => {
    const customer = await createTestCustomer('logout')
    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })
    const session = await createCustomerSession({
      payload,
      req,
      customer,
      provider: 'google',
    })

    const auth = await payload.auth({
      canSetHeaders: true,
      headers: new Headers({ cookie: session.cookie }),
      req,
    })
    expect(auth.user?.id).toBe(customer.id)
    if (!auth.user) throw new Error('expected authenticated user')

    await logoutCustomer({ payload, req, customer: auth.user })

    const afterLogout = await payload.auth({
      canSetHeaders: true,
      headers: new Headers({ cookie: session.cookie }),
      req,
    })
    expect(afterLogout.user).toBeNull()
  })

  it('does not allow unlinking the last provider for social-only customers', async () => {
    const customer = await createTestCustomer('unlink')
    await payload.create({
      collection: 'customer-identities',
      data: {
        customer: customer.id,
        provider: 'yandex',
        providerId: `test-${Date.now()}`,
        email: customer.email,
      },
      overrideAccess: true,
    })

    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })

    await expect(
      unlinkProvider({
        payload,
        req,
        customerId: customer.id,
        provider: 'yandex',
      }),
    ).rejects.toThrowError('Cannot unlink the last login method without a password')
  })

  it('logs in repeatedly without duplicating customer or identity, then links and unlinks providers', async () => {
    const email = `social-test-flow-${Date.now()}@example.invalid`
    const providerId = `flow-${Date.now()}`
    const identity: ProviderIdentity = {
      provider: 'google',
      providerId,
      email,
      emailVerified: true,
      name: 'Flow User',
    }
    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })

    const first = await signInWithIdentity({
      payload,
      req,
      identity,
      mode: 'login',
      consent: true,
      redirectTo: '/account',
    })

    expect(first.type).toBe('session')
    if (first.type !== 'session') throw new Error('expected session')
    const customerId = first.customer.id

    const second = await signInWithIdentity({
      payload,
      req,
      identity,
      mode: 'login',
      consent: true,
      redirectTo: '/account',
    })

    expect(second.type).toBe('session')
    if (second.type !== 'session') throw new Error('expected session')
    expect(second.customer.id).toBe(customerId)

    const afterLogin = await payload.find({
      collection: 'customer-identities',
      where: { customer: { equals: customerId } },
      overrideAccess: true,
    })
    expect(afterLogin.docs).toHaveLength(1)

    const linked = await signInWithIdentity({
      payload,
      req,
      identity: {
        provider: 'yandex',
        providerId: `flow-yandex-${Date.now()}`,
        email,
        emailVerified: false,
        name: 'Flow User',
      },
      mode: 'link',
      customerId,
      consent: true,
      redirectTo: '/account',
    })
    expect(linked.type).toBe('linked')

    const afterLink = await payload.find({
      collection: 'customer-identities',
      where: { customer: { equals: customerId } },
      overrideAccess: true,
    })
    expect(afterLink.docs).toHaveLength(2)

    await unlinkProvider({ payload, req, customerId, provider: 'google' })

    const afterUnlink = await payload.find({
      collection: 'customer-identities',
      where: { customer: { equals: customerId } },
      overrideAccess: true,
    })
    expect(afterUnlink.docs).toHaveLength(1)

    await expect(
      unlinkProvider({ payload, req, customerId, provider: 'yandex' }),
    ).rejects.toThrowError('Cannot unlink the last login method without a password')
  })

  it('does not auto-merge a provider identity with an existing customer email', async () => {
    const email = `social-test-conflict-${Date.now()}@example.invalid`
    await payload.create({
      collection: 'customers',
      data: {
        email,
        name: 'Existing Customer',
        password: 'existing-password',
        socialOnly: false,
      },
      overrideAccess: true,
    })

    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })

    await expect(
      signInWithIdentity({
        payload,
        req,
        identity: {
          provider: 'google',
          providerId: `conflict-${Date.now()}`,
          email,
          emailVerified: true,
          name: 'Different Person',
        },
        mode: 'login',
        consent: true,
        redirectTo: '/account',
      }),
    ).rejects.toThrowError(/account with this email already exists/i)
  })

  it('creates a customer after onboarding when the provider has no email', async () => {
    const req = await createPayloadRequest({
      payload,
      req: { headers: new Headers() },
    })

    const started = await signInWithIdentity({
      payload,
      req,
      identity: {
        provider: 'telegram',
        providerId: `onboarding-${Date.now()}`,
        emailVerified: false,
        name: undefined,
      },
      mode: 'login',
      consent: true,
      redirectTo: '/account',
    })

    expect(started.type).toBe('onboarding')
    if (started.type !== 'onboarding') throw new Error('expected onboarding')

    const email = `social-test-onboarding-${Date.now()}@example.invalid`
    const completed = await completeOnboarding({
      payload,
      req,
      profile: started.profile,
      email,
      name: 'Telegram User',
      consent: true,
    })

    expect(completed.customer.email).toBe(email)
    expect(completed.customer.name).toBe('Telegram User')
    expect(completed.customer.socialOnly).toBe(true)
  })
})
