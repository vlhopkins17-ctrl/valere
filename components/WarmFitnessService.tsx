'use client';

import { useEffect } from 'react';

// Fires once per page load so the fitness service wakes up before it's needed.
export function WarmFitnessService() {
  useEffect(() => {
    fetch('/api/warmup', { method: 'POST', keepalive: true }).catch(() => {});
  }, []);

  return null;
}
