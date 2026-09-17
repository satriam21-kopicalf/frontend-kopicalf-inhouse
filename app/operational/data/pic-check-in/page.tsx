'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface PICCheckInRecord {
  key: string;
  date: string;
  employeeName: string;
  outlet: string;
  shift: string;
  clockIn: string;
  clockOut: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes: string;
}

const mockData: PICCheckInRecord[] = [
  { key: '1', date: '2026-09-15', employeeName: 'Andi Wijaya', outlet: 'Kopi Calf Cipete', shift: 'Morning', clockIn: '06:00', clockOut: '14:00', status: 'completed', notes: '-' },
  { key: '2', date: '2026-09-15', employeeName: 'Budi Santoso', outlet: 'Kopi Calf Bandung', shift: 'Afternoon', clockIn: '14:00', clockOut: '22:00', status: 'completed', notes: '-' },
  { key: '3', date: '2026-09-15', employeeName: 'Citra Dewi', outlet: 'Kopi Calf Cipete', shift: 'Night', clockIn: '22:00', clockOut: '06:00', status: 'pending', notes: 'Waiting confirmation' },
  { key: '4', date: '2026-09-14', employeeName: 'Dedi Kurniawan', outlet: 'Kopi Calf Surabaya', shift: 'Morning', clockIn: '06:00', clockOut: '14:00', status: 'completed', notes: '-' },
  { key: '5', date: '2026-09-14', employeeName: 'Eva Marlina', outlet: 'Kopi Calf Cipete', shift: 'Afternoon', clockIn: '14:00', clockOut: '22:00', status: 'cancelled', notes: 'Leave approved' },
  { key: '6', date: '2026-09-13', employeeName: 'Fajar Rahman', outlet: 'Kopi Calf Bandung', shift: 'Morning', clockIn: '06:00', clockOut: '14:00', status: 'completed', notes: '-' },
  { key: '7', date: '2026-09-13', employeeName: 'Gita Pratiwi', outlet: 'Kopi Calf Surabaya', shift: 'Afternoon', clockIn: '14:00', clockOut: '22:00', status: 'completed', notes: '-' },
  { key: '8', date: '2026-09-12', employeeName: 'Hadi Prasetyo', outlet: 'Central Kitchen', shift: 'Morning', clockIn: '05:00', clockOut: '13:00', status: 'completed', notes: '-' },
];

export default function PICCheckInDataPage() {
  const [loading, setLoading] = useState(true);
  const [data] = useState<PICCheckInRecord[]>(mockData);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredData = data.filter(item =>
    !search ||
    item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    item.outlet.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  const columns: ColumnsType<PICCheckInRecord> = [
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Shift', dataIndex: 'shift', key: 'shift' },
    { title: 'Clock In', dataIndex: 'clockIn', key: 'clockIn' },
    { title: 'Clock Out', dataIndex: 'clockOut', key: 'clockOut' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
      const colors: Record<string, string> = { completed: '#52c41a', pending: '#faad14', cancelled: '#8c8c8c' };
      return <span style={{ color: colors[status], fontWeight: 500, textTransform: 'capitalize' }}>{status}</span>;
    }},
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
  ];

  const completedCount = data.filter(d => d.status === 'completed').length;
  const pendingCount = data.filter(d => d.status === 'pending').length;
  const cancelledCount = data.filter(d => d.status === 'cancelled').length;

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1400 }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>PIC Check In - Data</Title>
              <Text type="secondary">View all PIC Check In submission data</Text>
            </div>
            <Space>
              <Button>Export</Button>
              <Button type="primary">Add New</Button>
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col><Card size="small"><Statistic title="Total Records" value={data.length} styles={{ content: { color: '#0D2B5E' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Completed" value={completedCount} styles={{ content: { color: '#52c41a' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Pending" value={pendingCount} styles={{ content: { color: '#faad14' } }} /></Card></Col>
            <Col><Card size="small"><Statistic title="Cancelled" value={cancelledCount} styles={{ content: { color: '#8c8c8c' } }} /></Card></Col>
          </Row>

          {/* Actions */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <Input.Search placeholder="Search by employee, outlet, or date..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
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
