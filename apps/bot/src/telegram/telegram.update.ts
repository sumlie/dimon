import { Injectable } from "@nestjs/common";
import { Update, Start, Ctx } from "@grammyjs/nestjs";
import { Context } from "grammy";

@Update()
@Injectable()
export class TelegramUpdate {
  private readonly MODERATOR_IDS = (process.env.MODERATOR_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number);

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    if (!ctx.from || !this.MODERATOR_IDS.includes(ctx.from.id)) {
      return;
    }

    await ctx.reply(
      "Этот бот не принимает сообщения. Он только присылает уведомления о новых заказах и изменениях их статусов.",
    );
  }
}