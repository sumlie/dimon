// ScrollGallery
"use client";

import { useEffect, useRef, useState } from "react";

const foo = Array.from({ length: 10 }, (_, index) => `/images/${index}.png`);

const photos = Array.from({ length: 40 }, (_, index) => foo[index % foo.length]);

const ROWS_DESKTOP = [
  { photos: photos.slice(0, 14), direction: -1, speed: 2.8, height: 320, startX: 0 },
  { photos: photos.slice(14, 27), direction: 1, speed: 2.1, height: 420, startX: -2400 },
  { photos: photos.slice(27, 40), direction: -1, speed: 1.6, height: 380, startX: -400 },
];

const ROWS_MOBILE = [
  { photos: photos.slice(0, 14), direction: -1, speed: 1.4, height: 150, startX: 0 },
  { photos: photos.slice(14, 27), direction: 1, speed: 1.1, height: 190, startX: -1100 },
  { photos: photos.slice(27, 40), direction: -1, speed: 0.9, height: 170, startX: -180 },
];

const MOBILE_BREAKPOINT = "(min-width: 640px)";

function getPhotoWidth(photoIndex: number, rowIndex: number, isMobile: boolean) {
  const variant = (photoIndex + rowIndex) % 3;
  return isMobile ? 160 + variant * 40 : 400 + variant * 100;
}

export function ScrollGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(!e.matches);
    };
    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const rows = isMobile ? ROWS_MOBILE : ROWS_DESKTOP;

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const container = containerRef.current;

      if (!container) return;

      const scrollY = window.scrollY;

      const containerTop = container.getBoundingClientRect().top + scrollY;

      const viewportCenter = window.innerHeight / 2;

      const localScroll = Math.max(0, scrollY - containerTop + viewportCenter);

      rowRefs.current.forEach((row, index) => {
        if (!row) return;

        const config = rows[index];
        if (!config) return;

        const movement = config.startX + localScroll * config.speed * config.direction;

        row.style.transform = `translate3d(${movement}px, 0, 0)`;
      });

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, [rows]);

  return (
    <section className="overflow-hidden bg-black py-0.5 sm:py-1">
      <div ref={containerRef} className="flex w-full flex-col gap-0.5 overflow-hidden sm:gap-1">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="relative w-full overflow-visible"
            style={{ height: row.height }}
          >
            <div
              ref={(element) => {
                rowRefs.current[rowIndex] = element;
              }}
              className="absolute left-0 top-0 flex w-max items-center gap-0.5 will-change-transform sm:gap-1"
              style={{
                transform: `translate3d(${row.startX}px, 0, 0)`,
              }}
            >
              {row.photos.map((photo, photoIndex) => (
                <div
                  key={`${photo}-${rowIndex}-${photoIndex}`}
                  className="relative shrink-0 overflow-hidden"
                  style={{
                    width: `${getPhotoWidth(photoIndex, rowIndex, isMobile)}px`,
                    height: `${row.height}px`,
                  }}
                >
                  <img
                    src={photo}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
