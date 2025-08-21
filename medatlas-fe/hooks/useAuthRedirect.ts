"use client"

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import { useAppSelector } from "@/store/hooks";

export function useAuthRedirect(defaultRedirect: string = "/dashboard", message: string = "Login successful") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const redirectPath = searchParams.get("redirect") || defaultRedirect;

  const { loading, token } = useAppSelector((state) => state.auth);
  const isAuthenticated = Boolean(token);

  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !hasShownRef.current) {
      enqueueSnackbar(message, { variant: "success" });
      router.replace(redirectPath);
      hasShownRef.current = true;
    }
  }, [loading, isAuthenticated, router, redirectPath, enqueueSnackbar]);
  return { isAuthenticated, loading };
}
