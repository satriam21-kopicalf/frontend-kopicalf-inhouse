'use client';

import Layout from '@/components/Layout';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function PICCheckInPage() {
  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
          Form PIC Check In
        </Title>
        <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
          Formulir check in untuk PIC
        </Text>
      </div>

      <div style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        padding: 24
      }}>
        <Text style={{ color: '#666666', fontSize: 14 }}>
          Halaman Form PIC Check In sedang dalam pengembangan.
        </Text>
      </div>
    </Layout>
  );
}
