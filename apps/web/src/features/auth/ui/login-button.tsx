import { Button } from "@/shared/ui/button/button";
import { SquareUserRound } from "lucide-react";

export function LoginButton() {
  return (
    <Button href="#!" variant="social" size="mini" pd="none">
      <span className="flex h-7 w-7 items-center justify-center">
        <SquareUserRound />
      </span>

      <span>войти</span>
    </Button>
  );
}
