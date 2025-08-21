"use client";
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { usePathname, useRouter } from 'next/navigation';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      if (!pathname.startsWith("/login")) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isAuthenticated, loading, pathname]);


  return <>{children}</>;
}


