export const AUTH_ERROR_TEXT: Record<string, string> = {
  invalid_state: "Сессия входа истекла. Попробуйте снова.",
  state_expired: "Сессия входа истекла. Попробуйте снова.",
  provider_error: "Провайдер вернул ошибку. Попробуйте снова.",
  provider_not_configured: "Этот способ входа пока не настроен.",
  email_exists:
    "Аккаунт с таким email уже существует. Войдите в него, чтобы привязать провайдера.",
  identity_taken: "Этот аккаунт уже привязан к другому покупателю.",
  blocked: "Аккаунт заблокирован.",
  rate_limited: "Слишком много попыток. Попробуйте позже.",
  cancelled: "Вход отменён.",
  last_login_method: "Нельзя отвязать единственный способ входа.",
  email_required: "Укажите email.",
  name_required: "Укажите имя.",
  invalid_request: "Проверьте введённые данные.",
  unauthorized: "Сначала войдите в аккаунт.",
  not_found: "Провайдер не привязан.",
  internal_error: "Не удалось выполнить действие. Попробуйте позже.",
};

export function authErrorText(code: string | null | undefined): string | null {
  if (!code) return null;
  return AUTH_ERROR_TEXT[code] || AUTH_ERROR_TEXT.internal_error;
}
