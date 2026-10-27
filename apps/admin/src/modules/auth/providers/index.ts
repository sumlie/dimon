import type { AuthProviderId } from '../config'
import { googleProvider } from './google'
import type { OAuthProvider } from './types'
import { yandexProvider } from './yandex'

export const oauthProviders: Record<Exclude<AuthProviderId, 'telegram'>, OAuthProvider> = {
  google: googleProvider,
  yandex: yandexProvider,
}

export function getOAuthProvider(provider: AuthProviderId): OAuthProvider {
  if (provider === 'telegram') {
    throw new Error('Telegram uses the login widget, not OAuth')
  }
  return oauthProviders[provider]
}

export { verifyTelegramWidget } from './telegram'
export type { OAuthProvider, ProviderIdentity } from './types'
