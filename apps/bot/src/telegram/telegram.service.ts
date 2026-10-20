import { Injectable, Logger } from "@nestjs/common";
import { InjectBot } from "@grammyjs/nestjs";
import { Bot, Context } from "grammy";

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private cache: { value: number; fetchedAt: number } | null = null;
  private inflight: Promise<number> | null = null;
  private readonly TTL_MS = 5 * 60 * 1000;

  private readonly CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;
  private readonly MODERATOR_IDS = (process.env.MODERATOR_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number);

  constructor(@InjectBot() private readonly bot: Bot<Context>) {}

  async getChannelSubscriberCount(): Promise<number> {
    const now = Date.now();

    if (this.cache && now - this.cache.fetchedAt < this.TTL_MS) {
      return this.cache.value;
    }

    if (this.inflight) return this.inflight;

    this.inflight = this.bot.api
      .getChatMemberCount(this.CHANNEL_ID)
      .then((value) => {
        this.cache = { value, fetchedAt: Date.now() };
        return value;
      })
      .catch((error) => {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(`getChatMemberCount failed: ${msg}`);

        if (this.cache) return this.cache.value;
        throw error;
      })
      .finally(() => {
        this.inflight = false as any;
        this.inflight = null;
      });

    return this.inflight;
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