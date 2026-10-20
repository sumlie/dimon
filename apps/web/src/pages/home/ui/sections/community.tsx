import { Button } from "@/shared/ui/button";
import { ArrowRight } from "lucide-react";
import { RiTelegram2Line } from "react-icons/ri";

type CommunitySectionProps = {
  subscriberCount: number | null;
  channelUrl?: string;
};

export async function Community({
  channelUrl = "https://t.me/dimonclo",
  subscriberCount,
}: CommunitySectionProps) {
  const hasCount = typeof subscriberCount === "number";

  return (
    <section className="w-full bg-white">
      <div className="grid grid-cols-1 divide-y-2 divide-black lg:grid-cols-[40%_1fr] lg:divide-x-4 lg:divide-y-0">
        <div className="flex flex-col justify-center gap-2 px-5 py-10 max-lg:items-center max-lg:text-center sm:gap-3 sm:px-8 sm:py-16 lg:px-10 lg:py-14 xl:py-19">
          <p className="font-sans text-base lowercase sm:text-2xl">с нами уже</p>

          <p
            className="
              flex flex-wrap items-baseline gap-x-[0.15em] font-display font-extrabold leading-none tracking-tight
              max-lg:justify-center xl:flex-nowrap
              text-[clamp(3.5rem,14vw,8rem)]
              lg:text-[clamp(3rem,6.5vw,9rem)]
            "
          >
            <span className="text-red-600">
              {hasCount ? (subscriberCount) : "5000+"}
            </span>
            <span className="text-[0.7em] lowercase text-black">димонов</span>
          </p>

          <p className="font-sans text-sm lowercase text-neutral-400 sm:text-xl">
            цифра растет каждый день
          </p>
        </div>
 
        <div className="flex flex-col justify-center gap-6 px-5 py-10 max-lg:items-center sm:gap-10 sm:px-8 sm:py-16 lg:px-10 lg:py-14 xl:py-19">
          <p
            className="
              font-sans font-extrabold lowercase leading-[1.05] tracking-tight text-black max-lg:text-center
              text-[clamp(2.5rem,7vw,3.5rem)]
              lg:text-[clamp(2.5rem,3vw,3.5rem)]
            "
          >
            можешь пройти мимо, но лучше вступить в{" "}
            <span className="text-red-600">наши ряды</span>.
          </p>

          <Button
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            fullWidthMobile
            className="group flex w-fit items-center justify-center gap-1"
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