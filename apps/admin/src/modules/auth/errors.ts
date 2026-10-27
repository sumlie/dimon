export type AuthErrorCode =
  | 'cancelled'
  | 'provider_error'
  | 'invalid_state'
  | 'state_expired'
  | 'invalid_callback'
  | 'provider_not_configured'
  | 'rate_limited'
  | 'blocked'
  | 'email_required'
  | 'name_required'
  | 'email_exists'
  | 'identity_taken'
  | 'last_login_method'
  | 'unauthorized'
  | 'not_found'
  | 'invalid_request'
  | 'internal_error'

export class AuthError extends Error {
  readonly code: AuthErrorCode
  readonly status: number

  constructor(code: AuthErrorCode, message?: string, status = 400) {
    super(message || code)
    this.name = 'AuthError'
    this.code = code
    this.status = status
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function errorMessage(error: unknown): string {
  if (isAuthError(error)) return error.code
  return 'internal_error'
}

export function jsonError(error: unknown): Response {
  const authError = isAuthError(error)
    ? error
    : new AuthError('internal_error', 'Internal authentication error', 500)

  return Response.json(
    { error: authError.code },
    {
      status: authError.status,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
