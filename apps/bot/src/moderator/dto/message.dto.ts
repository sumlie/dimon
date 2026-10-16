import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsIn(["HTML", "Markdown", "MarkdownV2"])
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
}