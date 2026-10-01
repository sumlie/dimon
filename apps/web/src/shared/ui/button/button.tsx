import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import Link, { type LinkProps } from "next/link";
import type { ComponentProps, ReactNode } from "react";
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

        text: "text-black hover:text-red-600",

        // та же текстовая ссылка, но под тёмный фон (футер и т.п.)
        textInvert: "text-white hover:text-red-600",

        // приглушённая подчёркнутая ссылка внутри абзаца на тёмном фоне
        muted: "text-white/40 underline underline-offset-2 hover:text-white",

        white:
          "border-2 border-white bg-white text-black hover:bg-transparent hover:text-white",

        whiteOutline:
          "border-2 border-white bg-transparent text-white hover:bg-white hover:text-black",

        icon: "text-black hover:text-red-600",

        social: "relative flex-col gap-0 text-black hover:text-red-600",

        // квадратная кнопка-иконка в рамке — соцсети в футере
        iconBox:
          "border border-white/20 text-white hover:border-red-600 hover:text-red-600",
      },

      size: {
        sm: "gap-1.5 text-sm sm:text-base",
        default: "gap-2 text-base sm:text-lg",
        lg: "gap-2 text-base sm:gap-2.5 sm:text-lg",

        icon: "h-9 w-9 sm:h-10 sm:w-10",
        social: "text-xs sm:text-sm",
        mini: "text-[11px] sm:text-xs",

        // не задаёт свой размер текста — наследует от родителя;
        // нужен для ссылок внутри обычного текста/абзаца
        inherit: "",
      },

      pd: {
        default: "",
        sm: "px-3 py-1.5 sm:px-4 sm:py-2",
        md: "px-6 py-2.5 sm:px-8 sm:py-3",
        lg: "px-7 py-2.5 sm:px-10 sm:py-3",
        none: "",
      },

      fullWidthMobile: {
        true: "w-full sm:w-fit",
        false: "",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      pd: "md",
      fullWidthMobile: false,
    },
  },
);

type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: ReactNode;
};

type AsLink = ButtonOwnProps &
  LinkProps &
  Omit<ComponentProps<"a">, "href"> & {
    href: LinkProps["href"];
  };

type AsButton = ButtonOwnProps &
  Omit<ComponentProps<typeof ButtonPrimitive>, "href"> & {
    href?: undefined;
  };

export type ButtonProps = AsLink | AsButton;

export function Button({
  className,
  variant,
  size,
  pd,
  fullWidthMobile,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonVariants({ variant, size, pd, fullWidthMobile, className }),
  );

  if (props.href !== undefined) {
    const { href, ...rest } = props as AsLink;
    return <Link href={href} className={classes} {...rest} />;
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={classes}
      {...(props as AsButton)}
    />
  );
}
