import { Inject } from "@nestjs/common";
import { Router, Mutation, Input, UseMiddlewares } from "nestjs-trpc";
import { z } from "zod";
import { TelegramService } from "../telegram/telegram.service";
import { ApiMiddleware } from "./api.middleware";

@Router({ alias: "notify" })
@UseMiddlewares(ApiMiddleware)
export class NotifyRouter {
  constructor(
    @Inject(TelegramService) private readonly telegramService: TelegramService,
  ) {
    console.log("NotifyRouter created");
  }

  @Mutation({
    input: z.object({ text: z.string().min(1).max(4000) }),
    output: z.object({ ok: z.boolean() }),
  })
  async send(@Input("text") text: string) {
    await this.telegramService.sendToModerators(text);
    return { ok: true };
  }
}