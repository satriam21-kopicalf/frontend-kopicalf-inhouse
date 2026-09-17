'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Row, Col, Statistic, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App } from 'antd';

const { Title, Text } = Typography;

interface DataRow {
  key: string;
  [key: string]: string | number;
}

const picData: DataRow[] = [
  { key: '1', date: '2026-09-15', employee: 'Andi Wijaya', outlet: 'Kopi Calf Cipete', status: 'completed' },
  { key: '2', date: '2026-09-15', employee: 'Budi Santoso', outlet: 'Kopi Calf Bandung', status: 'completed' },
  { key: '3', date: '2026-09-14', employee: 'Citra Dewi', outlet: 'Kopi Calf Cipete', status: 'pending' },
];

const outletData: DataRow[] = [
  { key: '1', date: '2026-09-15', outlet: 'Kopi Calf Cipete', inspector: 'Fajar Rahman', category: 'Cleanliness', status: 'pass' },
  { key: '2', date: '2026-09-15', outlet: 'Kopi Calf Bandung', inspector: 'Gita Pratiwi', category: 'Stock', status: 'fail' },
];

const productData: DataRow[] = [
  { key: '1', date: '2026-09-15', product: 'Espresso Beans 1kg', batch: 'BN-2026-001', result: 'Pass' },
  { key: '2', date: '2026-09-15', product: 'Milk 1L', batch: 'BN-2026-002', result: 'Fail' },
];

const toolData: DataRow[] = [
  { key: '1', date: '2026-09-15', tool: 'Espresso Machine', location: 'Kopi Calf Cipete', condition: 'Good' },
  { key: '2', date: '2026-09-15', tool: 'Coffee Grinder', location: 'Kopi Calf Bandung', condition: 'Maintenance' },
];

const facilityData: DataRow[] = [
  { key: '1', date: '2026-09-15', request: 'FR-2026-001', outlet: 'Kopi Calf Cipete', category: 'AC Repair', status: 'In Progress' },
  { key: '2', date: '2026-09-15', request: 'FR-2026-002', outlet: 'Kopi Calf Bandung', category: 'Electrical', status: 'Open' },
];

export default function DataPage() {
  const [loading] = useState(false);

  const picCols: ColumnsType<DataRow> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Employee', dataIndex: 'employee', key: 'employee' },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const outletCols: ColumnsType<DataRow> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Inspector', dataIndex: 'inspector', key: 'inspector' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const productCols: ColumnsType<DataRow> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { title: 'Batch', dataIndex: 'batch', key: 'batch' },
    { title: 'Result', dataIndex: 'result', key: 'result' },
  ];

  const toolCols: ColumnsType<DataRow> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Tool', dataIndex: 'tool', key: 'tool' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Condition', dataIndex: 'condition', key: 'condition' },
  ];

  const facilityCols: ColumnsType<DataRow> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Request #', dataIndex: 'request', key: 'request' },
    { title: 'Outlet', dataIndex: 'outlet', key: 'outlet' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const tabs = [
    { key: 'pic', label: `PIC (${picData.length})`, children: <Table columns={picCols} dataSource={picData} loading={loading} rowKey="key" pagination={{ pageSize: 5 }} /> },
    { key: 'outlet', label: `Outlet (${outletData.length})`, children: <Table columns={outletCols} dataSource={outletData} loading={loading} rowKey="key" pagination={{ pageSize: 5 }} /> },
    { key: 'product', label: `Product (${productData.length})`, children: <Table columns={productCols} dataSource={productData} loading={loading} rowKey="key" pagination={{ pageSize: 5 }} /> },
    { key: 'tool', label: `Tool (${toolData.length})`, children: <Table columns={toolCols} dataSource={toolData} loading={loading} rowKey="key" pagination={{ pageSize: 5 }} /> },
    { key: 'facility', label: `Facility (${facilityData.length})`, children: <Table columns={facilityCols} dataSource={facilityData} loading={loading} rowKey="key" pagination={{ pageSize: 5 }} /> },
  ];

  return (
    <Layout>
      <App>
        <div style={{ maxWidth: 1200 }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Data</Title>
            <Text type="secondary">Overview semua data operasional</Text>
          </div>

          <Row gutter={12} style={{ marginBottom: 24 }}>
            <Col><Card size="small"><Statistic title="PIC Check In" value={picData.length} /></Card></Col>
            <Col><Card size="small"><Statistic title="Outlet" value={outletData.length} /></Card></Col>
            <Col><Card size="small"><Statistic title="Product" value={productData.length} /></Card></Col>
            <Col><Card size="small"><Statistic title="Tool" value={toolData.length} /></Card></Col>
            <Col><Card size="small"><Statistic title="Facility" value={facilityData.length} /></Card></Col>
          </Row>

          <Card>
            <Tabs items={tabs} />
          </Card>
        </div>
      </App>
    </Layout>
  );
}
