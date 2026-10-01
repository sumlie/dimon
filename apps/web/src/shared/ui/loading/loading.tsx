import { Spinner } from "@/shared/ui/spinner";

export function Loading() {
  return (
    <div className="fixed inset-0 z-999 flex min-h-dvh flex-col items-center justify-center bg-white">
      <Spinner className="size-15 lg:size-20 text-red-600" />
    </div>
  );
}
