'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SccIndexPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/scc/overview'); }, [router]);
  return null;
}
