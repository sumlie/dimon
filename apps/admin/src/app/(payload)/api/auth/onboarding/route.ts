import { handleOnboarding, handleOnboardingProfile } from '@/modules/auth'

export const GET = (request: Request) => handleOnboardingProfile(request)
export const POST = (request: Request) => handleOnboarding(request)
