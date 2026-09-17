'use client';

import { useState } from 'react';
import {
  Table, Card, Button, Space, Tag, Modal, Form, Input, Select,
  message, Row, Col, Descriptions, Timeline, Drawer, Badge, Statistic,
  InputNumber, DatePicker, Popconfirm, Tooltip, Empty
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, EyeOutlined, FilterOutlined, SearchOutlined,
  ReloadOutlined, DownloadOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// Mock Data - Approval Requests
const mockRequests = [
  {
    id: 101,
    config_name: 'Facility Request Approval',
    form_type: 'FACILITY_REQUEST',
    reference_id: 'FAC-2024-001',
    requester: { id: 1, name: 'Michael Chen', email: 'michael@calf.id', department: 'Kitchen' },
    department: 'Kitchen',
    division: 'Operations',
    amount: 2500000,
    current_level: 2,
    total_levels: 3,
    status: 'PENDING',
    submitted_at: '2024-09-15 09:30:00',
    current_approver: { name: 'John Doe', type: 'USER' },
    data: {
      facility_type: 'Air Conditioner',
      location: 'Kitchen Area A',
      description: 'AC unit not cooling properly, needs maintenance',
      priority: 'HIGH',
    },
    history: [
      { level: 1, action: 'SUBMIT', actor: 'Michael Chen', note: 'Request submitted', time: '2024-09-15 09:30:00', status: 'COMPLETED' },
      { level: 2, action: 'PENDING', actor: 'John Doe', note: 'Awaiting approval', time: '2024-09-15 09:31:00', status: 'PENDING' },
    ],
  },
  {
    id: 102,
    config_name: 'Tool Request Approval',
    form_type: 'TOOL_REQUEST',
    reference_id: 'TOOL-2024-015',
    requester: { id: 2, name: 'Sarah Johnson', email: 'sarah@calf.id', department: 'Service' },
    department: 'Service',
    division: 'Operations',
    amount: 1500000,
    current_level: 1,
    total_levels: 2,
    status: 'PENDING',
    submitted_at: '2024-09-15 11:45:00',
    current_approver: { name: 'Team Lead', type: 'ROLE' },
    data: {
      tool_type: 'Industrial Mixer',
      quantity: 2,
      purpose: 'Bakery production expansion',
      priority: 'NORMAL',
    },
    history: [
      { level: 1, action: 'SUBMIT', actor: 'Sarah Johnson', note: 'Request submitted', time: '2024-09-15 11:45:00', status: 'PENDING' },
    ],
  },
  {
    id: 103,
    config_name: 'Purchase Request - High Value',
    form_type: 'PURCHASE_REQUEST',
    reference_id: 'PUR-2024-008',
    requester: { id: 3, name: 'Robert Williams', email: 'robert@calf.id', department: 'Accounting' },
    department: 'Accounting',
    division: 'Finance',
    amount: 8500000,
    current_level: 3,
    total_levels: 4,
    status: 'PENDING',
    submitted_at: '2024-09-14 16:20:00',
    current_approver: { name: 'Jane Smith', type: 'USER' },
    data: {
      item_name: 'Commercial Oven',
      supplier: 'Kitchen Equipment Corp',
      quantity: 1,
      unit_price: 8500000,
      priority: 'HIGH',
    },
    history: [
      { level: 1, action: 'SUBMIT', actor: 'Robert Williams', note: 'Request submitted', time: '2024-09-14 16:20:00', status: 'COMPLETED' },
      { level: 1, action: 'APPROVE', actor: 'Department Head', note: 'Approved, proceeding to finance', time: '2024-09-14 17:00:00', status: 'COMPLETED' },
      { level: 2, action: 'APPROVE', actor: 'Finance Manager', note: 'Budget verified', time: '2024-09-14 18:30:00', status: 'COMPLETED' },
      { level: 3, action: 'PENDING', actor: 'Jane Smith', note: 'Awaiting CFO approval', time: '2024-09-14 18:31:00', status: 'PENDING' },
    ],
  },
  {
    id: 104,
    config_name: 'Facility Request Approval',
    form_type: 'FACILITY_REQUEST',
    reference_id: 'FAC-2024-002',
    requester: { id: 4, name: 'Lisa Anderson', email: 'lisa@calf.id', department: 'Kitchen' },
    department: 'Kitchen',
    division: 'Operations',
    amount: 500000,
    current_level: 3,
    total_levels: 3,
    status: 'APPROVED',
    submitted_at: '2024-09-10 08:15:00',
    completed_at: '2024-09-12 14:30:00',
    data: {
      facility_type: 'Exhaust Fan',
      location: 'Kitchen Area B',
      description: 'Replace broken exhaust fan',
      priority: 'URGENT',
    },
    history: [
      { level: 1, action: 'SUBMIT', actor: 'Lisa Anderson', note: 'Request submitted', time: '2024-09-10 08:15:00', status: 'COMPLETED' },
      { level: 1, action: 'APPROVE', actor: 'Supervisor', note: 'Approved', time: '2024-09-10 10:00:00', status: 'COMPLETED' },
      { level: 2, action: 'APPROVE', actor: 'John Doe', note: 'Approved', time: '2024-09-11 09:00:00', status: 'COMPLETED' },
      { level: 3, action: 'APPROVE', actor: 'Director', note: 'Final approval granted', time: '2024-09-12 14:30:00', status: 'COMPLETED' },
    ],
  },
  {
    id: 105,
    config_name: 'Tool Request Approval',
    form_type: 'TOOL_REQUEST',
    reference_id: 'TOOL-2024-012',
    requester: { id: 5, name: 'David Brown', email: 'david@calf.id', department: 'Inventory' },
    department: 'Inventory',
    division: 'Operations',
    amount: 3000000,
    current_level: 2,
    total_levels: 2,
    status: 'REJECTED',
    submitted_at: '2024-09-08 13:00:00',
    rejected_at: '2024-09-09 10:00:00',
    rejection_reason: 'Budget constraints for Q3 - please resubmit in Q4',
    data: {
      tool_type: 'Forklift',
      quantity: 1,
      purpose: 'Warehouse expansion',
      priority: 'NORMAL',
    },
    history: [
      { level: 1, action: 'SUBMIT', actor: 'David Brown', note: 'Request submitted', time: '2024-09-08 13:00:00', status: 'COMPLETED' },
      { level: 1, action: 'APPROVE', actor: 'Team Lead', note: 'Approved', time: '2024-09-08 14:00:00', status: 'COMPLETED' },
      { level: 2, action: 'REJECT', actor: 'Department Head', note: 'Budget constraints for Q3 - please resubmit in Q4', time: '2024-09-09 10:00:00', status: 'REJECTED' },
    ],
  },
];

// Form Types
const formTypes = [
  { value: 'FACILITY_REQUEST', label: 'Facility Request', color: 'blue' },
  { value: 'TOOL_REQUEST', label: 'Tool Request', color: 'cyan' },
  { value: 'PURCHASE_REQUEST', label: 'Purchase Request', color: 'purple' },
  { value: 'LEAVE_REQUEST', label: 'Leave Request', color: 'green' },
  { value: 'EXPENSE_REQUEST', label: 'Expense Request', color: 'orange' },
];

export default function ApprovalRequestsPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNote, setActionNote] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [formTypeFilter, setFormTypeFilter] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (searchText && !r.reference_id.toLowerCase().includes(searchText.toLowerCase()) &&
        !r.requester.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (statusFilter && r.status !== statusFilter) return false;
    if (formTypeFilter && r.form_type !== formTypeFilter) return false;
    return true;
  });

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  // Table Columns
  const columns: ColumnsType<any> = [
    {
      title: 'Request ID',
      dataIndex: 'reference_id',
      key: 'reference_id',
      width: 140,
      render: (id: string) => (
        <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{id}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'form_type',
      key: 'form_type',
      width: 150,
      render: (type: string) => {
        const formType = formTypes.find(f => f.value === type);
        return <Tag color={formType?.color}>{formType?.label || type}</Tag>;
      },
    },
    {
      title: 'Requester',
      key: 'requester',
      width: 180,
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.requester.name}</div>
          <div style={{ fontSize: 12, color: '#8A8A8A' }}>
            {record.requester.department}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (amount: number) => amount ? (
        <span style={{ fontWeight: 500 }}>Rp {amount.toLocaleString()}</span>
      ) : '-',
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>Level {record.current_level}/{record.total_levels}</span>
          </div>
          <div style={{
            height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden'
          }}>
            <div style={{
              width: `${(record.current_level / record.total_levels) * 100}%`,
              height: '100%',
              background: record.status === 'REJECTED' ? '#ff4d4f' :
                         record.status === 'APPROVED' ? '#52c41a' : '#1890ff',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
          PENDING: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
          APPROVED: { color: 'success', icon: <CheckCircleOutlined />, label: 'Approved' },
          REJECTED: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' },
        };
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {config[status]?.label}
          </Tag>
        );
      },
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      width: 100,
      render: (date: string) => date.split(' ')[0],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setDetailDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => {
                    setSelectedRequest(record);
                    setActionType('approve');
                    setActionNote('');
                    setActionModalVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  style={{ color: '#ff4d4f' }}
                  onClick={() => {
                    setSelectedRequest(record);
                    setActionType('reject');
                    setActionNote('');
                    setActionModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Approval Requests</h1>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          View and manage approval requests across all configured workflows
        </p>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Requests" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              styles={{ content: { color: '#faad14' } }}
              suffix={<Badge status="warning" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              styles={{ content: { color: '#52c41a' } }}
              suffix={<Badge status="success" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              styles={{ content: { color: '#ff4d4f' } }}
              suffix={<Badge status="error" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="Search by Request ID or Requester..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Status"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="APPROVED">Approved</Select.Option>
            <Select.Option value="REJECTED">Rejected</Select.Option>
          </Select>
          <Select
            placeholder="Form Type"
            style={{ width: 180 }}
            value={formTypeFilter}
            onChange={setFormTypeFilter}
            allowClear
            options={formTypes}
          />
          <Button icon={<ReloadOutlined />}>Reset</Button>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No requests found"
              />
            ),
          }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <Space>
            <span>Request Details</span>
            {selectedRequest && (
              <Tag color={formTypes.find(f => f.value === selectedRequest.form_type)?.color}>
                {selectedRequest.reference_id}
              </Tag>
            )}
          </Space>
        }
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        extra={
          selectedRequest?.status === 'PENDING' && (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setActionType('approve');
                  setDetailDrawerVisible(false);
                  setActionModalVisible(true);
                }}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setActionType('reject');
                  setDetailDrawerVisible(false);
                  setActionModalVisible(true);
                }}
              >
                Reject
              </Button>
            </Space>
          )
        }
      >
        {selectedRequest && (
          <>
            <Descriptions column={2} bordered size="small" title="Request Info">
              <Descriptions.Item label="Request ID" span={2}>
                <code>{selectedRequest.reference_id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Form Type">
                <Tag color={formTypes.find(f => f.value === selectedRequest.form_type)?.color}>
                  {formTypes.find(f => f.value === selectedRequest.form_type)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={
                  selectedRequest.status === 'PENDING' ? 'warning' :
                  selectedRequest.status === 'APPROVED' ? 'success' : 'error'
                }>
                  {selectedRequest.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Requester">
                {selectedRequest.requester.name}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedRequest.department}
              </Descriptions.Item>
              <Descriptions.Item label="Amount" span={2}>
                {selectedRequest.amount ? `Rp ${selectedRequest.amount.toLocaleString()}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {selectedRequest.submitted_at}
              </Descriptions.Item>
              <Descriptions.Item label="Current Level">
                Level {selectedRequest.current_level} / {selectedRequest.total_levels}
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginTop: 24, marginBottom: 12 }}>Request Data</h4>
            <Card size="small">
              {Object.entries(selectedRequest.data || {}).map(([key, value]: [string, any]) => (
                <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                  <div style={{ width: 120, fontWeight: 500, textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}:
                  </div>
                  <div style={{ flex: 1 }}>{String(value)}</div>
                </div>
              ))}
            </Card>

            <h4 style={{ marginTop: 24, marginBottom: 12 }}>Approval History</h4>
            <Timeline
              items={selectedRequest.history?.map((h: any, index: number) => ({
                color: h.status === 'COMPLETED' ? 'green' : h.status === 'REJECTED' ? 'red' : 'blue',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      Level {h.level}: {h.action}
                      {h.action === 'REJECT' && (
                        <Tag color="error" style={{ marginLeft: 8 }}>Rejected</Tag>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      By: {h.actor}
                    </div>
                    {h.note && (
                      <div style={{ fontSize: 12, fontStyle: 'italic', color: '#999' }}>
                        "{h.note}"
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#999' }}>
                      {h.time}
                    </div>
                  </div>
                ),
              }))}
            />

            {selectedRequest.rejection_reason && (
              <>
                <h4 style={{ marginTop: 24, marginBottom: 12 }}>Rejection Reason</h4>
                <Card size="small" style={{ background: '#fff2f0', borderColor: '#ffccc7' }}>
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>{selectedRequest.rejection_reason}</span>
                  </Space>
                </Card>
              </>
            )}
          </>
        )}
      </Drawer>

      {/* Action Modal */}
      <Modal
        title={
          <Space>
            {actionType === 'approve' ? (
              <>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Approve Request</span>
              </>
            ) : (
              <>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Reject Request</span>
              </>
            )}
          </Space>
        }
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        onOk={() => {
          if (actionType === 'approve') {
            setRequests(requests.map(r =>
              r.id === selectedRequest.id
                ? { ...r, status: 'APPROVED', completed_at: new Date().toISOString() } as any
                : r
            ));
            message.success('Request approved successfully');
          } else {
            setRequests(requests.map(r =>
              r.id === selectedRequest.id
                ? { ...r, status: 'REJECTED', rejected_at: new Date().toISOString(), rejection_reason: actionNote } as any
                : r
            ));
            message.success('Request rejected');
          }
          setActionModalVisible(false);
        }}
        okText={actionType === 'approve' ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: actionType === 'reject' }}
      >
        {selectedRequest && (
          <div>
            <p>
              You are about to <strong>{actionType}</strong> request{' '}
              <code>{selectedRequest.reference_id}</code> from{' '}
              <strong>{selectedRequest.requester.name}</strong>.
            </p>
            <Form layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item label="Note / Reason" required={actionType === 'reject'}>
                <Input.TextArea
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add approval note (optional)'
                      : 'Please provide rejection reason'
                  }
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
