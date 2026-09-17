'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Typography, Table, Tag, Space, Button, Input, Card, Row, Col, Statistic, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface Approval {
  key: string;
  requestNumber: string;
  type: string;
  requester: string;
  outlet: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
}

const mockData: Approval[] = [
  { key: '1', requestNumber: 'APR-001', type: 'Leave', requester: 'Andi Wijaya', outlet: 'Kopi Calf Cipete', date: '2026-09-15', status: 'pending', description: 'Cuti tahunan 3 hari' },
  { key: '2', requestNumber: 'APR-002', type: 'Expense', requester: 'Budi Santoso', outlet: 'Kopi Calf Bandung', date: '2026-09-15', status: 'approved', description: 'Biaya renovasi dapur Rp5.000.000' },
  { key: '3', requestNumber: 'APR-003', type: 'Purchase', requester: 'Citra Dewi', outlet: 'Kopi Calf Surabaya', date: '2026-09-14', status: 'pending', description: 'Pembelian mesin espresso' },
  { key: '4', requestNumber: 'APR-004', type: 'Leave', requester: 'Dedi Kurniawan', outlet: 'Kopi Calf Cipete', date: '2026-09-14', status: 'rejected', description: 'Cuti mendadak - ditolak' },
  { key: '5', requestNumber: 'APR-005', type: 'Overtime', requester: 'Eva Marlina', outlet: 'Central Kitchen', date: '2026-09-13', status: 'approved', description: 'Lembur shift malam' },
];

export default function ApprovalsPage() {
  const [data] = useState<Approval[]>(mockData);

  const statusColor = (s: Approval['status']) =>
    s === 'approved' ? '#52c41a' : s === 'rejected' ? '#f5222d' : '#faad14';

  const statusBg = (s: Approval['status']) =>
    s === 'approved' ? '#f6ffed' : s === 'rejected' ? '#fff2f0' : '#fffbe6';

  const columns: ColumnsType<Approval> = [
    { title: 'Request #', dataIndex: 'requestNumber', key: 'requestNumber' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: t => <Tag>{t}</Tag> },
    { title: 'Requester', dataIndex: 'requester', key: 'requester' },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: Approval['status']) => (
        <span style={{ color: statusColor(s), fontWeight: 600, textTransform: 'capitalize' }}>{s}</span>
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" type="link">View</Button>
        </Space>
      ),
    },
  ];

  const pending = data.filter(d => d.status === 'pending').length;
  const approved = data.filter(d => d.status === 'approved').length;
  const rejected = data.filter(d => d.status === 'rejected').length;

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1200 }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Approvals</Title>
            <Text type="secondary">Kelola dan approve request dari seluruh outlet</Text>
          </div>

          <Row gutter={12} style={{ marginBottom: 24 }}>
            <Col><Card size="small"><Statistic title="Pending" value={pending} /></Card></Col>
            <Col><Card size="small"><Statistic title="Approved" value={approved} /></Card></Col>
            <Col><Card size="small"><Statistic title="Rejected" value={rejected} /></Card></Col>
            <Col><Card size="small"><Statistic title="Total" value={data.length} /></Card></Col>
          </Row>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Input.Search placeholder="Search request #, requester, outlet..." style={{ width: 300 }} allowClear />
            <Select placeholder="Filter by status" style={{ width: 160 }} allowClear />
          </div>

          <Card styles={{ body: { padding: 0 } }}>
            <Table columns={columns} dataSource={data} rowKey="key" pagination={{ pageSize: 10 }} />
          </Card>
        </div>
      </App>
    </Layout>
  );
}
