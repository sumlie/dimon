const base = Array.from({ length: 10 }, (_, i) => `/images/${i}.png`);

const rotate = (arr: string[], n: number) => [
  ...arr.slice(n),
  ...arr.slice(0, n),
];

const ROWS = [
  {
    photos: rotate(base, 0),
    reverse: false,
    duration: 70,
    height: "h-[170px] sm:h-[220px]",
  },
  {
    photos: rotate(base, 4),
    reverse: true,
    duration: 85,
    height: "h-[220px] sm:h-[320px]",
  },
  {
    photos: rotate(base, 7),
    reverse: false,
    duration: 60,
    height: "h-[190px] sm:h-[280px]",
  },
];

function Row({
  photos,
  rowIndex,
  hidden = false,
}: {
  photos: string[];
  rowIndex: number;
  hidden?: boolean;
}) {
  return (
    <div className="flex h-full shrink-0" aria-hidden={hidden || undefined}>
      {photos.map((src) => (
        <img
          key={`${rowIndex}-${src}`}
          src={src}
          alt=""
          draggable={false}
          className="mr-0.5 h-full w-auto max-w-none shrink-0 sm:mr-1"
        />
      ))}
    </div>
  );
}

export function ScrollGallery() {
  return (
    <section className="flex flex-col gap-0.5 overflow-hidden bg-black py-0.5 sm:gap-1 sm:py-1">
      {ROWS.map((row, rowIndex) => (
        <div
          key={row.photos.join("|")}
          className={`overflow-hidden ${row.height}`}
        >
          <div
            className="gallery-track flex h-full w-max will-change-transform"
            style={{
              animation: `gallery-marquee ${row.duration}s linear infinite`,
              animationDirection: row.reverse ? "reverse" : "normal",
            }}
          >
            <Row photos={row.photos} rowIndex={rowIndex} />
            <Row photos={row.photos} rowIndex={rowIndex} hidden />
          </div>
        </div>
      ))}
    </section>
  );
}
