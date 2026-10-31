import { ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button/button";

import { useCart } from "@/features/cart/model/cart-context";

export function CartButton() {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button href="/cart" variant="social" size="mini" pd="none">
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
