import { Dimon } from "@/shared/ui/dimon";

export function Manifesto() {
  return (
    <section className="w-full bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <p
        className="font-sans font-extrabold leading-[1.05] tracking-tight lowercase text-black"
        style={{ fontSize: "clamp(2.5rem, 11vw, 7.5rem)" }}
      >
        мы не придумываем,
        <br />
        что вам носить
        <br />
        мы просто делаем{" "}
        <span className="text-red-600 font-display tracking-[0.01em]">
          <Dimon />
          ОВ
        </span>
      </p>
    </section>
  );
}
