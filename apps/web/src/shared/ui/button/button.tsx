import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import Link, { type LinkProps } from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-sans transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-2 border-black bg-black text-white hover:bg-transparent hover:text-black",

        outline:
          "border-2 border-black bg-transparent text-black hover:bg-black hover:text-white",

        text:
          "text-black hover:text-red-600",

        white:
          "border-2 border-white bg-white text-black hover:bg-transparent hover:text-white",

        whiteOutline:
          "border-2 border-white bg-transparent text-white hover:bg-white hover:text-black",

        icon:
          "text-black hover:text-red-600",

        social:
          "relative flex-col gap-0 text-black hover:text-red-600",
      },

      size: {
        sm: "gap-1.5 text-base",
        default: "gap-2 text-lg",
        lg: "gap-2.5 text-lg",

        icon: "h-10 w-10",
        social: "text-base",
        mini: "text-sm",
      },

      pd: {
        default: "",
        sm: "px-4 py-2",
        md: "px-8 py-3",
        lg: "px-10 py-3",
        none: "",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      pd: "md",
    },
  },
);

export type ButtonProps = ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>;

export type ButtonLinkProps = LinkProps &
  Omit<ComponentProps<"a">, "href"> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  pd,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, pd, className }))}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  pd,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, pd, className }))}
      {...props}
    />
  );
}
