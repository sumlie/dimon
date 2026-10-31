"use client";

import { useEffect, useRef, useState } from "react";

function Row({
  photos,
  reverse,
  duration,
  height,
}: {
  photos: string[];
  reverse: boolean;
  duration: number;
  height: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sampleRef = useRef<HTMLDivElement>(null);

  const [copies, setCopies] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const sample = sampleRef.current;

    if (!container || !sample) return;

    const updateCopies = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const sampleWidth = sample.getBoundingClientRect().width;

      if (containerWidth > 0 && sampleWidth > 0) {
        setCopies(Math.max(1, Math.ceil(containerWidth / sampleWidth)));
      }
    };

    const observer = new ResizeObserver(updateCopies);

    observer.observe(container);
    observer.observe(sample);

    // Ширина набора может измениться после загрузки изображений.
    const images = sample.querySelectorAll("img");

    images.forEach((image) => {
      image.addEventListener("load", updateCopies);
      image.addEventListener("error", updateCopies);
    });

    updateCopies();

    return () => {
      observer.disconnect();

      images.forEach((image) => {
        image.removeEventListener("load", updateCopies);
        image.removeEventListener("error", updateCopies);
      });
    };
  }, [photos]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={`overflow-hidden ${height}`}>
      <div
        className="gallery-track flex h-full w-max will-change-transform"
        style={{
          animation: `gallery-marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex h-full shrink-0"
            aria-hidden={groupIndex === 1 || undefined}
          >
            {Array.from({ length: copies }, (_, copyIndex) => (
              <div
                key={copyIndex}
                ref={
                  groupIndex === 0 && copyIndex === 0
                    ? sampleRef
                    : undefined
                }
                className="flex h-full shrink-0"
                aria-hidden={
                  groupIndex === 1 || copyIndex > 0 || undefined
                }
              >
                {photos.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt=""
                    draggable={false}
                    className="mr-0.5 h-full w-auto max-w-none shrink-0 sm:mr-1"
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScrollGallery({ photos }: { photos: string[] }) {
  const uniquePhotos = [...new Set(photos)];

  if (uniquePhotos.length === 0) {
    return null;
  }

  const photosByRow: string[][] = [[], [], []];

  uniquePhotos.forEach((photo, index) => {
    photosByRow[index % 3].push(photo);
  });

  const rows = [
    {
      photos: photosByRow[0],
      reverse: false,
      duration: 70,
      height: "h-[220px] sm:h-[320px]",
    },
    {
      photos: photosByRow[1],
      reverse: true,
      duration: 85,
      height: "h-[220px] sm:h-[320px]",
    },
    {
      photos: photosByRow[2],
      reverse: false,
      duration: 60,
      height: "h-[220px] sm:h-[320px]",
    },
  ];

  return (
    <section className="flex flex-col gap-0.5 overflow-hidden bg-black py-0.5 sm:gap-1 sm:py-1">
      {rows.map((row, index) => (
        <Row
          key={index}
          photos={row.photos}
          reverse={row.reverse}
          duration={row.duration}
          height={row.height}
        />
      ))}
    </section>
  );
}