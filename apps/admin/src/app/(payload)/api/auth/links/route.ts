import { handleLinks } from '@/modules/auth'

export const GET = (request: Request) => handleLinks(request)
