import { Injectable } from "@nestjs/common";
import { TRPCContext, ContextOptions } from "nestjs-trpc";

@Injectable()
export class AppContext implements TRPCContext {
  create(opts: ContextOptions) {
    return { apiKey: opts.req.headers["x-api-key"] };
  }
}