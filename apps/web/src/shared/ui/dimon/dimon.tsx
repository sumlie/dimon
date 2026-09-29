export function Dimon({
  className,
  suffix,
  suffixClassName,
}: {
  className?: string;
  suffix?: string;
  suffixClassName?: string;
}) {
  return (
    <span className={className}>
      <span className="uppercase">Димон</span>
      {suffix && <span className={suffixClassName}>{suffix}</span>}
    </span>
  );
}
