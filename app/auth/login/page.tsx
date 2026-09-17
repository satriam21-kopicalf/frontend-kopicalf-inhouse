'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { App, notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://187.52.114.14:8005/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const validate = () => {
    const newErrors = { email: '', password: '', general: '' };
    if (!formData.email) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
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

      const data = await response.json();

      if (!response.ok) {
        notification.error({
          message: 'Login Gagal',
          description: data.detail || 'Email atau password salah',
          icon: <CloseCircleOutlined style={{ color: '#FF4D4F' }} />,
          placement: 'top',
        });
        setErrors(prev => ({ ...prev, general: data.detail || 'Email atau password salah' }));
        return;
      }

      // Store token and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token || data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user || data));
        localStorage.setItem('user_permissions', JSON.stringify(data.user?.permissions || []));
      }

      notification.success({
        message: 'Login Berhasil',
        description: `Selamat datang, ${data.user?.full_name || 'Admin'}!`,
        icon: <CheckCircleOutlined style={{ color: '#52C41A' }} />,
        placement: 'top',
      });

      setTimeout(() => {
        router.push('/main-menu/dashboard');
      }, 800);
    } catch (error) {
      notification.error({
        message: 'Login Gagal',
        description: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
        icon: <CloseCircleOutlined style={{ color: '#FF4D4F' }} />,
        placement: 'top',
      });
      setErrors(prev => ({ ...prev, general: 'Terjadi kesalahan koneksi' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <App>
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
          <div style={{ width: '100%', maxWidth: 360 }}>
            {/* Logo */}
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
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#000', marginBottom: 4, letterSpacing: '-0.02em' }}>Masuk ke Kopi Calf</h1>
              <p style={{ fontSize: 14, color: '#8A8A8A' }}>Masukkan email dan password Anda</p>
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="admin@kopicalf.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${errors.email ? '#DC2626' : '#E5E5E5'}`,
                    fontSize: 14,
                    color: '#000',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#FFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#DC2626' : '#E5E5E5'}
                />
                {errors.email && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${errors.password ? '#DC2626' : '#E5E5E5'}`,
                    fontSize: 14,
                    color: '#000',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#FFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = errors.password ? '#DC2626' : '#E5E5E5'}
                />
                {errors.password && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 6,
                  background: '#000',
                  color: '#FFF',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Hint */}
            <div style={{
              marginTop: 24,
              padding: '12px 16px',
              background: '#F5F5F5',
              borderRadius: 6,
              fontSize: 12,
              color: '#666'
            }}>
              <strong>Demo:</strong><br />
              Email: admin@kopicalf.com<br />
              Password: Admin@123
            </div>
          </div>
        </main>
      </div>
    </App>
  );
}
