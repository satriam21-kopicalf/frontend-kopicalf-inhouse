'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Space, Tag, Modal, Form, Input, Select, InputNumber,
  message, Tabs, Badge, Tooltip, Popconfirm, Row, Col, Statistic, Descriptions
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  SettingOutlined, UserSwitchOutlined, LockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { approvalLinesService, type ApprovalConfiguration, type ApprovalConfigFilter, type ApprovalRequest, type ApprovalRequestFilter } from '@/services/management/approval-lines';
import Layout from '@/components/Layout';

// Use API or mock based on environment
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';

// Mock Data - Approval Configurations
const mockConfigurations = [
  {
    id: 1,
    name: 'Facility Request Approval',
    description: 'Approval workflow for facility maintenance requests',
    form_type: 'FACILITY_REQUEST',
    department: 'General Affair',
    division: 'Finance',
    level_count: 3,
    is_active: true,
    created_by: 'admin@calf.id',
    created_at: '2024-09-10 08:00:00',
    levels: [
      { level: 1, name: 'Supervisor Approval', approver_type: 'ROLE', approver: 'Supervisor' },
      { level: 2, name: 'Manager Approval', approver_type: 'USER', approver: 'John Doe' },
      { level: 3, name: 'Director Approval', approver_type: 'ROLE', approver: 'Director' },
    ],
  },
  {
    id: 2,
    name: 'Tool Request Approval',
    description: 'Approval workflow for tool and heavy tools requests',
    form_type: 'TOOL_REQUEST',
    department: 'Kitchen',
    division: 'Operations',
    level_count: 2,
    is_active: true,
    created_by: 'admin@calf.id',
    created_at: '2024-09-08 10:30:00',
    levels: [
      { level: 1, name: 'Team Lead Approval', approver_type: 'ROLE', approver: 'Team Lead' },
      { level: 2, name: 'Department Head', approver_type: 'DEPARTMENT_HEAD', approver: 'Auto' },
    ],
  },
  {
    id: 3,
    name: 'Purchase Request - High Value',
    description: 'Approval for purchases above 5 million',
    form_type: 'PURCHASE_REQUEST',
    department: null,
    division: 'Finance',
    level_count: 4,
    is_active: true,
    min_amount: 5000000,
    created_by: 'finance@calf.id',
    created_at: '2024-09-05 14:20:00',
    levels: [
      { level: 1, name: 'Requester Manager', approver_type: 'DEPARTMENT_HEAD', approver: 'Auto' },
      { level: 2, name: 'Finance Manager', approver_type: 'ROLE', approver: 'Finance Manager' },
      { level: 3, name: 'CFO Approval', approver_type: 'USER', approver: 'Jane Smith' },
      { level: 4, name: 'CEO Approval', approver_type: 'USER', approver: 'CEO Name' },
    ],
  },
  {
    id: 4,
    name: 'Leave Request Standard',
    description: 'Standard leave request approval workflow',
    form_type: 'LEAVE_REQUEST',
    department: null,
    division: null,
    level_count: 2,
    is_active: false,
    created_by: 'hr@calf.id',
    created_at: '2024-08-20 09:00:00',
    levels: [
      { level: 1, name: 'Direct Supervisor', approver_type: 'DEPARTMENT_HEAD', approver: 'Auto' },
      { level: 2, name: 'HR Manager', approver_type: 'ROLE', approver: 'HR Manager' },
    ],
  },
];

// Mock Data - Approval Requests
const mockRequests = [
  {
    id: 101,
    config_name: 'Facility Request Approval',
    form_type: 'FACILITY_REQUEST',
    reference_id: 'FAC-2024-001',
    requester: 'Michael Chen',
    department: 'Kitchen',
    division: 'Operations',
    amount: 2500000,
    current_level: 2,
    status: 'PENDING',
    submitted_at: '2024-09-15 09:30:00',
    current_approver: 'John Doe',
  },
  {
    id: 102,
    config_name: 'Tool Request Approval',
    form_type: 'TOOL_REQUEST',
    reference_id: 'TOOL-2024-015',
    requester: 'Sarah Johnson',
    department: 'Service',
    division: 'Operations',
    amount: 1500000,
    current_level: 1,
    status: 'PENDING',
    submitted_at: '2024-09-15 11:45:00',
    current_approver: 'Team Lead',
  },
  {
    id: 103,
    config_name: 'Purchase Request - High Value',
    form_type: 'PURCHASE_REQUEST',
    reference_id: 'PUR-2024-008',
    requester: 'Robert Williams',
    department: 'Accounting',
    division: 'Finance',
    amount: 8500000,
    current_level: 3,
    status: 'PENDING',
    submitted_at: '2024-09-14 16:20:00',
    current_approver: 'Jane Smith',
  },
  {
    id: 104,
    config_name: 'Facility Request Approval',
    form_type: 'FACILITY_REQUEST',
    reference_id: 'FAC-2024-002',
    requester: 'Lisa Anderson',
    department: 'Kitchen',
    division: 'Operations',
    amount: 500000,
    current_level: 3,
    status: 'APPROVED',
    submitted_at: '2024-09-10 08:15:00',
    completed_at: '2024-09-12 14:30:00',
  },
  {
    id: 105,
    config_name: 'Tool Request Approval',
    form_type: 'TOOL_REQUEST',
    reference_id: 'TOOL-2024-012',
    requester: 'David Brown',
    department: 'Inventory',
    division: 'Operations',
    amount: 3000000,
    current_level: 2,
    status: 'REJECTED',
    submitted_at: '2024-09-08 13:00:00',
    rejected_at: '2024-09-09 10:00:00',
    rejection_reason: 'Budget constraints for Q3',
  },
];

// Mock Data - RBAC
const mockPermissions = [
  { id: 1, code: 'approval.config.view', name: 'View Approval Configurations', module: 'approval.config' },
  { id: 2, code: 'approval.config.create', name: 'Create Approval Configuration', module: 'approval.config' },
  { id: 3, code: 'approval.config.update', name: 'Update Approval Configuration', module: 'approval.config' },
  { id: 4, code: 'approval.config.delete', name: 'Delete Approval Configuration', module: 'approval.config' },
  { id: 5, code: 'approval.request.view', name: 'View Approval Requests', module: 'approval.request' },
  { id: 6, code: 'approval.request.create', name: 'Create Approval Request', module: 'approval.request' },
  { id: 7, code: 'approval.request.approve', name: 'Approve Request', module: 'approval.request' },
  { id: 8, code: 'approval.request.reject', name: 'Reject Request', module: 'approval.request' },
  { id: 9, code: 'approval.rbac.view', name: 'View RBAC Settings', module: 'approval.rbac' },
  { id: 10, code: 'approval.rbac.manage', name: 'Manage RBAC Settings', module: 'approval.rbac' },
];

const mockRoles = [
  {
    id: 1,
    name: 'Administrator',
    is_system: true,
    permissions: mockPermissions.map(p => p.code),
    page_access: {
      '/management/approval-lines': { view: true, create: true, edit: true, delete: true },
      '/management/approval-lines/requests': { view: true, create: true, edit: true, delete: true },
      '/management/approval-lines/rbac': { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 2,
    name: 'Approval Manager',
    is_system: false,
    permissions: ['approval.config.view', 'approval.request.view', 'approval.request.approve', 'approval.request.reject'],
    page_access: {
      '/management/approval-lines': { view: true, create: false, edit: false, delete: false },
      '/management/approval-lines/requests': { view: true, create: true, edit: false, delete: false },
      '/management/approval-lines/rbac': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 3,
    name: 'Department Head',
    is_system: false,
    permissions: ['approval.request.view', 'approval.request.approve', 'approval.request.reject'],
    page_access: {
      '/management/approval-lines': { view: false, create: false, edit: false, delete: false },
      '/management/approval-lines/requests': { view: true, create: false, edit: false, delete: false },
      '/management/approval-lines/rbac': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 4,
    name: 'Regular User',
    is_system: false,
    permissions: ['approval.request.view', 'approval.request.create'],
    page_access: {
      '/management/approval-lines': { view: false, create: false, edit: false, delete: false },
      '/management/approval-lines/requests': { view: true, create: true, edit: false, delete: false },
      '/management/approval-lines/rbac': { view: false, create: false, edit: false, delete: false },
    },
  },
];

const mockPageAccess = [
  { path: '/management/approval-lines', name: 'Approval Lines - Configurations' },
  { path: '/management/approval-lines/requests', name: 'Approval Lines - Requests' },
  { path: '/management/approval-lines/rbac', name: 'Approval Lines - RBAC' },
  { path: '/operational/form/facility-request', name: 'Form - Facility Request' },
  { path: '/operational/form/tool-heavy-tools', name: 'Form - Tool & Heavy Tools' },
  { path: '/operational/form/purchase-request', name: 'Form - Purchase Request' },
];

// Form Types
const formTypes = [
  { value: 'FACILITY_REQUEST', label: 'Facility Request' },
  { value: 'TOOL_REQUEST', label: 'Tool & Heavy Tools Request' },
  { value: 'PURCHASE_REQUEST', label: 'Purchase Request' },
  { value: 'LEAVE_REQUEST', label: 'Leave Request' },
  { value: 'OVERTIME_REQUEST', label: 'Overtime Request' },
  { value: 'EXPENSE_REQUEST', label: 'Expense Request' },
];

// Approver Types
const approverTypes = [
  { value: 'USER', label: 'Specific User' },
  { value: 'ROLE', label: 'Role Based' },
  { value: 'DEPARTMENT_HEAD', label: 'Department Head (Auto)' },
  { value: 'DIVISION_HEAD', label: 'Division Head (Auto)' },
  { value: 'AUTO', label: 'Auto Approve' },
];

export default function ApprovalLinesPage() {
  const [activeTab, setActiveTab] = useState('configurations');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [form] = Form.useForm();
  const [levelForm] = Form.useForm();
  const [configData, setConfigData] = useState(mockConfigurations);
  const [requestData, setRequestData] = useState(mockRequests);
  const [selectedLevels, setSelectedLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch configurations from API
  const fetchConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: ApprovalConfigFilter = { status: 'active' };
        const response = await approvalLinesService.listConfigurations(filter);
        setConfigData((response.data || []) as any);
      }
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
      message.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch requests from API
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: ApprovalRequestFilter = {};
        const response = await approvalLinesService.listRequests(filter);
        setRequestData((response.data || []) as any);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      message.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigurations();
    fetchRequests();
  }, [fetchConfigurations, fetchRequests]);

  // Handle create configuration
  const handleCreateConfig = async (values: any) => {
    try {
      if (USE_API) {
        await approvalLinesService.createConfiguration({
          name: values.name,
          description: values.description,
          form_type: values.form_type,
          department: values.department,
          division: values.division,
          min_amount: values.min_amount,
          is_active: values.is_active ?? true,
          levels: [], // Required by type but handled separately
        } as any);
        message.success('Configuration created successfully');
      } else {
        message.success('Configuration created (mock)');
      }
      setConfigModalVisible(false);
      fetchConfigurations();
    } catch (error) {
      console.error('Failed to create configuration:', error);
      message.error('Failed to create configuration');
    }
  };

  // Handle update configuration
  const handleUpdateConfig = async (values: any) => {
    if (!selectedConfig) return;
    try {
      if (USE_API) {
        await approvalLinesService.updateConfiguration(selectedConfig.id, {
          name: values.name,
          description: values.description,
          form_type: values.form_type,
          department: values.department,
          division: values.division,
          min_amount: values.min_amount,
          is_active: values.is_active,
        });
        message.success('Configuration updated successfully');
      } else {
        message.success('Configuration updated (mock)');
      }
      setConfigModalVisible(false);
      fetchConfigurations();
    } catch (error) {
      console.error('Failed to update configuration:', error);
      message.error('Failed to update configuration');
    }
  };

  // Handle delete configuration
  const handleDeleteConfig = async (id: number) => {
    try {
      if (USE_API) {
        await approvalLinesService.deleteConfiguration(id);
        message.success('Configuration deleted');
      } else {
        message.success('Configuration deleted (mock)');
      }
      setConfigData(configData.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      message.error('Failed to delete configuration');
    }
  };

  // Handle approve request
  const handleApprove = async (id: number) => {
    try {
      if (USE_API) {
        await approvalLinesService.approveRequest(id, { notes: 'Approved' });
        message.success('Request approved');
      } else {
        message.success('Request approved (mock)');
      }
      fetchRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
      message.error('Failed to approve request');
    }
  };

  // Handle reject request
  const handleReject = async (id: number, reason?: string) => {
    try {
      if (USE_API) {
        await approvalLinesService.rejectRequest(id, { notes: reason });
        message.success('Request rejected');
      } else {
        message.success('Request rejected (mock)');
      }
      fetchRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      message.error('Failed to reject request');
    }
  };

  // Configurations Table Columns
  const configColumns: ColumnsType<any> = [
    {
      title: 'Configuration Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#8A8A8A' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Form Type',
      dataIndex: 'form_type',
      key: 'form_type',
      render: (type: string) => (
        <Tag color="blue">
          {formTypes.find(f => f.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Scope',
      key: 'scope',
      render: (_: any, record: any) => (
        <div style={{ fontSize: 12 }}>
          <div>Dept: {record.department || 'All'}</div>
          <div>Div: {record.division || 'All'}</div>
          {record.min_amount && (
            <div>Min: Rp {record.min_amount.toLocaleString()}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Levels',
      dataIndex: 'level_count',
      key: 'level_count',
      width: 100,
      render: (count: number) => <Badge count={count} style={{ backgroundColor: '#1890ff' }} />,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedConfig(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedConfig(record);
                form.setFieldsValue({
                  name: record.name,
                  description: record.description,
                  form_type: record.form_type,
                  department: record.department,
                  division: record.division,
                  min_amount: record.min_amount,
                  is_active: record.is_active,
                });
                setConfigModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this configuration?"
            onConfirm={() => handleDeleteConfig(record.id)}
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Requests Table Columns
  const requestColumns: ColumnsType<any> = [
    {
      title: 'Request ID',
      dataIndex: 'reference_id',
      key: 'reference_id',
      render: (id: string) => <span style={{ fontWeight: 500 }}>{id}</span>,
    },
    {
      title: 'Form Type',
      dataIndex: 'form_type',
      key: 'form_type',
      render: (type: string) => (
        <Tag color="blue">
          {formTypes.find(f => f.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Requester',
      dataIndex: 'requester',
      key: 'requester',
    },
    {
      title: 'Department',
      key: 'department',
      render: (_: any, record: any) => (
        <span>{record.department} / {record.division}</span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => amount ? `Rp ${amount.toLocaleString()}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          PENDING: { color: 'warning', icon: <ClockCircleOutlined /> },
          APPROVED: { color: 'success', icon: <CheckCircleOutlined /> },
          REJECTED: { color: 'error', icon: <CloseCircleOutlined /> },
        };
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Current Level',
      key: 'current_level',
      render: (_: any, record: any) => (
        <span>
          Level {record.current_level}
          {record.status === 'PENDING' && record.current_approver && (
            <span style={{ fontSize: 11, color: '#8A8A8A', display: 'block' }}>
              → {record.current_approver}
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date: string) => date?.split(' ')[0] || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  style={{ color: '#ff4d4f' }}
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Stats
  const stats = {
    total_configs: configData.length,
    active_configs: configData.filter(c => c.is_active).length,
    pending_requests: requestData.filter(r => r.status === 'PENDING').length,
    total_requests: requestData.length,
  };

  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Approval Lines</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            Configure multi-level approval workflows based on department, division, and form type
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Total Configurations" value={stats.total_configs} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Active Configurations" value={stats.active_configs} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Pending Requests" value={stats.pending_requests} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Total Requests" value={stats.total_requests} />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'configurations',
                label: (
                  <span>
                    <SettingOutlined /> Configurations
                  </span>
                ),
                children: (
                  <>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                      <Space>
                        <Input.Search placeholder="Search configurations..." style={{ width: 300 }} />
                        <Select placeholder="Filter by Form Type" style={{ width: 180 }} allowClear options={formTypes} />
                      </Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setSelectedConfig(null);
                        form.resetFields();
                        setConfigModalVisible(true);
                      }}>
                        New Configuration
                      </Button>
                    </div>
                    <Table
                      columns={configColumns}
                      dataSource={configData}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  </>
                ),
              },
              {
                key: 'requests',
                label: (
                  <span>
                    <ClockCircleOutlined /> Requests
                    {stats.pending_requests > 0 && (
                      <Badge count={stats.pending_requests} style={{ marginLeft: 8 }} />
                    )}
                  </span>
                ),
                children: (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <Space>
                        <Input.Search placeholder="Search requests..." style={{ width: 300 }} />
                        <Select placeholder="Status" style={{ width: 150 }} allowClear>
                          <Select.Option value="PENDING">Pending</Select.Option>
                          <Select.Option value="APPROVED">Approved</Select.Option>
                          <Select.Option value="REJECTED">Rejected</Select.Option>
                        </Select>
                      </Space>
                    </div>
                    <Table
                      columns={requestColumns}
                      dataSource={requestData}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  </>
                ),
              },
              {
                key: 'rbac',
                label: (
                  <span>
                    <LockOutlined /> RBAC Settings
                  </span>
                ),
                children: (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <h3>Permissions</h3>
                      <p style={{ color: '#666', marginBottom: 16 }}>
                        Define granular permissions for approval system access
                      </p>
                      <Table
                        columns={[
                          { title: 'Code', dataIndex: 'code', key: 'code', width: 300 },
                          { title: 'Name', dataIndex: 'name', key: 'name' },
                          { title: 'Module', dataIndex: 'module', key: 'module', width: 150,
                            render: (m: string) => <Tag>{m}</Tag> },
                        ]}
                        dataSource={mockPermissions}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <h3>Page Access Control</h3>
                      <p style={{ color: '#666', marginBottom: 16 }}>
                        Define which pages each role can access
                      </p>
                      <Table
                        columns={[
                          { title: 'Page Path', dataIndex: 'path', key: 'path', width: 350 },
                          { title: 'Page Name', dataIndex: 'name', key: 'name' },
                          { title: 'Actions', key: 'actions', width: 100,
                            render: () => <Button type="link" size="small">Configure</Button> },
                        ]}
                        dataSource={mockPageAccess}
                        rowKey="path"
                        pagination={false}
                        size="small"
                      />
                    </div>

                    <div>
                      <h3>Role Assignments</h3>
                      <p style={{ color: '#666', marginBottom: 16 }}>
                        Manage role-based access control for approval system
                      </p>
                      <Row gutter={16}>
                        {mockRoles.map(role => (
                          <Col span={6} key={role.id}>
                            <Card
                              size="small"
                              title={
                                <Space>
                                  <span>{role.name}</span>
                                  {role.is_system && <Tag color="gold">System</Tag>}
                                </Space>
                              }
                              actions={[
                                <Button type="link" size="small" key="edit">Edit</Button>,
                              ]}
                            >
                              <div style={{ marginBottom: 8 }}>
                                <strong>Permissions:</strong> {role.permissions.length}
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <strong>Pages:</strong> {Object.keys(role.page_access).length}
                              </div>
                              <Space wrap>
                                {role.permissions.slice(0, 3).map(p => (
                                  <Tag key={p} style={{ fontSize: 10 }}>{p.split('.')[1]}</Tag>
                                ))}
                                {role.permissions.length > 3 && (
                                  <Tag style={{ fontSize: 10 }}>+{role.permissions.length - 3}</Tag>
                                )}
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Card>

        {/* Configuration Modal */}
        <Modal
          title={selectedConfig ? 'Edit Configuration' : 'New Configuration'}
          open={configModalVisible}
          onCancel={() => setConfigModalVisible(false)}
          onOk={() => form.submit()}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={selectedConfig ? handleUpdateConfig : handleCreateConfig}
          >
            <Form.Item name="name" label="Configuration Name" rules={[{ required: true }]}>
              <Input placeholder="e.g., Facility Request Approval" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} placeholder="Brief description of this approval workflow" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="form_type" label="Form Type" rules={[{ required: true }]}>
                  <Select placeholder="Select form type" options={formTypes} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="is_active" label="Status" initialValue={true} valuePropName="checked">
                  <Select>
                    <Select.Option value={true}>Active</Select.Option>
                    <Select.Option value={false}>Inactive</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="department" label="Department">
                  <Input placeholder="Leave empty for all departments" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="division" label="Division">
                  <Input placeholder="Leave empty for all divisions" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="min_amount" label="Minimum Amount (Optional)">
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Leave empty for no minimum"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          title="Configuration Details"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>Close</Button>,
            <Button key="edit" type="primary" onClick={() => {
              setDetailModalVisible(false);
              form.setFieldsValue({
                name: selectedConfig?.name,
                description: selectedConfig?.description,
                form_type: selectedConfig?.form_type,
                department: selectedConfig?.department,
                division: selectedConfig?.division,
                min_amount: selectedConfig?.min_amount,
              });
              setConfigModalVisible(true);
            }}>Edit</Button>,
          ]}
          width={700}
        >
          {selectedConfig && (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Name" span={2}>{selectedConfig.name}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{selectedConfig.description}</Descriptions.Item>
              <Descriptions.Item label="Form Type">
                <Tag color="blue">{formTypes.find(f => f.value === selectedConfig.form_type)?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedConfig.is_active ? 'success' : 'default'}>
                  {selectedConfig.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">{selectedConfig.department || 'All'}</Descriptions.Item>
              <Descriptions.Item label="Division">{selectedConfig.division || 'All'}</Descriptions.Item>
              <Descriptions.Item label="Min Amount" span={2}>
                {selectedConfig.min_amount ? `Rp ${selectedConfig.min_amount.toLocaleString()}` : 'No minimum'}
              </Descriptions.Item>
              <Descriptions.Item label="Created By" span={2}>{selectedConfig.created_by}</Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>{selectedConfig.created_at}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
