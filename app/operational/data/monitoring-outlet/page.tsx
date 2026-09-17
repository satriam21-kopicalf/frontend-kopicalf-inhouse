'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface MonitoringOutletRecord {
  key: string;
  date: string;
  outlet: string;
  inspector: string;
  category: string;
  score: number;
  status: 'pass' | 'fail' | 'pending';
  findings: string;
  action: string;
}

const mockData: MonitoringOutletRecord[] = [
  { key: '1', date: '2026-09-15', outlet: 'Kopi Calf Cipete', inspector: 'Fajar Rahman', category: 'Cleanliness', score: 95, status: 'pass', findings: 'All areas clean', action: '-' },
  { key: '2', date: '2026-09-15', outlet: 'Kopi Calf Bandung', inspector: 'Gita Pratiwi', category: 'Stock', score: 72, status: 'fail', findings: 'Low stock on 3 items', action: 'Reorder needed' },
  { key: '3', date: '2026-09-14', outlet: 'Kopi Calf Surabaya', inspector: 'Hadi Prasetyo', category: 'Cleanliness', score: 88, status: 'pass', findings: 'Minor issues in kitchen', action: '-' },
  { key: '4', date: '2026-09-14', outlet: 'Central Kitchen', inspector: 'Andi Wijaya', category: 'Hygiene', score: 0, status: 'pending', findings: 'Under review', action: '-' },
  { key: '5', date: '2026-09-13', outlet: 'Kopi Calf Cipete', inspector: 'Budi Santoso', category: 'Equipment', score: 91, status: 'pass', findings: 'All equipment functioning', action: '-' },
  { key: '6', date: '2026-09-13', outlet: 'Kopi Calf Bandung', inspector: 'Citra Dewi', category: 'Stock', score: 85, status: 'pass', findings: '-', action: '-' },
  { key: '7', date: '2026-09-12', outlet: 'Kopi Calf Surabaya', inspector: 'Dedi Kurniawan', category: 'Hygiene', score: 78, status: 'fail', findings: 'AC needs cleaning', action: 'Schedule maintenance' },
  { key: '8', date: '2026-09-12', outlet: 'Central Kitchen', inspector: 'Eva Marlina', category: 'Cleanliness', score: 92, status: 'pass', findings: '-', action: '-' },
];

export default function MonitoringOutletDataPage() {
  const [loading, setLoading] = useState(true);
  const [data] = useState<MonitoringOutletRecord[]>(mockData);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredData = data.filter(item =>
    !search ||
    item.outlet.toLowerCase().includes(search.toLowerCase()) ||
    item.inspector.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  const columns: ColumnsType<MonitoringOutletRecord> = [
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Inspector', dataIndex: 'inspector', key: 'inspector' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Score', dataIndex: 'score', key: 'score', render: (score) => (
      <span style={{ color: score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f', fontWeight: 600 }}>
        {score > 0 ? `${score}%` : '-'}
      </span>
    )},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
      const colors: Record<string, string> = { pass: '#52c41a', fail: '#ff4d4f', pending: '#faad14' };
      return <span style={{ color: colors[status], fontWeight: 500, textTransform: 'capitalize' }}>{status}</span>;
    }},
    { title: 'Findings', dataIndex: 'findings', key: 'findings' },
    { title: 'Action', dataIndex: 'action', key: 'action' },
  ];

  const passCount = data.filter(d => d.status === 'pass').length;
  const failCount = data.filter(d => d.status === 'fail').length;
  const pendingCount = data.filter(d => d.status === 'pending').length;

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1400 }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Monitoring Outlet - Data</Title>
              <Text type="secondary">View all outlet monitoring data</Text>
            </div>
            <Space>
              <Button>Export</Button>
              <Button type="primary">Add New</Button>
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col><Card size="small"><Statistic title="Total Records" value={data.length} styles={{ content: { color: '#0D2B5E' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Pass" value={passCount} styles={{ content: { color: '#52c41a' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Fail" value={failCount} styles={{ content: { color: '#ff4d4f' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Pending" value={pendingCount} styles={{ content: { color: '#faad14' } }} /></Card></Col>
          </Row>

          {/* Actions */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <Input.Search placeholder="Search by outlet, inspector, or category..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
            <Button>Filter</Button>
          </div>

          {/* Table */}
          <Card styles={{ body: { padding: 0 } }}>
            <Table columns={columns} dataSource={filteredData} loading={loading} rowKey="key" pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} records` }} />
          </Card>
        </div>
      </App>
    </Layout>
  );
}
