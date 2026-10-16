import { Injectable, Logger } from "@nestjs/common";
import { InjectBot } from "@grammyjs/nestjs";
import { Bot, Context } from "grammy";

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private readonly CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;
  private readonly MODERATOR_IDS = (process.env.MODERATOR_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number);

  constructor(@InjectBot() private readonly bot: Bot<Context>) {}

  async getChannelSubscriberCount(): Promise<number> {
    try {
      return await this.bot.api.getChatMemberCount(this.CHANNEL_ID);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`getChatMemberCount failed: ${msg}`);
      throw error;
    }
  }

  async sendToModerators(text: string, parseMode?: string): Promise<void> {
    const results = await Promise.allSettled(
      this.MODERATOR_IDS.map((id) =>
        this.bot.api.sendMessage(id, text, {
          parse_mode: parseMode as any,
        }),
      ),
    );

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        this.logger.error(
          `Failed to send to ${this.MODERATOR_IDS[i]}: ${r.reason?.description || r.reason}`,
        );
      }
    });
  }
}