'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const priorityRoutes = ['/dashboard', '/report/lost', '/report/found', '/notifications', '/login', '/signup', '/hod'];

export function AppBackground() {
  const router = useRouter();

  useEffect(() => {
    const prefetchRoutes = () => priorityRoutes.forEach((route) => router.prefetch(route));
    const idle = window.requestIdleCallback?.(prefetchRoutes, { timeout: 1200 });
    const timeout = idle === undefined ? window.setTimeout(prefetchRoutes, 180) : undefined;
    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [router]);

  return null;
}
