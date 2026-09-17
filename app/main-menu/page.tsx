'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MainMenuPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/main-menu/recap-sales');
  }, [router]);

  return null;
}
