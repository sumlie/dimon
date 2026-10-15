import { Dimon } from "@/shared/ui/dimon";

export function Manifesto() {
  return (
    <section className="w-full border-y-2 border-black bg-black px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-24">
      <p
        className="
          font-sans font-black lowercase text-white text-balance
          leading-[1.2] sm:leading-[1.1]
          text-[clamp(2.5rem,11vw,3rem)]
          sm:text-[clamp(2.5rem,7.5vw,5rem)]
          lg:text-[clamp(2.5rem,4.6vw,7rem)]
        "
      >
        <span className="block text-center sm:text-left">
          мы не придумываем,{" "}
          <span className="whitespace-nowrap sm:whitespace-normal">
            что вам носить
          </span>
        </span>
        <span className="mt-[0.2em] block text-center sm:mt-[0.1em] sm:text-right">
          мы просто <br className="sm:hidden" /> делаем{" "}
          <span className="whitespace-nowrap font-display tracking-[0.01em] text-red-600 max-sm:leading-normal">
            <Dimon />ОВ
          </span>
        </span>
      </p>
    </section>
  );
}