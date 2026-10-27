import { handleOAuthCallback } from '@/modules/auth'

export const GET = (request: Request) => handleOAuthCallback('google', request)
