import { handleUpdateProfile } from '@/modules/auth'

export const PATCH = (request: Request) => handleUpdateProfile(request)