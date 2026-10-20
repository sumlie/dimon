import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestjsGrammyModule } from "@grammyjs/nestjs";
import { TRPCModule } from "nestjs-trpc";
import { TelegramUpdate } from "./telegram/telegram.update";
import { TelegramService } from "./telegram/telegram.service";
import { SubscriberRouter } from "./trpc/subscriber.router";
import { NotifyRouter } from "./trpc/notify.router";
import { ApiMiddleware } from "./trpc/api.middleware";
import { AppContext } from "./trpc/app.context";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env.local", ".env"] }),
    NestjsGrammyModule.forRoot({ token: process.env.TELEGRAM_BOT_TOKEN! }),
    TRPCModule.forRoot({ basePath: "/trpc", context: AppContext }),
  ],
  providers: [
    TelegramUpdate,
    TelegramService,
    SubscriberRouter,
    NotifyRouter,
    ApiMiddleware,
    AppContext,
  ],
})
export class AppModule {}