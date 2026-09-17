'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface MonitoringProductRecord {
  key: string;
  date: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  result: 'pass' | 'fail' | 'pending';
  labResult: string;
  notes: string;
  checkedBy: string;
}

const mockData: MonitoringProductRecord[] = [
  { key: '1', date: '2026-09-15', productName: 'Espresso Beans 1kg', batchNumber: 'BN-2026-001', expiryDate: '2027-03-15', result: 'pass', labResult: '合格', notes: 'Quality check passed', checkedBy: 'QC Team' },
  { key: '2', date: '2026-09-15', productName: 'Milk 1L', batchNumber: 'BN-2026-002', expiryDate: '2026-09-17', result: 'fail', labResult: '不合格', notes: 'Expired in 2 days', checkedBy: 'QC Team' },
  { key: '3', date: '2026-09-14', productName: 'Sugar 1kg', batchNumber: 'BN-2026-003', expiryDate: '2027-06-20', result: 'pass', labResult: '合格', notes: 'All good', checkedBy: 'QC Team' },
  { key: '4', date: '2026-09-14', productName: 'Coconut Oil 500ml', batchNumber: 'BN-2026-004', expiryDate: '2026-10-01', result: 'pending', labResult: '-', notes: 'Waiting lab result', checkedBy: 'Lab' },
  { key: '5', date: '2026-09-13', productName: 'Chocolate Syrup', batchNumber: 'BN-2026-005', expiryDate: '2027-01-10', result: 'pass', labResult: '合格', notes: '-', checkedBy: 'QC Team' },
  { key: '6', date: '2026-09-13', productName: 'Caramel Syrup', batchNumber: 'BN-2026-006', expiryDate: '2026-12-25', result: 'pass', labResult: '合格', notes: '-', checkedBy: 'QC Team' },
  { key: '7', date: '2026-09-12', productName: 'Vanilla Syrup', batchNumber: 'BN-2026-007', expiryDate: '2026-11-30', result: 'fail', labResult: '不合格', notes: 'Contamination detected', checkedBy: 'Lab' },
  { key: '8', date: '2026-09-12', productName: 'Whipped Cream', batchNumber: 'BN-2026-008', expiryDate: '2026-09-16', result: 'pass', labResult: '合格', notes: '-', checkedBy: 'QC Team' },
];

export default function MonitoringProductDataPage() {
  const [loading, setLoading] = useState(true);
  const [data] = useState<MonitoringProductRecord[]>(mockData);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredData = data.filter(item =>
    !search ||
    item.productName.toLowerCase().includes(search.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
    item.checkedBy.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  const columns: ColumnsType<MonitoringProductRecord> = [
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Batch Number', dataIndex: 'batchNumber', key: 'batchNumber' },
    { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate' },
    { title: 'Lab Result', dataIndex: 'labResult', key: 'labResult', render: (val) => (
      <span style={{ fontWeight: 500 }}>{val}</span>
    )},
    { title: 'Status', dataIndex: 'result', key: 'result', render: (result) => {
      const colors: Record<string, string> = { pass: '#52c41a', fail: '#ff4d4f', pending: '#faad14' };
      return <span style={{ color: colors[result], fontWeight: 500, textTransform: 'capitalize' }}>{result}</span>;
    }},
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
    { title: 'Checked By', dataIndex: 'checkedBy', key: 'checkedBy' },
  ];

  const passCount = data.filter(d => d.result === 'pass').length;
  const failCount = data.filter(d => d.result === 'fail').length;
  const pendingCount = data.filter(d => d.result === 'pending').length;

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1400 }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Monitoring Product - Data</Title>
              <Text type="secondary">View all product monitoring and quality check data</Text>
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
            <Input.Search placeholder="Search by product, batch number, or checker..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
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
