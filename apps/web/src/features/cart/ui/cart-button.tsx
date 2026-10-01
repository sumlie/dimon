import { Button } from "@/shared/ui/button/button";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
  const count = 0;
  return (
    <Button href="#!" variant="social" size="mini" pd="none">
      <span className="relative flex h-7 w-7 items-center justify-center">
        <ShoppingBag size={22} />

        <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs leading-none text-white">
          {count}
        </span>
      </span>

      <span>корзина</span>
    </Button>
  );
}
