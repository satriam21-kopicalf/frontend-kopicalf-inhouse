'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://187.52.114.14:8005/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const validate = () => {
    const newErrors = { email: '', password: '', general: '' };
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();

      // Store token and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token || data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user || data));
        localStorage.setItem('user_permissions', JSON.stringify(data.user?.permissions || []));
      }

      message.success('Login successful!');
      router.push('/main-menu/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ width: '100%', maxWidth: 360 }}>
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
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#000000', marginBottom: 4, letterSpacing: '-0.02em' }}>Sign in to Kopi Calf</h1>
            <p style={{ fontSize: 14, color: '#8A8A8A' }}>Enter your credentials to continue</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div style={{
              padding: '12px 16px',
              background: '#FFF2F0',
              border: '1px solid #FFCCC7',
              borderRadius: 6,
              marginBottom: 16,
              color: '#FF4D4F',
              fontSize: 13
            }}>
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${errors.email ? '#DC2626' : '#E5E5E5'}`,
                  fontSize: 14,
                  color: '#000000',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000000'}
                onBlur={(e) => e.target.style.borderColor = errors.email ? '#DC2626' : '#E5E5E5'}
              />
              {errors.email && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${errors.password ? '#DC2626' : '#E5E5E5'}`,
                  fontSize: 14,
                  color: '#000000',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000000'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#DC2626' : '#E5E5E5'}
              />
              {errors.password && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 14, height: 14, cursor: 'pointer' }} />
                <span style={{ fontSize: 13, color: '#666666' }}>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" style={{ fontSize: 13, color: '#0D2B5E', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
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
                background: '#000000',
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
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 24,
            padding: '12px 16px',
            background: '#F7F7F7',
            borderRadius: 6,
            fontSize: 12,
            color: '#666'
          }}>
            <strong>Demo Credentials:</strong><br />
            Email: admin@kopicalf.com<br />
            Password: admin123
          </div>
        </div>
      </main>
    </div>
  );
}
