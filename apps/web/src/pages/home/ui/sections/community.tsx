// Community
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
      <div className="grid grid-cols-1 divide-y-2 divide-black lg:grid-cols-[38%_1fr] sm:divide-x-2 lg:divide-y-0">
        <div className="flex flex-col justify-center gap-2 px-5 py-10 sm:gap-3 sm:px-12 sm:py-24 text-center items-center">
          <p className="font-sans text-base lowercase sm:text-2xl">с нами уже</p>

          <p className="flex flex-wrap items-baseline gap-x-3 leading-none sm:gap-x-4">
            <span
              className="font-display font-extrabold tracking-tight text-red-600"
              style={{ fontSize: "clamp(3rem, 15vw, 8rem)" }}
            >
              {formatCount(subscriberCount)}
            </span>
            <span
              className="font-sans font-extrabold lowercase leading-[1.05] tracking-tight text-black"
              style={{ fontSize: "clamp(1.5rem, 7vw, 3.5rem)" }}
            >
              димонов
            </span>
          </p>

          <p className="font-sans text-sm lowercase text-neutral-400 sm:text-xl">
            цифра растет каждый день
          </p>
        </div>

        <div className="flex flex-col justify-between items-center gap-6 px-5 py-10 sm:gap-10 sm:px-12 sm:py-24">
          <p
            className="text-center font-sans font-extrabold lowercase leading-[1.05] tracking-tight text-black"
            style={{ fontSize: "clamp(1.75rem, 7vw, 3.5rem)" }}
          >
            можешь остаться снаружи, но лучше войти в{" "}
            <span className="text-red-600">наши ряды</span>.
          </p>

          <Button
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            fullWidthMobile
            className="group flex items-center justify-center gap-1 w-fit"
          >
            <RiTelegram2Line size={20} />
            <span className="ml-1">в телеграм</span>
            <ArrowRight
              strokeWidth={1.5}
              className="transition-transform group-hover:-rotate-45"
            />
          </Button>
        </div>
      </div>
    </section>
  );
}
