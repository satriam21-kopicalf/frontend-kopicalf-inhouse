'use client';

import Layout from '@/components/Layout';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function DashboardPage() {
  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
          Dashboard
        </Title>
        <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
          Selamat datang, Admin
        </Text>
      </div>

      {/* Empty state */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: '#F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        </div>
        <Text style={{ color: '#666666', fontSize: 14, display: 'block' }}>
          Dashboard sedang dalam pengembangan
        </Text>
        <Text style={{ color: '#8A8A8A', fontSize: 13, display: 'block', marginTop: 4 }}>
          Konten dashboard akan segera ditambahkan
        </Text>
      </div>
    </Layout>
  );
}
