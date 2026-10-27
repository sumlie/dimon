import { handleOAuthStart } from '@/modules/auth'

export const GET = (request: Request) => handleOAuthStart('yandex', request)
