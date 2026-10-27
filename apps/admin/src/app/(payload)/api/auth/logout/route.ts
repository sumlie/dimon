import { handleLogout } from '@/modules/auth'

export const POST = (request: Request) => handleLogout(request)
