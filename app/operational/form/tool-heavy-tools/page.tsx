'use client';

import Layout from '@/components/Layout';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function ToolsHeavyToolsPage() {
  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
          Form Submission Tools & Heavy Tools
        </Title>
        <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
          Formulir submission tools dan heavy tools
        </Text>
      </div>

      <div style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        padding: 24
      }}>
        <Text style={{ color: '#666666', fontSize: 14 }}>
          Halaman Form Submission Tools & Heavy Tools sedang dalam pengembangan.
        </Text>
      </div>
    </Layout>
  );
}
