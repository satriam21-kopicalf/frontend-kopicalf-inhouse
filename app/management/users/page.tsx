'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Typography, Button, Input, Select, Avatar, message, Modal, Table, Space, Tag, Dropdown, Card, Spin } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userService, type User, type UserFilter } from '@/services/management/user';

const { Title, Text } = Typography;

// Use API or mock based on environment
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';

function FlatStats({ stats }: { stats: { label: string; value: string | number; highlight?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', marginBottom: 16, padding: '12px 0', borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}>
      {stats.map((stat, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: 11, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{stat.label}</Text>
          <Text style={{ fontSize: 16, fontWeight: 600, color: stat.highlight ? '#0D2B5E' : '#333333', lineHeight: 1 }}>{stat.value}</Text>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const is = status === 'active';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 500,
      background: is ? '#ECFDF5' : '#F5F5F5',
      color: is ? '#059669' : '#8A8A8A'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: is ? '#10B981' : '#CCCCCC' }} />
      {is ? 'Active' : 'Inactive'}
    </span>
  );
}

// API response type adapter
interface TableUser extends User {
  key: string;
}

// Mock data for development
const MOCK_USERS: TableUser[] = [
  { id: 1, employeeId: 'EMP001', employee_code: 'EMP001', firstName: 'Andi', lastName: 'Wijaya', email: 'andi.wijaya@kopicalf.com', phone: '0812-3456-7890', department: 'Operations', position: 'Area Manager', role: 'Manager', branch: 'Kopi Calf Cipete', status: 'active', lastLogin: '2026-09-15 08:30', key: '1' },
  { id: 2, employeeId: 'EMP002', employee_code: 'EMP002', firstName: 'Budi', lastName: 'Santoso', email: 'budi.santoso@kopicalf.com', phone: '0813-4567-8901', department: 'Marketing', position: 'Marketing Manager', role: 'Admin', branch: 'Kopi Calf Bandung', status: 'active', lastLogin: '2026-09-15 09:15', key: '2' },
  { id: 3, employeeId: 'EMP003', employee_code: 'EMP003', firstName: 'Citra', lastName: 'Dewi', email: 'citra.dewi@kopicalf.com', phone: '0814-5678-9012', department: 'Finance', position: 'Finance Supervisor', role: 'Supervisor', branch: 'Kopi Calf Cipete', status: 'active', lastLogin: '2026-09-14 17:45', key: '3' },
  { id: 4, employeeId: 'EMP004', employee_code: 'EMP004', firstName: 'Dedi', lastName: 'Kurniawan', email: 'dedi.kurniawan@kopicalf.com', phone: '0815-6789-0123', department: 'Operations', position: 'Kitchen Manager', role: 'Manager', branch: 'Kopi Calf Surabaya', status: 'inactive', lastLogin: '2026-09-10 14:20', key: '4' },
  { id: 5, employeeId: 'EMP005', employee_code: 'EMP005', firstName: 'Eva', lastName: 'Marlina', email: 'eva.marlina@kopicalf.com', phone: '0816-7890-1234', department: 'Human Resources', position: 'HR Manager', role: 'Manager', branch: 'Kopi Calf Cipete', status: 'active', lastLogin: '2026-09-15 07:00', key: '5' },
  { id: 6, employeeId: 'EMP006', employee_code: 'EMP006', firstName: 'Fajar', lastName: 'Rahman', email: 'fajar.rahman@kopicalf.com', phone: '0817-8901-2345', department: 'IT', position: 'IT Supervisor', role: 'Supervisor', branch: 'Kopi Calf Bandung', status: 'active', lastLogin: '2026-09-15 10:00', key: '6' },
  { id: 7, employeeId: 'EMP007', employee_code: 'EMP007', firstName: 'Gita', lastName: 'Pratiwi', email: 'gita.pratiwi@kopicalf.com', phone: '0818-9012-3456', department: 'Quality Assurance', position: 'QA Supervisor', role: 'Supervisor', branch: 'Central Kitchen', status: 'active', lastLogin: '2026-09-14 16:30', key: '7' },
  { id: 8, employeeId: 'EMP008', employee_code: 'EMP008', firstName: 'Hadi', lastName: 'Prasetyo', email: 'hadi.prasetyo@kopicalf.com', phone: '0819-0123-4567', department: 'Supply Chain', position: 'Warehouse Manager', role: 'Manager', branch: 'Central Kitchen', status: 'inactive', lastLogin: '2026-09-08 11:15', key: '8' },
];

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<TableUser[]>(MOCK_USERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUser, setPreviewUser] = useState<TableUser | null>(null);
  const [editingUser, setEditingUser] = useState<TableUser | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [search, setSearch] = useState('');
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    department: '', position: '', role: '', branch: ''
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: UserFilter = {
          search: search || undefined,
          page,
          page_size: pageSize,
        };
        const response = await userService.listUsers(filter);
        const mappedUsers = (response.data || []).map((u: User) => ({
          ...u,
          key: String(u.id),
          firstName: (u.full_name || '').split(' ')[0] || '',
          lastName: (u.full_name || '').split(' ').slice(1).join(' ') || '',
          employeeId: u.employee_code || `USR${String(u.id).padStart(3, '0')}`,
          branch: u.branch || '',
          lastLogin: u.last_login || '-',
        }));
        setUsers(mappedUsers);
        setTotal(response.total);
      } else {
        // Mock data
        setTimeout(() => {
          const filtered = MOCK_USERS.filter(u =>
            (u.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.employee_code || '').toLowerCase().includes(search.toLowerCase())
          );
          setUsers(filtered);
          setTotal(filtered.length);
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to load users');
      // Fallback to mock data
      setUsers(MOCK_USERS);
      setTotal(MOCK_USERS.length);
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const activeCount = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

  const handlePreview = (user: TableUser) => {
    setPreviewUser(user);
    setPreviewOpen(true);
  };

  const handleEdit = (user: TableUser) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      role: user.role || '',
      branch: user.branch || ''
    });
    setCurrentStep(0);
    setDrawerOpen(true);
  };

  const handleDelete = async (key: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          if (USE_API) {
            await userService.deleteUser(parseInt(key));
          }
          setUsers(users.filter(u => u.key !== key));
          message.success('User deleted successfully');
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error('Failed to delete user');
        }
      }
    });
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setForm({
      firstName: '', lastName: '', email: '', phone: '',
      department: '', position: '', role: '', branch: ''
    });
    setCurrentStep(0);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      message.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        if (USE_API) {
          await userService.updateUser(editingUser.id, {
            email: form.email,
          });
        }
        setUsers(users.map(u =>
          u.key === editingUser.key ? { ...u, ...form } : u
        ));
        message.success('User updated successfully');
      } else {
        // Create new user
        if (USE_API) {
          const newUser = await userService.createUser({
            email: form.email,
            username: form.email.split('@')[0],
            password: 'temppass123', // Will be changed
            role_id: 1, // Default role
          });
          setUsers([{ ...newUser, key: String(newUser.id), firstName: form.firstName, lastName: form.lastName, employeeId: newUser.employee_code || '', branch: form.branch, lastLogin: '-' } as TableUser, ...users]);
        } else {
          const newUser: TableUser = {
            id: users.length + 1,
            key: String(users.length + 1),
            employeeId: `EMP${String(users.length + 1).padStart(3, '0')}`,
            ...form,
            status: 'active',
            lastLogin: '-'
          };
          setUsers([newUser, ...users]);
        }
        message.success('User created successfully');
      }
      setDrawerOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error('Failed to save user');
    }
  };

  const columns: ColumnsType<TableUser> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ background: '#0D2B5E', flexShrink: 0 }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: 11, color: '#8A8A8A' }}>{record.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <Text style={{ fontSize: 13 }}>{email}</Text>
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => dept ? <Tag color="blue">{dept}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (pos: string) => pos || <Text type="secondary">-</Text>
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
      render: (branch: string) => <Text type="secondary">{branch || '-'}</Text>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = role === 'Admin' ? 'red' : role === 'Manager' ? 'green' : role === 'Supervisor' ? 'orange' : 'default';
        return <Tag color={color}>{role || 'Staff'}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'inactive') => <StatusBadge status={status} />
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (login: string) => <Text type="secondary" style={{ fontSize: 12 }}>{login}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: 'View Details', onClick: () => handlePreview(record) },
          { key: 'edit', label: 'Edit User', onClick: () => handleEdit(record) },
          { type: 'divider' },
          { key: 'delete', label: 'Delete User', danger: true, onClick: () => handleDelete(record.key) }
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" size="small">•••</Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>User Management</Title>
          <Text type="secondary">Manage user accounts and permissions</Text>
        </div>

        {/* Stats */}
        <FlatStats stats={[
          { label: 'Total Users', value: total, highlight: true },
          { label: 'Active', value: activeCount },
          { label: 'Inactive', value: inactiveCount }
        ]} />

        {/* Actions Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Input.Search
            placeholder="Search by name, email, or employee ID..."
            style={{ width: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={() => fetchUsers()}
            allowClear
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" onClick={handleAddNew} style={{ background: '#0D2B5E' }}>
            + Add User
          </Button>
        </div>

        {/* Table */}
        <Card styles={{ body: { padding: 0 } }}>
          {loading && users.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center' }}>
              <Spin />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={users}
              loading={loading}
              rowKey="key"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: setPage,
                showSizeChanger: false,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
              }}
            />
          )}
        </Card>

        {/* Preview Modal */}
        <Modal
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          footer={[
            <Button key="close" onClick={() => setPreviewOpen(false)}>Close</Button>,
            <Button key="edit" type="primary" onClick={() => { setPreviewOpen(false); if (previewUser) handleEdit(previewUser); }} style={{ background: '#0D2B5E' }}>
              Edit User
            </Button>
          ]}
          title="User Details"
        >
          {previewUser && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Employee ID</Text>
                <div style={{ fontWeight: 500 }}>{previewUser.employeeId}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Status</Text>
                <div style={{ marginTop: 4 }}><StatusBadge status={previewUser.status} /></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Name</Text>
                <div style={{ fontWeight: 500 }}>{previewUser.firstName} {previewUser.lastName}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Email</Text>
                <div style={{ fontWeight: 500 }}>{previewUser.email}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Phone</Text>
                <div>{previewUser.phone || '-'}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Department</Text>
                <div>{previewUser.department || '-'}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Position</Text>
                <div>{previewUser.position || '-'}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Role</Text>
                <div>{previewUser.role || '-'}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Branch</Text>
                <div>{previewUser.branch || '-'}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Last Login</Text>
                <div>{previewUser.lastLogin}</div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit/Add Modal */}
        <Modal
          open={drawerOpen}
          onCancel={() => setDrawerOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setDrawerOpen(false)}>Cancel</Button>,
            <Button key="save" type="primary" onClick={handleSave} style={{ background: '#0D2B5E' }}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          ]}
          title={editingUser ? 'Edit User' : 'Add New User'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>First Name *</Text>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Enter first name"
                  style={{ marginTop: 4 }}
                />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Last Name *</Text>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Enter last name"
                  style={{ marginTop: 4 }}
                />
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Email *</Text>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email address"
                type="email"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Phone</Text>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number"
                style={{ marginTop: 4 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Department</Text>
                <Select
                  value={form.department || undefined}
                  onChange={(value) => setForm({ ...form, department: value })}
                  placeholder="Select department"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { value: 'Operations', label: 'Operations' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Human Resources', label: 'Human Resources' },
                    { value: 'IT', label: 'IT' },
                    { value: 'Quality Assurance', label: 'Quality Assurance' },
                    { value: 'Supply Chain', label: 'Supply Chain' }
                  ]}
                />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Position</Text>
                <Input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Enter position"
                  style={{ marginTop: 4 }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Role</Text>
                <Select
                  value={form.role || undefined}
                  onChange={(value) => setForm({ ...form, role: value })}
                  placeholder="Select role"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Manager', label: 'Manager' },
                    { value: 'Supervisor', label: 'Supervisor' },
                    { value: 'Staff', label: 'Staff' }
                  ]}
                />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Branch</Text>
                <Select
                  value={form.branch || undefined}
                  onChange={(value) => setForm({ ...form, branch: value })}
                  placeholder="Select branch"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { value: 'Kopi Calf Cipete', label: 'Kopi Calf Cipete' },
                    { value: 'Kopi Calf Bandung', label: 'Kopi Calf Bandung' },
                    { value: 'Kopi Calf Surabaya', label: 'Kopi Calf Surabaya' },
                    { value: 'Central Kitchen', label: 'Central Kitchen' }
                  ]}
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
