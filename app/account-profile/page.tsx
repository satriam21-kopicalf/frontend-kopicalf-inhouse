'use client';

import Layout from '@/components/Layout';
import { Typography, Button, Input, message } from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: 'Admin',
    email: 'admin@kopicalf.com',
    phone: '+62 812-3456-7890',
    role: 'Administrator',
    department: 'IT',
    branch: 'Kopi Calf Cipete'
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Profile updated successfully');
    }, 1000);
  };

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
          Account Profile
        </Title>
        <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
          Kelola informasi akun Anda
        </Text>
      </div>

      <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
        {/* Profile Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #E5E5E5',
          padding: 24
        }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #F0F0F0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 700
            }}>
              AD
            </div>
            <div>
              <Text style={{ fontSize: 16, fontWeight: 600, color: '#000000', display: 'block' }}>
                {form.fullName}
              </Text>
              <Text style={{ fontSize: 13, color: '#8A8A8A', display: 'block' }}>
                {form.role}
              </Text>
              <Button size="small" style={{ marginTop: 8, borderRadius: 4 }}>
                Change Photo
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                style={{ borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                Phone Number
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ borderRadius: 6 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                  Role
                </label>
                <Input
                  value={form.role}
                  disabled
                  style={{ borderRadius: 6, background: '#F5F5F5' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                  Department
                </label>
                <Input
                  value={form.department}
                  disabled
                  style={{ borderRadius: 6, background: '#F5F5F5' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                Branch
              </label>
              <Input
                value={form.branch}
                disabled
                style={{ borderRadius: 6, background: '#F5F5F5' }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleSave}
              loading={loading}
              style={{
                background: '#000000',
                borderColor: '#000000',
                color: '#FFFFFF',
                borderRadius: 6,
                fontWeight: 500
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #E5E5E5',
          padding: 24
        }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#000000', display: 'block', marginBottom: 16 }}>
            Change Password
          </Text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                Current Password
              </label>
              <Input.Password
                placeholder="Enter current password"
                style={{ borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                New Password
              </label>
              <Input.Password
                placeholder="Enter new password"
                style={{ borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#000000', display: 'block', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <Input.Password
                placeholder="Confirm new password"
                style={{ borderRadius: 6 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                style={{
                  background: '#000000',
                  borderColor: '#000000',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  fontWeight: 500
                }}
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
