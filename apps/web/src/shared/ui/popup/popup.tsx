"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { cn } from "@/shared/lib/cn";

type PopupProps = {
  open: boolean;
  onClose?: () => void;
  title: string;
  description?: string;
  overlayClassName?: string;
  contentClassName?: string;
  children: ReactNode;
};

const DEFAULT_OVERLAY_CLASS =
  "fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm";

const DEFAULT_CONTENT_CLASS =
  "fixed left-1/2 top-1/2 z-[1001] max-h-[calc(100dvh-2.5rem)] w-[calc(100%-2.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto outline-none";

export function Popup({
  open,
  onClose,
  title,
  description,
  overlayClassName,
  contentClassName,
  children,
}: PopupProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose?.();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(DEFAULT_OVERLAY_CLASS, overlayClassName)}
        />

        <Dialog.Content
          className={cn(DEFAULT_CONTENT_CLASS, contentClassName)}
          {...(!description ? { "aria-describedby": undefined } : {})}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>

          {description && (
            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>
          )}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}