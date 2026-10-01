import { Button } from "@/shared/ui/button";
import { ArrowRight } from "lucide-react";
import { RiTelegram2Line } from "react-icons/ri";

type CommunitySectionProps = {
  subscriberCount: number;
  channelUrl?: string;
};

function formatCount(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export function Community({
  subscriberCount,
  channelUrl = "https://t.me/dimonclo",
}: CommunitySectionProps) {
  return (
    <section className="w-full border-t-0 border-2 border-black bg-white">
      <div className="grid grid-cols-1 divide-y-2 divide-black sm:grid-cols-[38%_1fr] sm:divide-x-2 sm:divide-y-0">
        <div className="flex flex-col justify-center gap-3 px-8 py-16 sm:px-12 sm:py-24">
          <p className="font-sans text-xl lowercase sm:text-2xl">с нами уже</p>

          <p className="flex flex-wrap items-baseline gap-x-4 leading-none">
            <span
              className="font-display font-extrabold tracking-tight text-red-600"
              style={{ fontSize: "clamp(4rem, 9vw, 8rem)" }}
            >
              {formatCount(subscriberCount)}
            </span>
            <span
              className="font-sans font-extrabold lowercase leading-[1.05] tracking-tight text-black"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              димонов
            </span>
          </p>

          <p className="font-sans text-xl lowercase text-neutral-400">цифра растет каждый день</p>
        </div>
        <div className="flex flex-col justify-between gap-10 px-8 py-16 sm:px-12 sm:py-24">
          <p
            className="font-sans font-extrabold lowercase leading-[1.05] tracking-tight text-black"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            можешь остаться снаружи, но лучше войти в{" "}
            <span className="text-red-600">наши ряды</span>.
          </p>

          <Button
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-fit items-center gap-1"
          >
            <RiTelegram2Line size={20} />
            <span className="ml-1">в телеграм</span>
            <ArrowRight strokeWidth={1.5} className="transition-transform group-hover:-rotate-45" />
          </Button>
        </div>
      </div>
    </section>
  );
}
