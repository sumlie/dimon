import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestjsGrammyModule } from "@grammyjs/nestjs";
import { TelegramUpdate } from "./telegram/telegram.update";
import { TelegramService } from "./telegram/telegram.service";
import { ModeratorController } from "./moderator/moderator.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    NestjsGrammyModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN!,
    }),
  ],
  controllers: [ModeratorController],
  providers: [TelegramUpdate, TelegramService],
})
export class AppModule {}