'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { Typography, Card, Row, Col } from 'antd';

const { Title, Text } = Typography;

interface FormCardProps {
  title: string;
  description: string;
  href: string;
  color: string;
}

function FormCard({ title, description, href, color }: FormCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        styles={{ body: { padding: 20 } }}
        style={{ borderLeft: `3px solid ${color}`, height: '100%' }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 4 }}>{title}</div>
        <Text type="secondary" style={{ fontSize: 13 }}>{description}</Text>
      </Card>
    </Link>
  );
}

export default function FormPage() {
  const forms = [
    { title: 'PIC Check In', description: 'Form absensi dan check in kehadiran karyawan', href: '/operational/form/pic-check-in', color: '#0D2B5E' },
    { title: 'Monitoring Outlet', description: 'Form monitoring kondisi outlet', href: '/operational/form/monitoring-outlet', color: '#52c41a' },
    { title: 'Monitoring Product', description: 'Form monitoring produk dan inventory', href: '/operational/form/monitoring-product', color: '#faad14' },
    { title: 'Tool & Heavy Tools', description: 'Form submission perkakas dan peralatan berat', href: '/operational/form/tool-heavy-tools', color: '#f5222d' },
    { title: 'Facility Request', description: 'Form permintaan perbaikan fasilitas', href: '/operational/form/facility-request', color: '#1890ff' },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Form</Title>
          <Text type="secondary">Pilih form yang ingin diisi</Text>
        </div>

        <Row gutter={[16, 16]}>
          {forms.map((form) => (
            <Col key={form.href} xs={24} sm={12} md={8}>
              <FormCard {...form} />
            </Col>
          ))}
        </Row>
      </div>
    </Layout>
  );
}
