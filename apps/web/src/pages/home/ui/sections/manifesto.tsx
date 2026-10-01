import { Dimon } from "@/shared/ui/dimon";

export function Manifesto() {
  return (
    <section className="w-full bg-white px-5 py-8 sm:px-4 sm:py-12 lg:px-10">
      <p
        className="font-sans font-black leading-[1.1] max-sm:text-center max-sm:leading-[1.2] lowercase text-black text-balance"
        style={{ 
          fontSize: "clamp(2.5rem, 11vw, 7.5rem)", 
        }}
      >
        <span className="block sm:inline">мы не придумываем,</span>{" "}
        <span className="whitespace-nowrap sm:whitespace-normal">что вам носить</span>
        <br className="hidden sm:block" />
        <span className="block sm:inline">мы просто <br /> делаем</span>{" "}
        <span className="text-red-600 font-display tracking-[0.01em] max-sm:leading-normal whitespace-nowrap">
          <Dimon />ОВ
        </span>
      </p>
    </section>
  );
}

