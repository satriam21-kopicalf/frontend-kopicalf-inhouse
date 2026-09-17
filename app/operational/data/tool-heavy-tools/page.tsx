'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface ToolRecord {
  key: string;
  date: string;
  toolName: string;
  toolCode: string;
  quantity: number;
  location: string;
  condition: 'good' | 'maintenance' | 'damaged';
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
}

const mockData: ToolRecord[] = [
  { key: '1', date: '2026-09-15', toolName: 'Espresso Machine', toolCode: 'EQP-001', quantity: 2, location: 'Kopi Calf Cipete', condition: 'good', lastMaintenance: '2026-08-15', nextMaintenance: '2026-11-15', notes: '-' },
  { key: '2', date: '2026-09-15', toolName: 'Coffee Grinder', toolCode: 'EQP-002', quantity: 4, location: 'Kopi Calf Bandung', condition: 'maintenance', lastMaintenance: '2026-07-01', nextMaintenance: '2026-09-20', notes: 'Scheduled for service' },
  { key: '3', date: '2026-09-14', toolName: 'Blender', toolCode: 'EQP-003', quantity: 3, location: 'Kopi Calf Surabaya', condition: 'good', lastMaintenance: '2026-09-01', nextMaintenance: '2026-12-01', notes: '-' },
  { key: '4', date: '2026-09-14', toolName: 'Cake Display', toolCode: 'EQP-004', quantity: 1, location: 'Central Kitchen', condition: 'damaged', lastMaintenance: '-', nextMaintenance: '-', notes: 'Needs replacement' },
  { key: '5', date: '2026-09-13', toolName: 'POS Terminal', toolCode: 'EQP-005', quantity: 6, location: 'Kopi Calf Cipete', condition: 'good', lastMaintenance: '2026-06-20', nextMaintenance: '2026-09-20', notes: '-' },
  { key: '6', date: '2026-09-13', toolName: 'Air Fryer', toolCode: 'EQP-006', quantity: 2, location: 'Kopi Calf Bandung', condition: 'good', lastMaintenance: '2026-08-10', nextMaintenance: '2026-11-10', notes: '-' },
  { key: '7', date: '2026-09-12', toolName: 'Refrigerator', toolCode: 'EQP-007', quantity: 4, location: 'Central Kitchen', condition: 'maintenance', lastMaintenance: '2026-05-15', nextMaintenance: '2026-09-15', notes: 'Compressor issue' },
  { key: '8', date: '2026-09-12', toolName: 'Oven', toolCode: 'EQP-008', quantity: 3, location: 'Kopi Calf Surabaya', condition: 'good', lastMaintenance: '2026-07-25', nextMaintenance: '2026-10-25', notes: '-' },
];

export default function ToolHeavyToolsDataPage() {
  const [loading, setLoading] = useState(true);
  const [data] = useState<ToolRecord[]>(mockData);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredData = data.filter(item =>
    !search ||
    item.toolName.toLowerCase().includes(search.toLowerCase()) ||
    item.toolCode.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  const columns: ColumnsType<ToolRecord> = [
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'Tool Name', dataIndex: 'toolName', key: 'toolName' },
    { title: 'Code', dataIndex: 'toolCode', key: 'toolCode' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Condition', dataIndex: 'condition', key: 'condition', render: (condition) => {
      const colors: Record<string, string> = { good: '#52c41a', maintenance: '#faad14', damaged: '#ff4d4f' };
      return <span style={{ color: colors[condition], fontWeight: 500, textTransform: 'capitalize' }}>{condition}</span>;
    }},
    { title: 'Last Maintenance', dataIndex: 'lastMaintenance', key: 'lastMaintenance' },
    { title: 'Next Maintenance', dataIndex: 'nextMaintenance', key: 'nextMaintenance' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
  ];

  const goodCount = data.filter(d => d.condition === 'good').length;
  const maintenanceCount = data.filter(d => d.condition === 'maintenance').length;
  const damagedCount = data.filter(d => d.condition === 'damaged').length;

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1400 }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Tool & Heavy Tools - Data</Title>
              <Text type="secondary">View all equipment and tools inventory data</Text>
            </div>
            <Space>
              <Button>Export</Button>
              <Button type="primary">Add New</Button>
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col><Card size="small"><Statistic title="Total Items" value={data.reduce((sum, d) => sum + d.quantity, 0)} styles={{ content: { color: '#0D2B5E' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Good Condition" value={goodCount} styles={{ content: { color: '#52c41a' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Needs Maintenance" value={maintenanceCount} styles={{ content: { color: '#faad14' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Damaged" value={damagedCount} styles={{ content: { color: '#ff4d4f' } }} /></Card></Col>
          </Row>

          {/* Actions */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <Input.Search placeholder="Search by tool name, code, or location..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
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
