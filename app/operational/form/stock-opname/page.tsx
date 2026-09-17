'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import {
  Typography, Button, Input, Select, Table, Space, Tag, Modal, Drawer,
  Form, DatePicker, InputNumber, message, Popconfirm, Empty, Statistic, Card, Row, Col, Divider, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined, SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// Components
import ProductSelector, { ProductItem } from '@/components/operational/ProductSelector';
import ApprovalModal from '@/components/operational/ApprovalModal';
import AuditTrail, { AuditEntry } from '@/components/operational/AuditTrail';

// API Service
import stockOpnameService, {
  StockOpnameDetail,
  StockOpnameHeader,
  StockOpnameDetailResponse,
  StockOpnameCreate,
  StockOpnameFilter
} from '@/services/operational/stock-opname';

const { Title, Text } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Use API or mock based on environment
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';

// Types - use service types
interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  branch_type: string;
}

// Extend StockOpname type for local state
interface StockOpname extends StockOpnameHeader {
  details?: StockOpnameDetail[];
}

// Mock data for development

// Mock data
const MOCK_OPNAMES: StockOpname[] = [
  {
    id: 1,
    branch_id: 1,
    branch_code: 'KC-CPT',
    branch_name: 'Kopi Calf Cipete',
    branch_type: 'OUTLET',
    opname_date: '2026-09-15',
    period_month: '2026-09',
    period_type: 'monthly',
    status: 'approved',
    total_value: 125000,
    item_count: 12,
    approved_by: 'Admin',
    approved_at: '2026-09-16T10:00:00Z',
    notes: 'Stock opname bulanan reguler'
  },
  {
    id: 2,
    branch_id: 2,
    branch_code: 'KC-BDG',
    branch_name: 'Kopi Calf Bandung',
    branch_type: 'OUTLET',
    opname_date: '2026-09-10',
    period_month: '2026-09',
    period_type: 'weekly',
    status: 'submitted',
    total_value: -45000,
    item_count: 8,
    notes: 'Variance pada packaging materials'
  },
  {
    id: 3,
    branch_id: 3,
    branch_code: 'KC-SBY',
    branch_name: 'Kopi Calf Surabaya',
    branch_type: 'OUTLET',
    opname_date: '2026-09-05',
    period_month: '2026-09',
    period_type: 'daily_packaging',
    status: 'draft',
    total_value: 0,
    item_count: 5
  }
];

const MOCK_BRANCHES: Branch[] = [
  { id: 1, branch_code: 'KC-CPT', branch_name: 'Kopi Calf Cipete', branch_type: 'OUTLET' },
  { id: 2, branch_code: 'KC-BDG', branch_name: 'Kopi Calf Bandung', branch_type: 'OUTLET' },
  { id: 3, branch_code: 'KC-SBY', branch_name: 'Kopi Calf Surabaya', branch_type: 'OUTLET' },
  { id: 4, branch_code: 'HUB-WH', branch_name: 'Hub Warehouse', branch_type: 'HUB WH' },
  { id: 5, branch_code: 'HUB-CK', branch_name: 'Hub Center Kitchen', branch_type: 'HUB CK' }
];

const PERIOD_TYPES = [
  { value: 'daily_packaging', label: 'Daily Packaging' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    draft: { color: '#8A8A8A', bg: '#F5F5F5', icon: <ClockCircleOutlined />, label: 'Draft' },
    submitted: { color: '#1890FF', bg: '#E6F7FF', icon: <FileTextOutlined />, label: 'Submitted' },
    approved: { color: '#52C41A', bg: '#ECFDF5', icon: <CheckCircleOutlined />, label: 'Approved' },
    rejected: { color: '#FF4D4F', bg: '#FFF1F0', icon: <CloseCircleOutlined />, label: 'Rejected' }
  };
  const c = config[status] || config.draft;
  return (
    <Tag
      icon={c.icon}
      style={{ color: c.color, background: c.bg, border: 'none', fontWeight: 500, borderRadius: 12, padding: '4px 12px' }}
    >
      {c.label}
    </Tag>
  );
}

// Summary Stats Component
function SummaryStats({ data }: { data: { total: number; draft: number; submitted: number; approved: number; rejected: number } }) {
  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={4}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Total</Text>} value={data.total} valueStyle={{ fontSize: 20, fontWeight: 600 }} />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Draft</Text>} value={data.draft} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#8A8A8A' }} />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Submitted</Text>} value={data.submitted} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#1890FF' }} />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Approved</Text>} value={data.approved} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#52C41A' }} />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Rejected</Text>} value={data.rejected} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#FF4D4F' }} />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Statistic
            title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Total Variance</Text>}
            value={data.draft + data.submitted}
            suffix={<Text style={{ fontSize: 12 }}>pending</Text>}
            valueStyle={{ fontSize: 20, fontWeight: 600, color: '#FAAD14' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default function StockOpnamePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);
  const [editingOpname, setEditingOpname] = useState<StockOpname | null>(null);
  const [details, setDetails] = useState<StockOpnameDetail[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [branchFilter, setBranchFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();

  // Modal states
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  // Summary stats
  const summaryStats = {
    total: opnames.length,
    draft: opnames.filter(o => o.status === 'draft').length,
    submitted: opnames.filter(o => o.status === 'submitted').length,
    approved: opnames.filter(o => o.status === 'approved').length,
    rejected: opnames.filter(o => o.status === 'rejected').length
  };

  // Fetch data from API
  const fetchOpnames = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: StockOpnameFilter = {
          page: page,
          page_size: pageSize,
          branch_id: branchFilter,
          status: statusFilter,
          date_from: search ? undefined : undefined,
        };
        const data = await stockOpnameService.getList(filter);
        setOpnames(data);
      } else {
        // Use mock data
        setOpnames(MOCK_OPNAMES);
      }
    } catch (error) {
      console.error('Failed to fetch stock opnames:', error);
      message.error('Gagal mengambil data Stock Opname');
      // Fallback to mock data
      setOpnames(MOCK_OPNAMES);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, branchFilter, statusFilter, search]);

  useEffect(() => {
    fetchOpnames();
  }, [fetchOpnames]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (USE_API) {
        try {
          const response = await fetch(`${API_BASE}/branches`);
          if (response.ok) {
            const data = await response.json();
            setBranches(data);
          }
        } catch (error) {
          console.error('Failed to fetch branches:', error);
        }
      }
    };
    fetchBranches();
  }, []);

  const filteredOpnames = opnames.filter(o => {
    const matchSearch = !search ||
      o.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.branch_code?.toLowerCase().includes(search.toLowerCase()) ||
      o.period_month.includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    const matchBranch = !branchFilter || o.branch_id === branchFilter;
    return matchSearch && matchStatus && matchBranch;
  });

  const handleView = async (record: StockOpname) => {
    setSelectedOpname(record);
    setDetailOpen(true);

    if (USE_API) {
      try {
        const data = await stockOpnameService.getDetail(record.id);
        setSelectedOpname({ ...record, ...data });
        setDetails(data.details || []);
      } catch (error) {
        console.error('Failed to fetch details:', error);
        message.error('Gagal mengambil detail Stock Opname');
      }
    }
  };

  const handleEdit = (record: StockOpname) => {
    if (record.status !== 'draft' && record.status !== 'rejected') {
      message.warning('Hanya data dengan status Draft atau Rejected yang dapat diedit');
      return;
    }
    setEditingOpname(record);
    form.setFieldsValue({
      branch_id: record.branch_id,
      opname_date: dayjs(record.opname_date),
      period_month: record.period_month,
      period_type: record.period_type || 'monthly',
      notes: record.notes
    });

    // Load details if available
    if (record.details) {
      setDetails(record.details);
    }

    setDrawerOpen(true);
  };

  const handleDelete = async (record: StockOpname) => {
    if (record.status !== 'draft' && record.status !== 'rejected') {
      message.warning('Hanya data dengan status Draft atau Rejected yang dapat dihapus');
      return;
    }

    try {
      if (USE_API) {
        await stockOpnameService.remove(record.id);
      }
      setOpnames(opnames.filter(o => o.id !== record.id));
      message.success('Stock Opname berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete:', error);
      message.error('Gagal menghapus Stock Opname');
    }
  };

  const handleAddNew = () => {
    setEditingOpname(null);
    form.resetFields();
    setDetails([]);
    setDrawerOpen(true);
  };

  const handleSubmit = async (record: StockOpname) => {
    setSubmitting(true);
    try {
      if (USE_API) {
        await stockOpnameService.submit(record.id);
      }
      setOpnames(opnames.map(o =>
        o.id === record.id ? { ...o, status: 'submitted' as const } : o
      ));
      message.success('Stock Opname berhasil disubmit');
    } catch (error) {
      console.error('Failed to submit:', error);
      message.error('Gagal submit Stock Opname');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (record: StockOpname, approved: boolean) => {
    setSubmitting(true);
    try {
      if (USE_API) {
        await stockOpnameService.approve(record.id, approved);
      }
      setOpnames(opnames.map(o =>
        o.id === record.id ? {
          ...o,
          status: approved ? 'approved' : 'rejected',
          approved_by: 'Current User',
          approved_at: new Date().toISOString()
        } : o
      ));
      message.success(`Stock Opname berhasil ${approved ? 'disetujui' : 'ditolak'}`);
      setDetailOpen(false);
    } catch (error) {
      console.error('Failed to approve:', error);
      message.error('Gagal approval Stock Opname');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrawerSave = async () => {
    try {
      const values = await form.validateFields();

      const opnameData: StockOpnameCreate = {
        branch_id: values.branch_id,
        opname_date: values.opname_date.format('YYYY-MM-DD'),
        period_month: values.period_month,
        period_type: values.period_type,
        notes: values.notes,
        details: details.map(d => ({
          product_id: d.product_id,
          system_qty: d.system_qty,
          counted_qty: d.counted_qty,
          unit_cost: d.unit_cost,
          notes: d.notes
        }))
      };

      if (editingOpname) {
        // Update existing
        if (USE_API) {
          await stockOpnameService.update(editingOpname.id, opnameData);
        }
        setOpnames(opnames.map(o =>
          o.id === editingOpname.id ? {
            ...o,
            ...values,
            opname_date: values.opname_date.format('YYYY-MM-DD'),
            period_month: values.period_month,
            item_count: details.length,
            total_value: details.reduce((acc, d) => acc + (d.variance_value || 0), 0)
          } : o
        ));
        message.success('Stock Opname berhasil diupdate');
      } else {
        // Create new
        if (USE_API) {
          const result = await stockOpnameService.create(opnameData);
          setOpnames([result as StockOpname, ...opnames]);
        } else {
          const newOpname: StockOpname = {
            id: Math.max(...opnames.map(o => o.id), 0) + 1,
            branch_id: values.branch_id,
            branch_code: branches.find(b => b.id === values.branch_id)?.branch_code,
            branch_name: branches.find(b => b.id === values.branch_id)?.branch_name,
            opname_date: values.opname_date.format('YYYY-MM-DD'),
            period_month: values.period_month,
            period_type: values.period_type,
            status: 'draft',
            total_value: details.reduce((acc, d) => acc + (d.variance_value || 0), 0),
            item_count: details.length,
            notes: values.notes
          };
          setOpnames([newOpname, ...opnames]);
        }
        message.success('Stock Opname berhasil dibuat');
      }
      setDrawerOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
      message.error('Gagal menyimpan Stock Opname');
    }
  };

  const handleAddDetail = () => {
    detailForm.validateFields().then(values => {
      const newDetail: StockOpnameDetail = {
        product_id: Date.now(),
        product_code: values.product_code,
        product_name: values.product_name,
        system_qty: values.system_qty || 0,
        counted_qty: values.counted_qty || 0,
        unit_cost: values.unit_cost || 0,
        notes: values.notes
      };
      newDetail.variance_qty = newDetail.counted_qty - newDetail.system_qty;
      newDetail.variance_value = newDetail.variance_qty * newDetail.unit_cost;
      setDetails([...details, newDetail]);
      detailForm.resetFields();
      message.success('Item berhasil ditambahkan');
    });
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Product Selector Handler
  const handleOpenProductSelector = () => {
    const branchId = form.getFieldValue('branch_id');
    if (!branchId) {
      message.warning('Pilih Branch terlebih dahulu');
      return;
    }
    setProductSelectorOpen(true);
  };

  const handleSelectProduct = (product: ProductItem) => {
    const newDetail: StockOpnameDetail = {
      product_id: product.product_id,
      product_code: product.product_code,
      product_name: product.product_name,
      uom_name: product.uom_name,
      system_qty: product.current_qty || 0,
      counted_qty: 0,
      unit_cost: product.unit_cost || 0,
    };
    newDetail.variance_qty = 0;
    newDetail.variance_value = 0;
    setDetails([...details, newDetail]);
    message.success(`Produk ${product.product_name} ditambahkan`);
  };

  // Approval Handlers
  const handleOpenApproval = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setApprovalModalOpen(true);
  };

  const handleApprovalConfirm = (notes?: string) => {
    if (selectedOpname) {
      setOpnames(opnames.map(o =>
        o.id === selectedOpname.id ? {
          ...o,
          status: approvalAction === 'approve' ? 'approved' : 'rejected',
          approved_by: 'Current User',
          approved_at: new Date().toISOString()
        } : o
      ));
      message.success(`Stock Opname berhasil ${approvalAction === 'approve' ? 'disetujui' : 'ditolak'}`);
    }
    setApprovalModalOpen(false);
    setDetailOpen(false);
  };

  const handleRejectReason = (reason: string) => {
    if (selectedOpname) {
      setOpnames(opnames.map(o =>
        o.id === selectedOpname.id ? {
          ...o,
          status: 'rejected' as const,
          approved_by: 'Current User',
          approved_at: new Date().toISOString(),
          notes: o.notes ? `${o.notes}\n[Rejected: ${reason}]` : `[Rejected: ${reason}]`
        } : o
      ));
      message.success('Stock Opname berhasil ditolak');
    }
    setApprovalModalOpen(false);
    setDetailOpen(false);
  };

  // Print Handler
  const handlePrint = useCallback((record: StockOpname) => {
    const printContent = `
      <h1>Stock Opname Report</h1>
      <p><strong>Branch:</strong> ${record.branch_name} (${record.branch_code})</p>
      <p><strong>Date:</strong> ${dayjs(record.opname_date).format('DD MMMM YYYY')}</p>
      <p><strong>Period:</strong> ${record.period_month}</p>
      <p><strong>Status:</strong> ${record.status.toUpperCase()}</p>
      <hr/>
      <p><strong>Total Variance:</strong> Rp ${record.total_value.toLocaleString('id-ID')}</p>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }, []);

  const columns: ColumnsType<StockOpname> = [
    {
      title: 'Branch',
      dataIndex: 'branch_name',
      key: 'branch_name',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.branch_code} • {record.branch_type}</Text>
        </div>
      )
    },
    {
      title: 'Tanggal',
      dataIndex: 'opname_date',
      key: 'opname_date',
      width: 110,
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Periode',
      dataIndex: 'period_month',
      key: 'period_month',
      width: 100
    },
    {
      title: 'Tipe',
      dataIndex: 'period_type',
      key: 'period_type',
      width: 120,
      render: (type) => {
        const labels: Record<string, string> = {
          daily_packaging: 'Daily Packaging',
          weekly: 'Weekly',
          monthly: 'Monthly'
        };
        return labels[type] || type;
      }
    },
    {
      title: 'Items',
      dataIndex: 'item_count',
      key: 'item_count',
      width: 80,
      align: 'center'
    },
    {
      title: 'Variance',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text style={{ color: value > 0 ? '#52C41A' : value < 0 ? '#FF4D4F' : '#333', fontWeight: 600 }}>
          {value > 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
            title="Print"
          />
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {record.status === 'draft' && (
            <Button
              type="text"
              size="small"
              onClick={() => handleSubmit(record)}
              style={{ color: '#1890FF' }}
            >
              Submit
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Popconfirm
              title="Hapus Stock Opname ini?"
              onConfirm={() => handleDelete(record)}
              okText="Ya"
              cancelText="Batal"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const detailColumns: ColumnsType<StockOpnameDetail> = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 120
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name'
    },
    {
      title: 'System Qty',
      dataIndex: 'system_qty',
      key: 'system_qty',
      width: 100,
      align: 'right'
    },
    {
      title: 'Counted Qty',
      dataIndex: 'counted_qty',
      key: 'counted_qty',
      width: 100,
      align: 'right'
    },
    {
      title: 'Variance',
      dataIndex: 'variance_qty',
      key: 'variance_qty',
      width: 100,
      align: 'right',
      render: (val) => (
        <Text style={{ color: val > 0 ? '#52C41A' : val < 0 ? '#FF4D4F' : '#333', fontWeight: 600 }}>
          {val > 0 ? '+' : ''}{val}
        </Text>
      )
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      width: 100,
      align: 'right',
      render: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
    },
    {
      title: 'Variance Value',
      dataIndex: 'variance_value',
      key: 'variance_value',
      width: 120,
      align: 'right',
      render: (val) => (
        <Text style={{ color: val > 0 ? '#52C41A' : val < 0 ? '#FF4D4F' : '#333', fontWeight: 600 }}>
          {val > 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)}
        </Text>
      )
    }
  ];

  return (
    <Layout>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
            Stock Opname
          </Title>
          <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
            Formulir penghitungan fisik stok barang
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8 }}>
          Tambah Stock Opname
        </Button>
      </div>

      <SummaryStats data={summaryStats} />

      <div style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        padding: 16
      }}>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Cari branch..."
            onSearch={(val) => setSearch(val)}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="submitted">Submitted</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
          <Select
            placeholder="Filter Branch"
            value={branchFilter}
            onChange={setBranchFilter}
            style={{ width: 200 }}
            allowClear
          >
            {branches.map(b => (
              <Select.Option key={b.id} value={b.id}>{b.branch_name}</Select.Option>
            ))}
          </Select>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredOpnames}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: filteredOpnames.length,
            onChange: setPage,
            showSizeChanger: false
          }}
          locale={{ emptyText: <Empty description="Tidak ada data Stock Opname" /> }}
        />
      </div>

      {/* Create/Edit Drawer */}
      <Drawer
        title={editingOpname ? 'Edit Stock Opname' : 'Tambah Stock Opname'}
        placement="right"
        width={600}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Batal</Button>
            <Button type="primary" onClick={handleDrawerSave}>
              {editingOpname ? 'Update' : 'Simpan'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="branch_id"
            label="Branch"
            rules={[{ required: true, message: 'Branch wajib dipilih' }]}
          >
            <Select placeholder="Pilih Branch" size="large">
              {branches.map(b => (
                <Select.Option key={b.id} value={b.id}>
                  {b.branch_name} ({b.branch_code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="opname_date"
            label="Tanggal Opname"
            rules={[{ required: true, message: 'Tanggal wajib diisi' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="period_month"
            label="Periode Bulan"
            rules={[{ required: true, message: 'Periode wajib diisi' }]}
          >
            <Input placeholder="YYYY-MM (contoh: 2026-09)" size="large" />
          </Form.Item>

          <Form.Item
            name="period_type"
            label="Tipe Opname"
            rules={[{ required: true, message: 'Tipe wajib dipilih' }]}
          >
            <Select placeholder="Pilih Tipe" size="large">
              {PERIOD_TYPES.map(p => (
                <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea rows={2} placeholder="Catatan tambahan (opsional)" />
          </Form.Item>

          {/* Items Section */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong style={{ fontSize: 14 }}>
                Item Opname ({details.length})
              </Text>
              <Button
                icon={<SearchOutlined />}
                onClick={handleOpenProductSelector}
              >
                Pilih dari Product List
              </Button>
            </div>

            {/* Variance Summary */}
            {details.length > 0 && (
              <div style={{ background: '#F0F5FF', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title={<Text style={{ fontSize: 11 }}>Total Items</Text>}
                      value={details.length}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<Text style={{ fontSize: 11 }}>Total Variance Qty</Text>}
                      value={details.reduce((acc, d) => acc + (d.variance_qty || 0), 0)}
                      valueStyle={{ fontSize: 16, color: '#FAAD14' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<Text style={{ fontSize: 11 }}>Total Variance Value</Text>}
                      value={details.reduce((acc, d) => acc + (d.variance_value || 0), 0)}
                      precision={0}
                      prefix="Rp"
                      valueStyle={{ fontSize: 16, color: details.reduce((acc, d) => acc + (d.variance_value || 0), 0) > 0 ? '#52C41A' : details.reduce((acc, d) => acc + (d.variance_value || 0), 0) < 0 ? '#FF4D4F' : '#333' }}
                    />
                  </Col>
                </Row>
              </div>
            )}

            {/* Add Item Form */}
            <div style={{ background: '#F7F7F7', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Form form={detailForm} layout="inline" size="small">
                <Form.Item name="product_code" label="Kode" rules={[{ required: true }]} style={{ width: 100 }}>
                  <Input placeholder="Kode" />
                </Form.Item>
                <Form.Item name="product_name" label="Nama" rules={[{ required: true }]} style={{ flex: 1 }}>
                  <Input placeholder="Nama Produk" />
                </Form.Item>
                <Form.Item name="system_qty" label="System" style={{ width: 80 }}>
                  <InputNumber min={0} placeholder="Qty" />
                </Form.Item>
                <Form.Item name="counted_qty" label="Counted" style={{ width: 80 }}>
                  <InputNumber min={0} placeholder="Qty" />
                </Form.Item>
                <Form.Item name="unit_cost" label="Cost" style={{ width: 90 }}>
                  <InputNumber min={0} placeholder="Cost" />
                </Form.Item>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDetail}>
                  Add
                </Button>
              </Form>
            </div>

            {/* Items Table */}
            {details.length > 0 ? (
              <Table
                columns={[
                  ...detailColumns,
                  {
                    title: '',
                    key: 'action',
                    width: 60,
                    render: (_, __, index) => (
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleRemoveDetail(index)}
                      >
                        Remove
                      </Button>
                    )
                  }
                ]}
                dataSource={details.map((d, i) => ({ ...d, key: i }))}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Belum ada item ditambahkan" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        title="Detail Stock Opname"
        placement="right"
        width={700}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          selectedOpname?.status === 'submitted' && (
            <Space>
              <Button danger onClick={() => handleOpenApproval('reject')}>
                Tolak
              </Button>
              <Button type="primary" onClick={() => handleOpenApproval('approve')}>
                Setujui
              </Button>
            </Space>
          )
        }
      >
        {selectedOpname && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Branch</Text>
                  <br />
                  <Text strong>{selectedOpname.branch_name}</Text>
                  <br />
                  <Text type="secondary">{selectedOpname.branch_code} • {selectedOpname.branch_type}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tanggal</Text>
                  <br />
                  <Text strong>{dayjs(selectedOpname.opname_date).format('DD MMMM YYYY')}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Text type="secondary">Periode</Text>
                  <br />
                  <Text strong>{selectedOpname.period_month}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Tipe</Text>
                  <br />
                  <Text strong>{selectedOpname.period_type}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Status</Text>
                  <br />
                  <StatusBadge status={selectedOpname.status} />
                </Col>
              </Row>
              {selectedOpname.notes && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Catatan</Text>
                  <br />
                  <Text>{selectedOpname.notes}</Text>
                </div>
              )}
            </div>

            <Table
              columns={detailColumns}
              dataSource={details.length > 0 ? details : [
                { id: 1, product_id: 1, product_code: 'PKG001', product_name: 'Cup Gajah 12oz', system_qty: 100, counted_qty: 95, variance_qty: -5, unit_cost: 2500, variance_value: -12500 },
                { id: 2, product_id: 2, product_code: 'PKG002', product_name: 'Cup Gajah 16oz', system_qty: 80, counted_qty: 82, variance_qty: 2, unit_cost: 3000, variance_value: 6000 }
              ].map((d, i) => ({ ...d, key: i }))}
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />

            <div style={{ marginTop: 16, padding: 12, background: '#F7F7F7', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Items"
                    value={details.length || 2}
                    valueStyle={{ fontSize: 18 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Variance Qty"
                    value={details.reduce((acc, d) => acc + (d.variance_qty || 0), 0) || -3}
                    valueStyle={{ fontSize: 18, color: '#FAAD14' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Variance Value"
                    value={details.reduce((acc, d) => acc + (d.variance_value || 0), 0) || selectedOpname.total_value}
                    precision={0}
                    prefix="Rp"
                    valueStyle={{ fontSize: 18, color: selectedOpname.total_value > 0 ? '#52C41A' : '#FF4D4F' }}
                  />
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Audit Trail */}
            <AuditTrail
              entries={[
                {
                  id: 1,
                  action: 'created',
                  performed_by: selectedOpname.created_by || 'System',
                  performed_at: selectedOpname.created_at || new Date().toISOString()
                },
                ...(selectedOpname.status !== 'draft' ? [{
                  id: 2,
                  action: 'submitted' as const,
                  performed_by: selectedOpname.submitted_by || 'PIC',
                  performed_at: selectedOpname.submitted_at || new Date().toISOString()
                }] : []),
                ...(selectedOpname.status === 'approved' || selectedOpname.status === 'rejected' ? [{
                  id: 3,
                  action: selectedOpname.status as 'approved' | 'rejected',
                  performed_by: selectedOpname.approved_by || 'Manager',
                  performed_at: selectedOpname.approved_at || new Date().toISOString()
                }] : [])
              ]}
            />
          </>
        )}
      </Drawer>

      {/* Product Selector Modal */}
      <ProductSelector
        open={productSelectorOpen}
        onClose={() => setProductSelectorOpen(false)}
        onSelect={handleSelectProduct}
        branchId={form.getFieldValue('branch_id')}
        showStock={true}
        showCost={true}
        selectedProducts={details.map(d => d.product_id)}
      />

      {/* Approval Modal */}
      <ApprovalModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onApprove={handleApprovalConfirm}
        onReject={handleRejectReason}
        title="Approval Stock Opname"
        itemName={selectedOpname?.branch_name}
        itemValue={selectedOpname?.total_value}
        loading={submitting}
      />
    </Layout>
  );
}
