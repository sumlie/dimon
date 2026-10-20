import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import {
  TRPCMiddleware,
  MiddlewareOptions,
} from "nestjs-trpc";
import { timingSafeEqual } from "crypto";

@Injectable()
export class ApiMiddleware implements TRPCMiddleware {
  private readonly key = Buffer.from(process.env.NOTIFY_API_KEY ?? "");

  use(opts: MiddlewareOptions) {
    const { apiKey } = opts.ctx as { apiKey?: string | string[] };

    if (typeof apiKey !== "string" || this.key.length === 0) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const given = Buffer.from(apiKey);
    if (given.length !== this.key.length || !timingSafeEqual(given, this.key)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next();
  }
}