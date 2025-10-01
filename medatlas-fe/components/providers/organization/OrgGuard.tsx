'use client';

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrganizations } from "@/store/slices/organizations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function OrgGuard({ children }: { children: React.ReactNode }) {
  const { organizations, currentOrganization, loading: orgLoading, loaded } = useAppSelector(
    (state) => state.organizations
  );

  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchOrganizations());
    }
    if (!orgLoading) {
      if (organizations.length === 0) {
        router.replace("/onboarding");
      }
      setInitialized(true);
    }
  }, [orgLoading, organizations, currentOrganization, router, loaded, dispatch]);

  if (orgLoading || !initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background to-secondary">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}