'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface FacilityRequestRecord {
  key: string;
  date: string;
  requestNumber: string;
  outlet: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed';
  assignedTo: string;
  completedDate: string;
  cost: number;
}

const mockData: FacilityRequestRecord[] = [
  { key: '1', date: '2026-09-15', requestNumber: 'FR-2026-001', outlet: 'Kopi Calf Cipete', category: 'AC Repair', description: 'AC unit not cooling properly', priority: 'high', status: 'in_progress', assignedTo: 'AC Service Co.', completedDate: '-', cost: 1500000 },
  { key: '2', date: '2026-09-15', requestNumber: 'FR-2026-002', outlet: 'Kopi Calf Bandung', category: 'Electrical', description: 'Light flickering in dining area', priority: 'medium', status: 'open', assignedTo: '-', completedDate: '-', cost: 0 },
  { key: '3', date: '2026-09-14', requestNumber: 'FR-2026-003', outlet: 'Kopi Calf Surabaya', category: 'Plumbing', description: 'Water tap leaking', priority: 'low', status: 'completed', assignedTo: 'Plumber A', completedDate: '2026-09-14', cost: 350000 },
  { key: '4', date: '2026-09-14', requestNumber: 'FR-2026-004', outlet: 'Central Kitchen', category: 'Equipment', description: 'Oven thermostat not working', priority: 'high', status: 'in_progress', assignedTo: 'Equipment Service', completedDate: '-', cost: 0 },
  { key: '5', date: '2026-09-13', requestNumber: 'FR-2026-005', outlet: 'Kopi Calf Cipete', category: 'Painting', description: 'Wall repainting needed', priority: 'low', status: 'completed', assignedTo: 'Painter Team', completedDate: '2026-09-13', cost: 2500000 },
  { key: '6', date: '2026-09-13', requestNumber: 'FR-2026-006', outlet: 'Kopi Calf Bandung', category: 'Furniture', description: 'Chair replacement', priority: 'medium', status: 'open', assignedTo: '-', completedDate: '-', cost: 0 },
  { key: '7', date: '2026-09-12', requestNumber: 'FR-2026-007', outlet: 'Kopi Calf Surabaya', category: 'Cleaning', description: 'Deep cleaning service', priority: 'low', status: 'completed', assignedTo: 'Cleaning Co.', completedDate: '2026-09-12', cost: 800000 },
  { key: '8', date: '2026-09-12', requestNumber: 'FR-2026-008', outlet: 'Central Kitchen', category: 'Maintenance', description: 'Floor tile repair', priority: 'medium', status: 'in_progress', assignedTo: 'Contractor B', completedDate: '-', cost: 0 },
];

export default function FacilityRequestDataPage() {
  const [loading, setLoading] = useState(true);
  const [data] = useState<FacilityRequestRecord[]>(mockData);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredData = data.filter(item =>
    !search ||
    item.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
    item.outlet.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const columns: ColumnsType<FacilityRequestRecord> = [
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'Request #', dataIndex: 'requestNumber', key: 'requestNumber' },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (priority) => {
      const colors: Record<string, string> = { high: 'red', medium: 'orange', low: 'default' };
      return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
    }},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
      const colors: Record<string, string> = { open: 'default', in_progress: 'processing', completed: 'success' };
      return <Tag color={colors[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>;
    }},
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
    { title: 'Completed', dataIndex: 'completedDate', key: 'completedDate' },
    { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (cost) => cost > 0 ? formatCurrency(cost) : '-' },
  ];

  const openCount = data.filter(d => d.status === 'open').length;
  const inProgressCount = data.filter(d => d.status === 'in_progress').length;
  const completedCount = data.filter(d => d.status === 'completed').length;
  const totalCost = data.filter(d => d.cost > 0).reduce((sum, d) => sum + d.cost, 0);

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1400 }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Facility Request - Data</Title>
              <Text type="secondary">View all facility maintenance and repair requests</Text>
            </div>
            <Space>
              <Button>Export</Button>
              <Button type="primary">Add New</Button>
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col><Card size="small"><Statistic title="Total Requests" value={data.length} styles={{ content: { color: '#0D2B5E' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Open" value={openCount} /></Card></Col>
            <Col><Card size="small"><Statistic title="In Progress" value={inProgressCount} styles={{ content: { color: '#1890ff' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Completed" value={completedCount} styles={{ content: { color: '#52c41a' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Total Cost" value={formatCurrency(totalCost)} styles={{ content: { color: '#0D2B5E', fontSize: 16 } }} /></Card></Col>
          </Row>

          {/* Actions */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <Input.Search placeholder="Search by request number, outlet, or description..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
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
