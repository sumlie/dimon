"use client";

import { useEffect, useRef } from "react";

const foo = Array.from({ length: 10 }, (_, index) => `/images/${index}.png`);

const photos = Array.from({ length: 40 }, (_, index) => foo[index % foo.length]);

const rows = [
  {
    photos: photos.slice(0, 14),
    direction: -1,
    speed: 2.8,
    height: 320,
    startX: 0,
  },
  {
    photos: photos.slice(14, 27),
    direction: 1,
    speed: 2.1,
    height: 420,
    startX: -2400,
  },
  {
    photos: photos.slice(27, 40),
    direction: -1,
    speed: 1.6,
    height: 380,
    startX: -400,
  },
];

export function ScrollGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

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

        const movement = config.startX + localScroll * config.speed * config.direction;

        row.style.transform = `translate3d(${movement}px, 0, 0)`;
      });

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <section className="overflow-hidden bg-black py-1">
      <div ref={containerRef} className="flex w-full flex-col gap-1 overflow-hidden">
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
              className="absolute left-0 top-0 flex w-max items-center gap-1 will-change-transform"
              style={{
                transform: `translate3d(${row.startX}px, 0, 0)`,
              }}
            >
              {row.photos.map((photo, photoIndex) => (
                <div
                  key={`${photo}-${rowIndex}-${photoIndex}`}
                  className="relative shrink-0 overflow-hidden"
                  style={{
                    width: `${400 + ((photoIndex + rowIndex) % 3) * 100}px`,
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
