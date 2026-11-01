"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { cn } from "@/shared/lib/cn";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="text"
      size="sm"
      pd="none"
      className={cn("shrink-0 items-center gap-1 lowercase", className)}
      onClick={() => router.back()}
    >
      <ArrowLeft
        size={16}
        strokeWidth={1.5}
        className="transition-transform group-hover/button:rotate-45"
      />
      назад
    </Button>
  );
}