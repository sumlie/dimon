import { ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button/button";

import { useCartStore } from "..";

export function CartButton() {
  const items = useCartStore((state) => state.items);
const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button href="/cart" variant="social" size="mini" pd="none">
      <span className="relative flex h-7 w-7 items-center justify-center">
        <ShoppingBag size={22} />
        {totalQuantity == 0 || (
          <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs leading-none text-white">
            {totalQuantity}
          </span>
        )}
      </span>
      <span>корзина</span>
    </Button>
  );
}
