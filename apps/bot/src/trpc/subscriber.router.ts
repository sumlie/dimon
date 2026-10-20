import { Router, Query } from "nestjs-trpc";
import { z } from "zod";
import { TelegramService } from "../telegram/telegram.service";
import { Inject } from "@nestjs/common";

@Router({ alias: "subscribers" })
export class SubscriberRouter {
  constructor(
    @Inject(TelegramService) private readonly telegramService: TelegramService,
  ) {}

  @Query({
    output: z.number(), 
  })
  async count(): Promise<number> {
    return this.telegramService.getChannelSubscriberCount();
  }
}