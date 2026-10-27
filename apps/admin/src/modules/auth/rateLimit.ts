import { AuthError } from './errors'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function cleanup(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export function enforceRateLimit(args: {
  request: Request
  scope: string
  limit: number
  windowMs: number
}): void {
  const now = Date.now()
  cleanup(now)

  const key = `${args.scope}:${clientIp(args.request)}`
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + args.windowMs })
    return
  }

  existing.count += 1
  if (existing.count > args.limit) {
    throw new AuthError('rate_limited', 'Too many authentication attempts', 429)
  }
}
