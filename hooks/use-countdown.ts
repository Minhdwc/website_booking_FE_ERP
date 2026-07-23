'use client';

import { useEffect, useState } from 'react';

function formatMmSs(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useCountdown(expiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingMs = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - now) : 0;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const isExpired = !expiresAt || remainingMs <= 0;

  return {
    remainingMs,
    remainingSeconds,
    formatted: formatMmSs(remainingSeconds),
    isExpired,
  };
}
