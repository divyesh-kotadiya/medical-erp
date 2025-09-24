"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import { useAppSelector } from "@/store/hooks";

export function useAuthRedirect(message: string = "Login successful") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const { loading, user } = useAppSelector((state) => state.auth);
  const { organizations, loading: orgLoading } = useAppSelector((state) => state.organizations);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthenticated = Boolean(token);

  const redirectPath =
    searchParams.get("redirect") ||
    (organizations && organizations.length > 0 ? "/dashboard" : "/onboarding");

  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!loading && !orgLoading && isAuthenticated && !hasShownRef.current) {
      enqueueSnackbar(message, { variant: "success" });
      router.replace(redirectPath);
      hasShownRef.current = true;
    }
  }, [loading, orgLoading, isAuthenticated, redirectPath, enqueueSnackbar, router, message]);

  return { isAuthenticated, loading: loading || orgLoading, user };
}
