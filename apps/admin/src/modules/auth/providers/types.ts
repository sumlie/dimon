import type { AuthProviderId } from '../config'

export type ProviderIdentity = {
  provider: AuthProviderId
  providerId: string
  email?: string
  emailVerified: boolean
  name?: string
  username?: string
}

export type OAuthProvider = {
  id: Exclude<AuthProviderId, 'telegram'>
  buildAuthorizationUrl: (args: { state: string; codeChallenge: string; nonce: string }) => URL
  exchangeCode: (args: {
    code: string
    codeVerifier: string
    nonce: string
  }) => Promise<ProviderIdentity>
}
