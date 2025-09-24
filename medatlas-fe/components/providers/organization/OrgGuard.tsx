'use client';

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function OrgGuard({ children }: { children: React.ReactNode }) {
  const { organizations, currentOrganization, loading: orgLoading } = useAppSelector(
    (state) => state.organizations
  );
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!orgLoading) {
      if (organizations.length === 0) {
        router.replace("/onboarding");
      }
      setInitialized(true);
    }
  }, [orgLoading, organizations, currentOrganization, router]);

  if (orgLoading || !initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading organizations...</p>
      </div>
    );
  }

  return <>{children}</>;
}
