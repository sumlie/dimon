# Social authentication

The storefront supports Google, Yandex and Telegram login. Payload remains the source of truth for customers and sessions.

## Architecture

- OAuth endpoints live in `apps/admin/src/app/(payload)/api/auth`.
- The storefront proxies `/api/auth/*` to `apps/admin` (`ADMIN_API_URL`).
- Google and Yandex use the authorization code flow with PKCE and a signed, single-use `state` cookie.
- Telegram uses the official Login Widget. The widget payload is verified server-side with HMAC-SHA256 and a freshness check.
- Social links are stored in `customer-identities` with a unique `(provider, providerId)` index.
- Social sessions use an HttpOnly `dimon_customer_session` cookie and Payload's `customers.sessions` storage. Payload's local JWT strategy is kept for future email/password login.

## Environment

Set these variables in `apps/admin/.env`:

```dotenv
APP_URL=https://example.com
ADMIN_URL=https://admin.example.com
COOKIE_DOMAIN=.example.com
TRUSTED_REDIRECT_ORIGINS=https://example.com
PAYLOAD_SECRET=...
OAUTH_SESSION_SECRET=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://example.com/api/auth/google/callback

YANDEX_CLIENT_ID=...
YANDEX_CLIENT_SECRET=...
YANDEX_REDIRECT_URI=https://example.com/api/auth/yandex/callback

TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
TELEGRAM_AUTH_MAX_AGE=300
```

Set `ADMIN_API_URL` in `apps/web` to the admin origin. `COOKIE_DOMAIN` must be the shared parent domain so the session cookie is sent by the storefront.

## Google Cloud setup

1. Create a project and an OAuth 2.0 Client ID of type **Web application**.
2. Add an authorized redirect URI: `https://example.com/api/auth/google/callback`.
3. Add the storefront origin to authorized JavaScript origins if the Google button is rendered by Google SDKs.
4. Copy the client ID and secret into the admin environment.
5. The callback verifies the ID token signature, `iss`, `aud`, expiry and `nonce`. `emailVerified` is set only when Google returns `email_verified: true`.

## Yandex OAuth setup

1. Create an application at `https://oauth.yandex.ru/`.
2. Select the **Web services** platform.
3. Add the redirect URI: `https://example.com/api/auth/yandex/callback`.
4. Grant `login:email` and `login:info` scopes.
5. Copy the client ID and secret into the admin environment.
6. Yandex does not return an email verification flag, so `emailVerified` stays `false` until a separate verification flow exists.

## Telegram setup

1. Create a bot with BotFather and copy its token.
2. Set the bot username in `TELEGRAM_BOT_USERNAME`.
3. Configure the Login Widget domain for the bot in BotFather (the storefront domain).
4. Set `TELEGRAM_BOT_TOKEN` on the server only. Never expose it to the browser.
5. Telegram does not provide an email. The user is redirected to `/auth/complete` to enter a name and email before a customer is created.

## API endpoints

```
GET    /api/auth/google/start
GET    /api/auth/google/callback
GET    /api/auth/yandex/start
GET    /api/auth/yandex/callback
GET    /api/auth/telegram/start
GET    /api/auth/telegram/callback
GET    /api/auth/onboarding
POST   /api/auth/onboarding
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/auth/links
DELETE /api/auth/links/:provider
```

Link mode is started with `?mode=link`. It requires an active customer session and re-checks that session in the callback.

## Email and verification

- Existing customers and `accounts[]` data are preserved.
- `customers.accounts[]` is deprecated and hidden; data is migrated to `customer-identities`.
- Google accounts with `email_verified: true` get `emailVerifiedAt` and Payload `_verified`.
- Yandex and Telegram emails are stored without claiming verification.
- A customer is not auto-merged with an existing email. If the email already exists, the user must sign in and link the provider explicitly.

## Migrations

```bash
pnpm --filter admin migrate
pnpm --filter admin migrate:create
pnpm --filter admin migrate:status
```

The migration `20261027_182612_add_customer_identities` is idempotent for existing databases and creates the new collection, indexes, audit table, and backfills `customers_accounts`. Conflicting legacy rows are written to `customer_identity_conflicts` instead of being deleted.

## Security notes

- State cookies are signed, HttpOnly, short-lived and single-use.
- PKCE S256 is used for Google and Yandex.
- Redirects are restricted to relative paths on the storefront.
- State-changing requests check the `Origin`/`Referer` against `TRUSTED_REDIRECT_ORIGINS`.
- Auth endpoints are rate-limited per IP in memory. For multi-instance deployments, replace the limiter with a shared store.
- OAuth tokens and secrets are never stored in customer records or logged.
- Blocking a customer clears their sessions; the social session strategy also rejects blocked customers on every request.
