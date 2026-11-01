"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const count = images.length;
  const multiple = count > 1;

  if (count === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center border border-black text-sm lowercase text-black/40">
        нет фото
      </div>
    );
  }

  const goTo = (i: number) => {
    const element = scrollerRef.current;
    if (!element) return;

    const next = (i + count) % count;

    element.scrollTo({
      left: element.clientWidth * next,
      behavior: "smooth",
    });
  };

  const onScroll = () => {
    const element = scrollerRef.current;
    if (!element || !element.clientWidth) return;

    setIndex(
      Math.round(element.scrollLeft / element.clientWidth),
    );
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative min-w-0 flex-1 border border-black">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex aspect-[5/5] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="h-full w-full shrink-0 snap-center"
            >
              <img
                src={src}
                alt={`${alt} — фото ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {multiple && (
          <>
            <span className="absolute bottom-3 right-3 border border-black bg-white px-2 py-1 font-sans text-xs lowercase text-black lg:hidden">
              {index + 1} / {count}
            </span>

            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="предыдущее фото"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-black bg-white text-black transition-colors hover:bg-black hover:text-white lg:flex"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="следующее фото"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-black bg-white text-black transition-colors hover:bg-black hover:text-white lg:flex"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {multiple && (
        <div className="hidden w-20 shrink-0 flex-col gap-3 lg:flex">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`фото ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`aspect-[4/5] overflow-hidden border transition-opacity ${
                i === index
                  ? "border-black opacity-100"
                  : "border-black/20 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}