import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Header,
} from "@nestjs/common";
import { TelegramService } from "../telegram/telegram.service";
import { MessageDto } from "./dto/message.dto";

@Controller()
export class ModeratorController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get("subscribers")
  @Header("Content-Type", "text/plain; charset=utf-8")
  async getSubscribers(): Promise<string> {
    return String(await this.telegramService.getChannelSubscriberCount());
  }

  @Post("notify")
  @HttpCode(HttpStatus.OK)
  async notify(@Body() body: MessageDto) {
    await this.telegramService.sendToModerators(body.text, body.parse_mode);
    return { ok: true };
  }
}