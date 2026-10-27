import "server-only";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/bot/@generated/server";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.BOT_API_URL!,
      headers: () => ({ "x-api-key": process.env.NOTIFY_API_KEY! }),
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(3000) }),
    }),
  ],
});
