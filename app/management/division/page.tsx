'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { divisionService, type Division, type DivisionFilter } from '@/services/management/department';

// Use API or mock based on environment
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';

const { Title, Text } = Typography;

interface TableDivision extends Division {
  key: string;
}

const mockData: TableDivision[] = [
  { key: '1', id: 1, name: 'Operations', code: 'DIV-OPS', department_count: 3, total_headcount: 45, manager: 'Andi Wijaya', description: 'Handles all outlet operations and daily activities', status: 'active' },
  { key: '2', id: 2, name: 'Marketing', code: 'DIV-MKT', department_count: 2, total_headcount: 12, manager: 'Budi Santoso', description: 'Marketing strategy, digital campaigns, and brand management', status: 'active' },
  { key: '3', id: 3, name: 'Finance', code: 'DIV-FIN', department_count: 2, total_headcount: 8, manager: 'Citra Dewi', description: 'Financial planning, accounting, and reporting', status: 'active' },
  { key: '4', id: 4, name: 'Human Resources', code: 'DIV-HR', department_count: 2, total_headcount: 6, manager: 'Eva Marlina', description: 'Talent acquisition, development, and employee relations', status: 'active' },
  { key: '5', id: 5, name: 'Information Technology', code: 'DIV-IT', department_count: 3, total_headcount: 15, manager: 'Fajar Rahman', description: 'IT infrastructure, software development, and support', status: 'active' },
  { key: '6', id: 6, name: 'Quality Assurance', code: 'DIV-QA', department_count: 2, total_headcount: 10, manager: 'Gita Pratiwi', description: 'Product quality control and food safety compliance', status: 'active' },
  { key: '7', id: 7, name: 'Supply Chain', code: 'DIV-SCM', department_count: 2, total_headcount: 18, manager: 'Hadi Prasetyo', description: 'Procurement, warehousing, and inventory management', status: 'active' },
];

export default function DivisionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TableDivision[]>(mockData);
  const [search, setSearch] = useState('');

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: DivisionFilter = {
          search: search || undefined,
          status: 'active',
        };
        const response = await divisionService.list(filter);
        const mappedDivisions = (response.data || []).map((d: Division) => ({
          ...d,
          key: String(d.id),
          department_count: d.department_count || 0,
          total_headcount: d.total_headcount || 0,
          manager: d.manager_name || d.manager || '-',
        }));
        setData(mappedDivisions);
      } else {
        // Mock filtering
        setTimeout(() => {
          const filtered = mockData.filter(item =>
            !search ||
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            (item.manager?.toLowerCase() || '').includes(search.toLowerCase())
          );
          setData(filtered);
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      message.error('Failed to load divisions');
      setData(mockData);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const columns: ColumnsType<TableDivision> = [
    { title: 'Division', key: 'division', render: (_, record) => (
      <div>
        <div style={{ fontWeight: 600 }}>{record.name}</div>
        <Text type="secondary" style={{ fontSize: 11 }}>{record.code}</Text>
      </div>
    )},
    { title: 'Manager', dataIndex: 'manager', key: 'manager' },
    { title: 'Departments', dataIndex: 'department_count', key: 'department_count', align: 'center', render: (count) => <Tag>{count || 0} departments</Tag> },
    { title: 'Headcount', dataIndex: 'total_headcount', key: 'total_headcount', align: 'center', render: (count) => <span style={{ fontWeight: 600, color: '#0D2B5E' }}>{count || 0}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (desc) => desc || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => (
      <Tag color={status === 'active' ? 'success' : 'default'}>{status === 'active' ? 'Active' : 'Inactive'}</Tag>
    )},
    { title: 'Actions', key: 'actions', render: () => (
      <Space>
        <Button type="link" size="small">View</Button>
        <Button type="link" size="small">Edit</Button>
      </Space>
    )},
  ];

  const activeCount = data.filter(d => d.status === 'active').length;
  const totalHeadcount = data.reduce((sum, d) => sum + (d.total_headcount || 0), 0);

  return (
    <Layout>
      <div style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Division</Title>
            <Text type="secondary">Manage organizational divisions</Text>
          </div>
          <Space>
            <Button>Export</Button>
            <Button type="primary" style={{ background: '#0D2B5E' }}>Add Division</Button>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col><Card size="small"><Statistic title="Total Divisions" value={data.length} valueStyle={{ color: '#0D2B5E' }} /></Card></Col>
          <Col><Card size="small"><Statistic title="Active" value={activeCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col><Card size="small"><Statistic title="Total Departments" value={data.reduce((sum, d) => sum + (d.department_count || 0), 0)} valueStyle={{ color: '#0D2B5E' }} /></Card></Col>
          <Col><Card size="small"><Statistic title="Total Headcount" value={totalHeadcount} valueStyle={{ color: '#0D2B5E' }} /></Card></Col>
        </Row>

        {/* Actions */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Input.Search placeholder="Search by name, code, or manager..." value={search} onChange={(e) => setSearch(e.target.value)} onSearch={() => fetchDivisions()} style={{ width: 320 }} allowClear />
          <Button>Filter</Button>
        </div>

        {/* Table */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table columns={columns} dataSource={data} loading={loading} rowKey="key" pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} divisions` }} />
        </Card>
      </div>
    </Layout>
  );
}
