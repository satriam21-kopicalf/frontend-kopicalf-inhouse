'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear session/auth data
    localStorage.removeItem('auth_token');
    sessionStorage.clear();

    // Redirect to login after brief delay
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 24,
          height: 24,
          border: '2px solid #E5E5E5',
          borderTopColor: '#000000',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#8A8A8A', fontSize: 14 }}>Signing out...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
