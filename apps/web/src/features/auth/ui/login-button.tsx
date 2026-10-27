"use client";

import { SquareUserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button/button";
import { useCurrentCustomer } from "../model/use-current-customer";
import { AuthDialog } from "./auth-dialog";

export function LoginButton() {
  const [open, setOpen] = useState(false);
  const [initialErrorCode, setInitialErrorCode] = useState<string | null>(null);
  const { customer, loading } = useCurrentCustomer();

  useEffect(() => {
    if (
      window.location.pathname === "/account" ||
      window.location.pathname === "/auth/complete"
    ) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("auth_error");
    if (!code) return;

    setInitialErrorCode(code);
    setOpen(true);

    params.delete("auth_error");
    params.delete("auth");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, []);

  const closeDialog = () => {
    setOpen(false);
    setInitialErrorCode(null);
  };

  if (!loading && customer) {
    return (
      <Button href="/account" variant="social" size="mini" pd="none">
        <span className="flex h-7 w-7 items-center justify-center">
          <SquareUserRound />
        </span>

        <span>профиль</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="social"
        size="mini"
        pd="none"
        onClick={() => setOpen(true)}
      >
        <span className="flex h-7 w-7 items-center justify-center">
          <SquareUserRound />
        </span>

        <span>войти</span>
      </Button>

      <AuthDialog
        open={open}
        onClose={closeDialog}
        initialErrorCode={initialErrorCode}
      />
    </>
  );
}
