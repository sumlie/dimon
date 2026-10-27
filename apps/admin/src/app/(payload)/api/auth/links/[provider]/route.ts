import { handleUnlinkProvider } from '@/modules/auth'

export const DELETE = (
  request: Request,
  context: { params: Promise<{ provider: string }> },
) => context.params.then(({ provider }) => handleUnlinkProvider(request, provider))
