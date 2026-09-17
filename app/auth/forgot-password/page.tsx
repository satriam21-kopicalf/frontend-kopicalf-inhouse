'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF'
      }}>
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px'
        }}>
          <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
            {/* Success Icon */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#000000', marginBottom: 8 }}>Check your email</h1>
            <p style={{ fontSize: 14, color: '#666666', marginBottom: 24, lineHeight: 1.6 }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
            </p>

            <p style={{ fontSize: 13, color: '#8A8A8A', marginBottom: 24 }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0D2B5E',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                try again
              </button>
            </p>

            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#666666',
                textDecoration: 'none',
                fontSize: 13
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#FFFFFF'
    }}>
      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              overflow: 'hidden',
              margin: '0 auto 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Image
                src="/assets/calf-logo.png"
                alt="Kopi Calf"
                width={56}
                height={56}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#000000', marginBottom: 4 }}>Forgot Password</h1>
            <p style={{ fontSize: 14, color: '#8A8A8A' }}>Enter your email to receive reset instructions</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${error ? '#DC2626' : '#E5E5E5'}`,
                  fontSize: 14,
                  color: '#000000',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000000'}
                onBlur={(e) => e.target.style.borderColor = error ? '#DC2626' : '#E5E5E5'}
              />
              {error && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#0D2B5E',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Sending...
                </>
              ) : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#666666',
                textDecoration: 'none',
                fontSize: 13
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
