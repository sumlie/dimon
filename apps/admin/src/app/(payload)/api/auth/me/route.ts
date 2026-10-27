import { handleMe } from '@/modules/auth'

export const GET = (request: Request) => handleMe(request)
