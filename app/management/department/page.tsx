'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Typography, Card, Table, Input, Row, Col, Button, Space, Statistic, Tag, Select, message, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { departmentService, divisionService, type Department, type DepartmentFilter } from '@/services/management/department';

// Use API or mock based on environment
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';

const { Title, Text } = Typography;

interface TableDepartment extends Department {
  key: string;
}

// Mock data for development
const MOCK_DEPARTMENTS: TableDepartment[] = [
  { key: '1', id: 1, name: 'Operations Management', code: 'OPS-MGT', division: 'Operations', headCount: 5, manager: 'Andi Wijaya', description: 'Oversees daily outlet operations', status: 'active', employee_count: 5 },
  { key: '2', id: 2, name: 'Kitchen Operations', code: 'OPS-KTN', division: 'Operations', headCount: 20, manager: 'Dedi Kurniawan', description: 'Food preparation and kitchen management', status: 'active', employee_count: 20 },
  { key: '3', id: 3, name: 'Service Quality', code: 'OPS-SVC', division: 'Operations', headCount: 20, manager: 'Budi Santoso', description: 'Customer service and quality assurance at outlets', status: 'active', employee_count: 20 },
  { key: '4', id: 4, name: 'Marketing Strategy', code: 'MKT-STR', division: 'Marketing', headCount: 6, manager: '-', description: 'Marketing strategy and planning', status: 'active', employee_count: 6 },
  { key: '5', id: 5, name: 'Digital Marketing', code: 'MKT-DGT', division: 'Marketing', headCount: 6, manager: '-', description: 'Social media and digital campaigns', status: 'active', employee_count: 6 },
  { key: '6', id: 6, name: 'Financial Planning', code: 'FIN-PLN', division: 'Finance', headCount: 4, manager: 'Citra Dewi', description: 'Budget planning and financial analysis', status: 'active', employee_count: 4 },
  { key: '7', id: 7, name: 'Accounting', code: 'FIN-ACC', division: 'Finance', headCount: 4, manager: '-', description: 'Financial reporting and bookkeeping', status: 'active', employee_count: 4 },
  { key: '8', id: 8, name: 'Recruitment', code: 'HR-REC', division: 'Human Resources', headCount: 3, manager: 'Eva Marlina', description: 'Talent acquisition and hiring', status: 'active', employee_count: 3 },
  { key: '9', id: 9, name: 'People Development', code: 'HR-DEV', division: 'Human Resources', headCount: 3, manager: '-', description: 'Training and employee development', status: 'active', employee_count: 3 },
  { key: '10', id: 10, name: 'IT Infrastructure', code: 'IT-INF', division: 'Information Technology', headCount: 5, manager: 'Fajar Rahman', description: 'System infrastructure and networks', status: 'active', employee_count: 5 },
  { key: '11', id: 11, name: 'Software Development', code: 'IT-DEV', division: 'Information Technology', headCount: 6, manager: '-', description: 'Application development and maintenance', status: 'active', employee_count: 6 },
  { key: '12', id: 12, name: 'IT Support', code: 'IT-SUP', division: 'Information Technology', headCount: 4, manager: '-', description: 'Technical support and helpdesk', status: 'active', employee_count: 4 },
  { key: '13', id: 13, name: 'Quality Control', code: 'QA-QC', division: 'Quality Assurance', headCount: 5, manager: 'Gita Pratiwi', description: 'Product quality inspection', status: 'active', employee_count: 5 },
  { key: '14', id: 14, name: 'Food Safety', code: 'QA-FS', division: 'Quality Assurance', headCount: 5, manager: '-', description: 'Hygiene and safety compliance', status: 'active', employee_count: 5 },
  { key: '15', id: 15, name: 'Procurement', code: 'SCM-PRO', division: 'Supply Chain', headCount: 8, manager: 'Hadi Prasetyo', description: 'Raw material procurement', status: 'active', employee_count: 8 },
  { key: '16', id: 16, name: 'Warehouse', code: 'SCM-WH', division: 'Supply Chain', headCount: 10, manager: '-', description: 'Inventory and warehouse management', status: 'active', employee_count: 10 },
];

export default function DepartmentPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TableDepartment[]>(MOCK_DEPARTMENTS);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [divisions, setDivisions] = useState<string[]>([]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: DepartmentFilter = {
          search: search || undefined,
          status: 'active',
        };
        const response = await departmentService.list(filter);
        const mappedDepts = (response.data || []).map((d: Department) => ({
          ...d,
          key: String(d.id),
          division: d.division_name || d.division || '',
          headCount: d.employee_count || 0,
          manager: d.manager_name || '-',
        }));
        setData(mappedDepts);
      } else {
        // Mock filtering
        setTimeout(() => {
          const filtered = MOCK_DEPARTMENTS.filter(item => {
            const matchesSearch = !search ||
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.code.toLowerCase().includes(search.toLowerCase()) ||
              (item.manager?.toLowerCase() || '').includes(search.toLowerCase());
            const matchesDivision = !selectedDivision || item.division === selectedDivision;
            return matchesSearch && matchesDivision;
          });
          setData(filtered);
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      message.error('Failed to load departments');
      setData(MOCK_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDivision]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    // Extract unique divisions
    const divs = [...new Set(MOCK_DEPARTMENTS.map(d => d.division).filter((d): d is string => !!d))].sort();
    setDivisions(divs);
  }, []);

  const activeCount = data.filter(d => d.status === 'active').length;
  const totalHeadcount = data.reduce((sum, d) => sum + (d.headCount || d.employee_count || 0), 0);

  const columns: ColumnsType<TableDepartment> = [
    { title: 'Department', key: 'department', render: (_, record) => (
      <div>
        <div style={{ fontWeight: 600 }}>{record.name}</div>
        <Text type="secondary" style={{ fontSize: 11 }}>{record.code}</Text>
      </div>
    )},
    { title: 'Division', dataIndex: 'division', key: 'division', render: (div) => <Tag color="blue">{div}</Tag> },
    { title: 'Manager', dataIndex: 'manager', key: 'manager', render: (mgr) => mgr || '-' },
    { title: 'Headcount', dataIndex: 'headCount', key: 'headCount', align: 'center', render: (count) => <span style={{ fontWeight: 600 }}>{count || 0}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (desc) => desc || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => (
      <Tag color={status === 'active' ? 'success' : 'default'}>{status === 'active' ? 'Active' : 'Inactive'}</Tag>
    )},
    { title: 'Actions', key: 'actions', render: () => (
      <Space>
        <Button type="link" size="small">View</Button>
        <Button type="link" size="small">Edit</Button>
        <Button type="link" size="small" danger>Delete</Button>
      </Space>
    )},
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Department</Title>
            <Text type="secondary">Manage organizational departments</Text>
          </div>
          <Space>
            <Button>Export</Button>
            <Button type="primary" style={{ background: '#0D2B5E' }}>Add Department</Button>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col><Card size="small"><Statistic title="Total Departments" value={data.length} valueStyle={{ color: '#0D2B5E' }} /></Card></Col>
          <Col><Card size="small"><Statistic title="Active" value={activeCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col><Card size="small"><Statistic title="Divisions" value={divisions.length} valueStyle={{ color: '#0D2B5E' }} /></Card></Col>
          <Col><Card size="small"><Statistic title="Total Headcount" value={totalHeadcount} valueStyle={{ color: '#0D2B5E' }} /></Card></Col>
        </Row>

        {/* Actions */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Input.Search placeholder="Search by name, code, or manager..." value={search} onChange={(e) => setSearch(e.target.value)} onSearch={() => fetchDepartments()} style={{ width: 280 }} allowClear />
          <Select
            placeholder="Filter by division"
            value={selectedDivision}
            onChange={setSelectedDivision}
            allowClear
            style={{ width: 200 }}
            options={divisions.map(d => ({ value: d, label: d }))}
          />
        </div>

        {/* Table */}
        <Card styles={{ body: { padding: 0 } }}>
          {loading && data.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center' }}>
              <Spin />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="key"
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} departments` }}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
