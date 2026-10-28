import { createPortal } from "react-dom";
import { useEffect, type ReactNode } from "react";

type PopupProps = {
  open: boolean;
  onClose?: () => void;
  overlayClassName?: string;
  children: ReactNode;
};

const DEFAULT_OVERLAY_CLASS =
  "fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm";

export function Popup({
  open,
  onClose,
  overlayClassName,
  children,
}: PopupProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const content = (
    <div className={overlayClassName ?? DEFAULT_OVERLAY_CLASS}>{children}</div>
  );

  if (typeof document === "undefined") return content;

  return createPortal(content, document.body);
}
