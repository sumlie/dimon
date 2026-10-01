import { cn } from "@/shared/lib/cn";
import { Loader2Icon } from "lucide-react";

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="загрузка"
      strokeWidth={1.5}
      className={cn("size-5 animate-spin text-red-600", className)}
      {...props}
    />
  );
}
