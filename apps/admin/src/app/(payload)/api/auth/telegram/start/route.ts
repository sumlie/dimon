import { handleTelegramStart } from '@/modules/auth'

export const GET = (request: Request) => handleTelegramStart(request)
