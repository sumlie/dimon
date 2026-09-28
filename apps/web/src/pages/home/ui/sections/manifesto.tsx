import { Dimon } from "@/shared/ui/dimon";

export function Manifesto() {
  return (
    <section className="w-full bg-white px-10 py-8">
      <p
        className="font-sans font-extrabold leading-[1.05] tracking-tight lowercase text-black"
        style={{ fontSize: "clamp(2.5rem, 8vw, 7.5rem)" }}
      >
        мы не придумываем,
        <br />
        что вам носить
        <br />
        мы просто делаем{" "}
        <span className="text-red-600 font-display">
          <Dimon />
          ОВ
        </span>
      </p>
    </section>
  );
}
