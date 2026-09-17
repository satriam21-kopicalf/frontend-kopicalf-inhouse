'use client';

import { useState } from 'react';
import {
  Card, Table, Button, Space, Tag, Switch, Checkbox, Row, Col,
  Modal, Form, Input, Select, Tree, message, Drawer, Descriptions,
  Popconfirm, Tooltip, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined,
  LockOutlined, UserOutlined, TeamOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// Mock Data - Users with Page Access
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@calf.id',
    role: 'Administrator',
    department: 'IT',
    is_active: true,
    page_access: {
      '/management/*': { view: true, create: true, edit: true, delete: true },
      '/operational/*': { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@calf.id',
    role: 'Approval Manager',
    department: 'Finance',
    is_active: true,
    page_access: {
      '/management/approval-lines': { view: true, create: false, edit: true, delete: false },
      '/operational/*': { view: true, create: true, edit: false, delete: false },
    },
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@calf.id',
    role: 'Department Head',
    department: 'Kitchen',
    is_active: true,
    page_access: {
      '/management/approval-lines/requests': { view: true, create: false, edit: false, delete: false },
      '/operational/form/*': { view: true, create: true, edit: false, delete: false },
    },
  },
  {
    id: 4,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@calf.id',
    role: 'Regular User',
    department: 'Service',
    is_active: false,
    page_access: {
      '/operational/*': { view: true, create: true, edit: false, delete: false },
    },
  },
];

// Available Pages for RBAC
const availablePages = [
  {
    key: 'management',
    title: 'Management',
    children: [
      { key: '/management/approval-lines', title: 'Approval Lines - Configurations' },
      { key: '/management/approval-lines/requests', title: 'Approval Lines - Requests' },
      { key: '/management/approval-lines/rbac', title: 'Approval Lines - RBAC' },
      { key: '/management/users', title: 'User Management' },
      { key: '/management/department', title: 'Departments' },
      { key: '/management/division', title: 'Divisions' },
    ],
  },
  {
    key: 'operational-form',
    title: 'Operational - Forms',
    children: [
      { key: '/operational/form/pic-check-in', title: 'PIC Check In' },
      { key: '/operational/form/monitoring-outlet', title: 'Monitoring Outlet' },
      { key: '/operational/form/monitoring-product', title: 'Monitoring Product' },
      { key: '/operational/form/tool-heavy-tools', title: 'Tool & Heavy Tools' },
      { key: '/operational/form/facility-request', title: 'Facility Request' },
    ],
  },
  {
    key: 'operational-data',
    title: 'Operational - Data',
    children: [
      { key: '/operational/data/pic-check-in', title: 'PIC Check In Data' },
      { key: '/operational/data/monitoring-outlet', title: 'Monitoring Outlet Data' },
      { key: '/operational/data/monitoring-product', title: 'Monitoring Product Data' },
      { key: '/operational/data/tool-heavy-tools', title: 'Tool & Heavy Tools Data' },
      { key: '/operational/data/facility-request', title: 'Facility Request Data' },
    ],
  },
];

// CRUD Permissions
const crudPermissions = [
  { key: 'view', label: 'View', description: 'Can view page and data' },
  { key: 'create', label: 'Create', description: 'Can create new records' },
  { key: 'edit', label: 'Edit', description: 'Can edit existing records' },
  { key: 'delete', label: 'Delete', description: 'Can delete records' },
];

// Approval-specific permissions
const approvalPermissions = [
  { code: 'approval.config.view', name: 'View Approval Configurations', category: 'Configuration' },
  { code: 'approval.config.create', name: 'Create Approval Configuration', category: 'Configuration' },
  { code: 'approval.config.update', name: 'Update Approval Configuration', category: 'Configuration' },
  { code: 'approval.config.delete', name: 'Delete Approval Configuration', category: 'Configuration' },
  { code: 'approval.request.view', name: 'View Approval Requests', category: 'Request' },
  { code: 'approval.request.create', name: 'Create Approval Request', category: 'Request' },
  { code: 'approval.request.approve', name: 'Approve Request', category: 'Request' },
  { code: 'approval.request.reject', name: 'Reject Request', category: 'Request' },
  { code: 'approval.rbac.view', name: 'View RBAC Settings', category: 'RBAC' },
  { code: 'approval.rbac.manage', name: 'Manage RBAC Settings', category: 'RBAC' },
];

export default function RBACPage() {
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [pageAccessModalVisible, setPageAccessModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userData, setUserData] = useState(mockUsers);
  const [userForm] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['management', 'operational-form', 'operational-data']);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  // User Table Columns
  const userColumns: ColumnsType<any> = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#f0f0f0', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <UserOutlined style={{ fontSize: 18, color: '#999' }} />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#8A8A8A' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag icon={<TeamOutlined />}>{role}</Tag>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Page Access',
      key: 'page_access',
      render: (_: any, record: any) => {
        const pages = Object.keys(record.page_access);
        return (
          <Space wrap>
            {pages.slice(0, 2).map(page => (
              <Tag key={page} style={{ fontSize: 11 }}>{page}</Tag>
            ))}
            {pages.length > 2 && <Tag style={{ fontSize: 11 }}>+{pages.length - 2}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Switch checked={active} checkedChildren="Active" unCheckedChildren="Inactive" />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Edit User">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(record);
                userForm.setFieldsValue({
                  name: record.name,
                  email: record.email,
                  role: record.role,
                  department: record.department,
                });
                setUserModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Configure Page Access">
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedUser(record);
                // Convert page_access to checkedKeys
                const keys: React.Key[] = [];
                Object.entries(record.page_access).forEach(([path, access]: [string, any]) => {
                  if (path.endsWith('/*')) {
                    // Group path - expand to children
                    const parent = path.replace('/*', '');
                    Object.keys(record.page_access).forEach((p) => {
                      if (p.startsWith(parent) && !p.endsWith('/*')) {
                        keys.push(p);
                      }
                    });
                  } else if (access.view || access.create || access.edit || access.delete) {
                    keys.push(path);
                  }
                });
                setCheckedKeys(keys);
                setPageAccessModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => {
              setUserData(userData.filter(u => u.id !== record.id));
              message.success('User deleted');
            }}
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>RBAC Settings</h1>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          Configure Role-Based Access Control with granular page-level and CRUD permissions
        </p>
      </div>

      {/* Approval Permissions Section */}
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>Approval System Permissions</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {['Configuration', 'Request', 'RBAC'].map((category) => (
            <Col span={8} key={category}>
              <Card title={category} size="small">
                {approvalPermissions
                  .filter(p => p.category === category)
                  .map(permission => (
                    <div key={permission.code} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <div style={{ fontSize: 13 }}>{permission.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{permission.code}</div>
                      </div>
                      <Switch size="small" defaultChecked />
                    </div>
                  ))}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* User Page Access Section */}
      <Card
        title={
          <Space>
            <LockOutlined />
            <span>User Page Access Control</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setSelectedUser(null);
            userForm.resetFields();
            setUserModalVisible(true);
          }}>
            Add User
          </Button>
        }
      >
        <Table
          columns={userColumns}
          dataSource={userData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* User Modal */}
      <Modal
        title={selectedUser ? 'Edit User' : 'Add New User'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        onOk={() => {
          userForm.validateFields().then((values) => {
            if (selectedUser) {
              setUserData(userData.map(u =>
                u.id === selectedUser.id ? { ...u, ...values } : u
              ));
              message.success('User updated');
            } else {
              setUserData([...userData, {
                id: Date.now(),
                ...values,
                is_active: true,
                page_access: {},
              }]);
              message.success('User created');
            }
            setUserModalVisible(false);
          });
        }}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              <Select.Option value="Administrator">Administrator</Select.Option>
              <Select.Option value="Approval Manager">Approval Manager</Select.Option>
              <Select.Option value="Department Head">Department Head</Select.Option>
              <Select.Option value="Regular User">Regular User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="Department">
            <Select placeholder="Select department">
              <Select.Option value="Kitchen">Kitchen</Select.Option>
              <Select.Option value="Service">Service</Select.Option>
              <Select.Option value="Inventory">Inventory</Select.Option>
              <Select.Option value="Accounting">Accounting</Select.Option>
              <Select.Option value="General Affair">General Affair</Select.Option>
              <Select.Option value="IT">IT</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Page Access Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>Configure Page Access</span>
            {selectedUser && <Tag>{selectedUser.name}</Tag>}
          </Space>
        }
        open={pageAccessModalVisible}
        onCancel={() => setPageAccessModalVisible(false)}
        onOk={() => {
          message.success('Page access updated for ' + selectedUser?.name);
          setPageAccessModalVisible(false);
        }}
        width={700}
        footer={null}
      >
        {selectedUser && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    // Select all
                    const allKeys = availablePages.flatMap(p => p.children?.map(c => c.key) || []);
                    setCheckedKeys(allKeys as React.Key[]);
                  } else {
                    setCheckedKeys([]);
                  }
                }}
              >
                Select All Pages
              </Checkbox>
            </div>

            <Tree
              checkable
              selectable={false}
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              checkedKeys={checkedKeys}
              onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
              treeData={availablePages}
              style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}
            />

            <div style={{ marginTop: 16 }}>
              <h4>Quick Actions</h4>
              <Space wrap>
                <Button size="small" onClick={() => {
                  // Management only
                  const keys = availablePages.find(p => p.key === 'management')?.children?.map(c => c.key) || [];
                  setCheckedKeys(keys as React.Key[]);
                }}>
                  Management Only
                </Button>
                <Button size="small" onClick={() => {
                  // Operational only
                  const keys = availablePages
                    .filter(p => p.key.startsWith('operational'))
                    .flatMap(p => p.children?.map(c => c.key) || []);
                  setCheckedKeys(keys as React.Key[]);
                }}>
                  Operational Only
                </Button>
                <Button size="small" onClick={() => setCheckedKeys([])}>
                  Clear All
                </Button>
              </Space>
            </div>

            <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Selected Pages ({checkedKeys.length})</div>
              <Space wrap>
                {checkedKeys.map(key => (
                  <Tag key={String(key)}>{String(key)}</Tag>
                ))}
              </Space>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setPageAccessModalVisible(false)}>Cancel</Button>
              <Button type="primary" onClick={() => {
                message.success('Page access updated');
                setPageAccessModalVisible(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
