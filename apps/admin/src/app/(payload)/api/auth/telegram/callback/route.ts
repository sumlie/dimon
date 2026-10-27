import { handleTelegramCallback } from '@/modules/auth'

export const GET = (request: Request) => handleTelegramCallback(request)
