'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import {
  Typography, Button, Input, Select, Table, Space, Tag, Modal, Drawer,
  Form, DatePicker, InputNumber, message, Popconfirm, Empty, Statistic, Card, Row, Col, Divider, Upload, Image
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined, WarningOutlined, SearchOutlined, UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// Components
import ProductSelector, { ProductItem } from '@/components/operational/ProductSelector';
import ApprovalModal from '@/components/operational/ApprovalModal';
import AuditTrail from '@/components/operational/AuditTrail';
import PhotoUpload from '@/components/operational/PhotoUpload';

// API Service
import wasteService, {
  WasteDetail,
  WasteHeader,
  WasteDetailResponse,
  WasteCreate,
  WasteFilter
} from '@/services/operational/waste-form';

const { Title, Text } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Use API or mock based on environment
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';

// Types - extend service types
interface WasteForm extends WasteHeader {
  details?: WasteDetail[];
}

// Types
interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  branch_type: string;
}

// Mock data
const MOCK_WASTE: WasteForm[] = [
  {
    id: 1,
    branch_id: 1,
    branch_code: 'KC-CPT',
    branch_name: 'Kopi Calf Cipete',
    branch_type: 'OUTLET',
    waste_date: '2026-09-15',
    waste_type: 'damaged',
    status: 'approved',
    total_value: 125000,
    total_items: 3,
    approved_by: 'Admin',
    approved_at: '2026-09-16T10:00:00Z',
    notes: 'Barang rusak saat pengiriman'
  },
  {
    id: 2,
    branch_id: 2,
    branch_code: 'KC-BDG',
    branch_name: 'Kopi Calf Bandung',
    branch_type: 'OUTLET',
    waste_date: '2026-09-10',
    waste_type: 'expired',
    status: 'submitted',
    total_value: 450000,
    total_items: 8,
    notes: 'Produk melewati tanggal kadaluarsa'
  },
  {
    id: 3,
    branch_id: 3,
    branch_code: 'KC-SBY',
    branch_name: 'Kopi Calf Surabaya',
    branch_type: 'OUTLET',
    waste_date: '2026-09-05',
    waste_type: 'lost',
    status: 'draft',
    total_value: 75000,
    total_items: 2,
    notes: 'Barang hilang saat stock opname'
  },
  {
    id: 4,
    branch_id: 1,
    branch_code: 'KC-CPT',
    branch_name: 'Kopi Calf Cipete',
    branch_type: 'OUTLET',
    waste_date: '2026-09-01',
    waste_type: 'damaged',
    status: 'rejected',
    total_value: 25000,
    total_items: 1,
    notes: 'Tidak ada foto dokumentasi'
  }
];

const MOCK_BRANCHES: Branch[] = [
  { id: 1, branch_code: 'KC-CPT', branch_name: 'Kopi Calf Cipete', branch_type: 'OUTLET' },
  { id: 2, branch_code: 'KC-BDG', branch_name: 'Kopi Calf Bandung', branch_type: 'OUTLET' },
  { id: 3, branch_code: 'KC-SBY', branch_name: 'Kopi Calf Surabaya', branch_type: 'OUTLET' },
  { id: 4, branch_code: 'HUB-WH', branch_name: 'Hub Warehouse', branch_type: 'HUB WH' },
  { id: 5, branch_code: 'HUB-CK', branch_name: 'Hub Center Kitchen', branch_type: 'HUB CK' }
];

const WASTE_TYPES = [
  { value: 'damaged', label: 'Rusak (Damaged)' },
  { value: 'expired', label: 'Kadaluarsa (Expired)' },
  { value: 'lost', label: 'Hilang (Lost/Missing)' },
  { value: 'contaminated', label: 'Kontaminasi (Contaminated)' },
  { value: 'other', label: 'Lainnya (Other)' }
];

const WASTE_REASONS: Record<string, string[]> = {
  damaged: ['Mishandling', 'Packaging Rusak', 'Produksi Cacat', 'Kerusakan Transport', 'Lainnya'],
  expired: ['Melewati Expired Date', 'Mendekati Expired Date', 'Sisa Batch Lama', 'Lainnya'],
  lost: ['Tidak Ditemukan Saat Opname', 'Pencurian', 'Error System', 'Lainnya'],
  contaminated: ['Kontaminasi Mikroba', 'Kontaminasi Kimia', 'Kontaminasi Fisik', 'Lainnya'],
  other: ['Quality Control', 'Produk Recall', 'Menu Discontinue', 'Lainnya']
};

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

// Waste Type Badge
function WasteTypeBadge({ type }: { type: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    damaged: { color: '#FF4D4F', bg: '#FFF1F0', label: 'Damaged' },
    expired: { color: '#FAAD14', bg: '#FFFBE6', label: 'Expired' },
    lost: { color: '#8A8A8A', bg: '#F5F5F5', label: 'Lost' },
    contaminated: { color: '#722ED1', bg: '#F9F0FF', label: 'Contaminated' },
    other: { color: '#1890FF', bg: '#E6F7FF', label: 'Other' }
  };
  const c = config[type] || config.other;
  return (
    <Tag style={{ color: c.color, background: c.bg, border: 'none', fontWeight: 500, borderRadius: 12, padding: '4px 12px' }}>
      {c.label}
    </Tag>
  );
}

// Summary Stats Component
function SummaryStats({ data }: { data: { total: number; draft: number; submitted: number; approved: number; rejected: number; totalValue: number } }) {
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
            title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Total Value</Text>}
            value={data.totalValue}
            precision={0}
            prefix="Rp"
            valueStyle={{ fontSize: 20, fontWeight: 600, color: '#FF4D4F' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default function WasteFormPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wastes, setWastes] = useState<WasteForm[]>([]);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<WasteForm | null>(null);
  const [editingWaste, setEditingWaste] = useState<WasteForm | null>(null);
  const [details, setDetails] = useState<WasteDetail[]>([]);
  const [itemPhotos, setItemPhotos] = useState<Record<number, string[]>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string | undefined>();
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
    total: wastes.length,
    draft: wastes.filter(w => w.status === 'draft').length,
    submitted: wastes.filter(w => w.status === 'submitted').length,
    approved: wastes.filter(w => w.status === 'approved').length,
    rejected: wastes.filter(w => w.status === 'rejected').length,
    totalValue: wastes.reduce((acc, w) => acc + w.total_value, 0)
  };

  // Fetch data from API
  const fetchWastes = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_API) {
        const filter: WasteFilter = {
          page: page,
          page_size: pageSize,
          branch_id: branchFilter,
          status: statusFilter,
          waste_type: wasteTypeFilter,
        };
        const data = await wasteService.getList(filter);
        setWastes(data);
      } else {
        // Use mock data
        setWastes(MOCK_WASTE);
      }
    } catch (error) {
      console.error('Failed to fetch waste forms:', error);
      message.error('Gagal mengambil data Waste Form');
      // Fallback to mock data
      setWastes(MOCK_WASTE);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, branchFilter, statusFilter, wasteTypeFilter]);

  useEffect(() => {
    fetchWastes();
  }, [fetchWastes]);

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

  const filteredWastes = wastes.filter(w => {
    const matchSearch = !search ||
      w.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.branch_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || w.status === statusFilter;
    const matchType = !wasteTypeFilter || w.waste_type === wasteTypeFilter;
    const matchBranch = !branchFilter || w.branch_id === branchFilter;
    return matchSearch && matchStatus && matchType && matchBranch;
  });

  const handleView = async (record: WasteForm) => {
    setSelectedWaste(record);
    setDetailOpen(true);

    if (USE_API) {
      try {
        const data = await wasteService.getDetail(record.id);
        setSelectedWaste({ ...record, ...data });
      } catch (error) {
        console.error('Failed to fetch details:', error);
        message.error('Gagal mengambil detail Waste Form');
      }
    }
  };

  const handleEdit = (record: WasteForm) => {
    if (record.status !== 'draft' && record.status !== 'rejected') {
      message.warning('Hanya data dengan status Draft atau Rejected yang dapat diedit');
      return;
    }
    setEditingWaste(record);
    form.setFieldsValue({
      branch_id: record.branch_id,
      waste_date: dayjs(record.waste_date),
      waste_type: record.waste_type,
      notes: record.notes
    });
    // Load existing details with photos
    if (record.details) {
      setDetails(record.details);
      const photos: Record<number, string[]> = {};
      record.details.forEach(d => {
        if (d.photo_urls) {
          photos[d.product_id] = d.photo_urls;
        }
      });
      setItemPhotos(photos);
    } else {
      setDetails([]);
      setItemPhotos({});
    }
    setDrawerOpen(true);
  };

  const handleDelete = async (record: WasteForm) => {
    if (record.status !== 'draft' && record.status !== 'rejected') {
      message.warning('Hanya data dengan status Draft atau Rejected yang dapat dihapus');
      return;
    }

    try {
      if (USE_API) {
        await wasteService.remove(record.id);
      }
      setWastes(wastes.filter(w => w.id !== record.id));
      message.success('Waste Form berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete:', error);
      message.error('Gagal menghapus Waste Form');
    }
  };

  const handleAddNew = () => {
    setEditingWaste(null);
    form.resetFields();
    setDetails([]);
    setItemPhotos({});
    setDrawerOpen(true);
  };

  const handleSubmit = async (record: WasteForm) => {
    setSubmitting(true);
    try {
      if (USE_API) {
        await wasteService.submit(record.id);
      }
      setWastes(wastes.map(w =>
        w.id === record.id ? { ...w, status: 'submitted' as const } : w
      ));
      message.success('Waste Form berhasil disubmit');
    } catch (error) {
      console.error('Failed to submit:', error);
      message.error('Gagal submit Waste Form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (record: WasteForm, approved: boolean) => {
    setSubmitting(true);
    try {
      if (USE_API) {
        await wasteService.approve(record.id, approved);
      }
      setWastes(wastes.map(w =>
        w.id === record.id ? {
          ...w,
          status: approved ? 'approved' : 'rejected',
          approved_by: 'Current User',
          approved_at: new Date().toISOString()
        } : w
      ));
      message.success(`Waste Form berhasil ${approved ? 'disetujui' : 'ditolak'}`);
      setDetailOpen(false);
    } catch (error) {
      console.error('Failed to approve:', error);
      message.error('Gagal approval Waste Form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrawerSave = async () => {
    try {
      const values = await form.validateFields();

      const wasteData: WasteCreate = {
        branch_id: values.branch_id,
        waste_date: values.waste_date.format('YYYY-MM-DD'),
        waste_type: values.waste_type,
        notes: values.notes,
        details: details.map((d) => ({
          product_id: d.product_id,
          product_code: d.product_code,
          qty: d.qty,
          unit_cost: d.unit_cost,
          waste_reason: d.waste_reason,
          photo_urls: itemPhotos[d.product_id] || []
        }))
      };

      if (editingWaste) {
        // Update existing
        if (USE_API) {
          await wasteService.update(editingWaste.id, wasteData);
        }
        setWastes(wastes.map(w =>
          w.id === editingWaste.id ? {
            ...w,
            ...values,
            waste_date: values.waste_date.format('YYYY-MM-DD'),
            total_items: details.length,
            total_value: details.reduce((acc, d) => acc + (d.total_cost || 0), 0),
            details: wasteData.details
          } : w
        ));
        message.success('Waste Form berhasil diupdate');
      } else {
        // Create new
        if (USE_API) {
          const result = await wasteService.create(wasteData);
          setWastes([result as WasteForm, ...wastes]);
        } else {
          const newWaste: WasteForm = {
            id: Math.max(...wastes.map(w => w.id), 0) + 1,
            branch_id: values.branch_id,
            branch_code: branches.find(b => b.id === values.branch_id)?.branch_code,
            branch_name: branches.find(b => b.id === values.branch_id)?.branch_name,
            waste_date: values.waste_date.format('YYYY-MM-DD'),
            waste_type: values.waste_type,
            status: 'draft',
            total_value: details.reduce((acc, d) => acc + (d.total_cost || 0), 0),
            total_items: details.length,
            notes: values.notes,
            details: wasteData.details
          };
          setWastes([newWaste, ...wastes]);
        }
        message.success('Waste Form berhasil dibuat');
      }
      setDrawerOpen(false);
      setItemPhotos({});
    } catch (error) {
      console.error('Failed to save:', error);
      message.error('Gagal menyimpan Waste Form');
    }
  };

  const handleAddDetail = () => {
    detailForm.validateFields().then(values => {
      const newDetail: WasteDetail = {
        product_id: Date.now(),
        product_code: values.product_code,
        product_name: values.product_name,
        qty: values.qty || 1,
        unit_cost: values.unit_cost || 0,
        waste_reason: values.waste_reason
      };
      newDetail.total_cost = newDetail.qty * newDetail.unit_cost;
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
    const newDetail: WasteDetail = {
      product_id: product.product_id,
      product_code: product.product_code,
      product_name: product.product_name,
      uom_name: product.uom_name,
      qty: 1,
      unit_cost: product.unit_cost || 0,
      total_cost: product.unit_cost || 0,
      waste_reason: ''
    };
    setDetails([...details, newDetail]);
    message.success(`Produk ${product.product_name} ditambahkan`);
  };

  // Approval Handlers
  const handleOpenApproval = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setApprovalModalOpen(true);
  };

  const handleApprovalConfirm = (notes?: string) => {
    if (selectedWaste) {
      setWastes(wastes.map(w =>
        w.id === selectedWaste.id ? {
          ...w,
          status: approvalAction === 'approve' ? 'approved' : 'rejected',
          approved_by: 'Current User',
          approved_at: new Date().toISOString()
        } : w
      ));
      message.success(`Waste Form berhasil ${approvalAction === 'approve' ? 'disetujui' : 'ditolak'}`);
    }
    setApprovalModalOpen(false);
    setDetailOpen(false);
  };

  const handleRejectReason = (reason: string) => {
    if (selectedWaste) {
      setWastes(wastes.map(w =>
        w.id === selectedWaste.id ? {
          ...w,
          status: 'rejected' as const,
          approved_by: 'Current User',
          approved_at: new Date().toISOString(),
          notes: w.notes ? `${w.notes}\n[Rejected: ${reason}]` : `[Rejected: ${reason}]`
        } : w
      ));
      message.success('Waste Form berhasil ditolak');
    }
    setApprovalModalOpen(false);
    setDetailOpen(false);
  };

  // Print Handler
  const handlePrint = useCallback((record: WasteForm) => {
    const printContent = `
      <h1>Waste Form Report</h1>
      <p><strong>Branch:</strong> ${record.branch_name} (${record.branch_code})</p>
      <p><strong>Date:</strong> ${dayjs(record.waste_date).format('DD MMMM YYYY')}</p>
      <p><strong>Waste Type:</strong> ${record.waste_type.toUpperCase()}</p>
      <p><strong>Status:</strong> ${record.status.toUpperCase()}</p>
      <hr/>
      <p><strong>Total Items:</strong> ${record.total_items}</p>
      <p><strong>Total Waste Value:</strong> Rp ${record.total_value.toLocaleString('id-ID')}</p>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }, []);

  const columns: ColumnsType<WasteForm> = [
    {
      title: 'Branch',
      dataIndex: 'branch_name',
      key: 'branch_name',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.branch_code} - {record.branch_type}</Text>
        </div>
      )
    },
    {
      title: 'Tanggal',
      dataIndex: 'waste_date',
      key: 'waste_date',
      width: 110,
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Tipe Waste',
      dataIndex: 'waste_type',
      key: 'waste_type',
      width: 130,
      render: (type) => <WasteTypeBadge type={type} />
    },
    {
      title: 'Items',
      dataIndex: 'total_items',
      key: 'total_items',
      width: 80,
      align: 'center'
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 130,
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#FF4D4F', fontWeight: 600 }}>
          -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
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
              title="Hapus Waste Form ini?"
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

  const detailColumns: ColumnsType<WasteDetail> = [
    {
      title: 'Photo',
      key: 'photo',
      width: 80,
      render: (_, record) => (
        record.photo_urls && record.photo_urls.length > 0 ? (
          <Image.PreviewGroup>
            <Image
              src={record.photo_urls[0]}
              alt="Waste"
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    },
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
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 80,
      align: 'right'
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
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 120,
      align: 'right',
      render: (val) => (
        <Text style={{ color: '#FF4D4F', fontWeight: 600 }}>
          -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)}
        </Text>
      )
    },
    {
      title: 'Waste Reason',
      dataIndex: 'waste_reason',
      key: 'waste_reason',
      width: 150
    }
  ];

  return (
    <Layout>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
            Waste Form
          </Title>
          <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
            Formulir pencatatan barang yang di-waste (rusak, kadaluarsa, hilang)
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8 }}>
          Tambah Waste Form
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
            placeholder="Filter Tipe Waste"
            value={wasteTypeFilter}
            onChange={setWasteTypeFilter}
            style={{ width: 180 }}
            allowClear
          >
            {WASTE_TYPES.map(t => (
              <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
            ))}
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
          dataSource={filteredWastes}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: filteredWastes.length,
            onChange: setPage,
            showSizeChanger: false
          }}
          locale={{ emptyText: <Empty description="Tidak ada data Waste Form" /> }}
        />
      </div>

      {/* Create/Edit Drawer */}
      <Drawer
        title={editingWaste ? 'Edit Waste Form' : 'Tambah Waste Form'}
        placement="right"
        width={650}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Batal</Button>
            <Button type="primary" onClick={handleDrawerSave}>
              {editingWaste ? 'Update' : 'Simpan'}
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
            name="waste_date"
            label="Tanggal Waste"
            rules={[{ required: true, message: 'Tanggal wajib diisi' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="waste_type"
            label="Tipe Waste"
            rules={[{ required: true, message: 'Tipe waste wajib dipilih' }]}
          >
            <Select placeholder="Pilih Tipe Waste" size="large">
              {WASTE_TYPES.map(t => (
                <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
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
                Item Waste
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total: Rp {details.reduce((acc, d) => acc + (d.total_cost || 0), 0).toLocaleString('id-ID')}
              </Text>
            </div>

            {/* Warning for certain types */}
            <div style={{
              background: '#FFFBE6',
              border: '1px solid #FAAD14',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <WarningOutlined style={{ color: '#FAAD14' }} />
              <Text style={{ fontSize: 12, color: '#8A6D3B' }}>
                Untuk tipe Expired dan Damaged, foto dokumentasi sangat disarankan sebagai bukti.
              </Text>
            </div>

            {/* Add Item Form */}
            <div style={{ background: '#F7F7F7', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Klik tombol di bawah untuk memilih produk dari daftar. Branch harus dipilih terlebih dahulu.
              </Text>
              <div style={{ marginTop: 8 }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleOpenProductSelector}
                  style={{ width: '100%' }}
                >
                  Pilih Produk dari Daftar
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {details.length > 0 ? (
              <>
                {details.map((d, i) => (
                  <div key={i} style={{ marginBottom: 12, background: '#FAFAFA', borderRadius: 8, padding: 12, border: '1px solid #E8E8E8' }}>
                    <Row gutter={12} align="middle">
                      <Col flex="none">
                        <div style={{ background: '#FFF', borderRadius: 8, padding: 8, border: '1px solid #E8E8E8' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Item {i + 1}</Text>
                          <br />
                          <Text strong style={{ fontSize: 13 }}>{d.product_code}</Text>
                          <br />
                          <Text style={{ fontSize: 12 }}>{d.product_name}</Text>
                        </div>
                      </Col>
                      <Col flex="none">
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Qty</Text>
                          <br />
                          <InputNumber
                            size="small"
                            min={1}
                            value={d.qty}
                            onChange={(val) => {
                              const newDetails = [...details];
                              newDetails[i] = { ...newDetails[i], qty: val || 1 };
                              newDetails[i].total_cost = (val || 1) * newDetails[i].unit_cost;
                              setDetails(newDetails);
                            }}
                            style={{ width: 60 }}
                          />
                        </div>
                      </Col>
                      <Col flex="none">
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Cost</Text>
                          <br />
                          <Text strong style={{ color: '#FF4D4F' }}>
                            Rp {(d.total_cost || 0).toLocaleString('id-ID')}
                          </Text>
                        </div>
                      </Col>
                      <Col flex="none">
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Alasan</Text>
                          <br />
                          <Select
                            size="small"
                            value={d.waste_reason}
                            onChange={(val) => {
                              const newDetails = [...details];
                              newDetails[i] = { ...newDetails[i], waste_reason: val };
                              setDetails(newDetails);
                            }}
                            style={{ width: 120 }}
                          >
                            {(WASTE_REASONS[form.getFieldValue('waste_type')] || WASTE_REASONS.damaged).map(r => (
                              <Select.Option key={r} value={r}>{r}</Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col flex={1}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Foto ({itemPhotos[d.product_id]?.length || 0})</Text>
                          <br />
                          <PhotoUpload
                            value={itemPhotos[d.product_id] || []}
                            onChange={(urls) => {
                              setItemPhotos({ ...itemPhotos, [d.product_id]: urls });
                              const newDetails = [...details];
                              newDetails[i] = { ...newDetails[i], photo_urls: urls };
                              setDetails(newDetails);
                            }}
                            maxCount={5}
                            wasteType={form.getFieldValue('waste_type')}
                          />
                        </div>
                      </Col>
                      <Col flex="none">
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => {
                            setDetails(details.filter((_, idx) => idx !== i));
                            const newPhotos = { ...itemPhotos };
                            delete newPhotos[d.product_id];
                            setItemPhotos(newPhotos);
                          }}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: 12, background: '#FFF1F0', borderRadius: 8, border: '1px solid #FFCCC7' }}>
                  <Row gutter={16} align="middle">
                    <Col span={12}>
                      <Statistic
                        title="Total Items"
                        value={details.length}
                        valueStyle={{ fontSize: 18 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Total Waste Value"
                        value={details.reduce((acc, d) => acc + (d.total_cost || 0), 0)}
                        precision={0}
                        prefix="Rp"
                        suffix=" (kerugian)"
                        valueStyle={{ fontSize: 20, color: '#FF4D4F', fontWeight: 700 }}
                      />
                    </Col>
                  </Row>
                </div>
              </>
            ) : (
              <Empty description="Belum ada item ditambahkan" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        title="Detail Waste Form"
        placement="right"
        width={700}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          selectedWaste?.status === 'submitted' && (
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
        {selectedWaste && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Branch</Text>
                  <br />
                  <Text strong>{selectedWaste.branch_name}</Text>
                  <br />
                  <Text type="secondary">{selectedWaste.branch_code} - {selectedWaste.branch_type}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tanggal</Text>
                  <br />
                  <Text strong>{dayjs(selectedWaste.waste_date).format('DD MMMM YYYY')}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Text type="secondary">Tipe Waste</Text>
                  <br />
                  <WasteTypeBadge type={selectedWaste.waste_type} />
                </Col>
                <Col span={8}>
                  <Text type="secondary">Total Items</Text>
                  <br />
                  <Text strong>{selectedWaste.total_items} item(s)</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Status</Text>
                  <br />
                  <StatusBadge status={selectedWaste.status} />
                </Col>
              </Row>
              {selectedWaste.notes && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Catatan</Text>
                  <br />
                  <Text>{selectedWaste.notes}</Text>
                </div>
              )}
              {selectedWaste.approved_by && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Disetujui oleh</Text>
                  <br />
                  <Text strong>{selectedWaste.approved_by}</Text>
                  {selectedWaste.approved_at && (
                    <Text type="secondary"> pada {dayjs(selectedWaste.approved_at).format('DD MMM YYYY HH:mm')}</Text>
                  )}
                </div>
              )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Items with Photos */}
            {selectedWaste.details?.map((detail, idx) => (
              <div key={idx} style={{
                marginBottom: 12,
                background: '#FAFAFA',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #E8E8E8'
              }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Text strong style={{ fontSize: 13 }}>{detail.product_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{detail.product_code}</Text>
                  </Col>
                  <Col span={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Qty</Text>
                    <br />
                    <Text>{detail.qty}</Text>
                  </Col>
                  <Col span={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Total Cost</Text>
                    <br />
                    <Text style={{ color: '#FF4D4F', fontWeight: 600 }}>
                      -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(detail.total_cost || 0)}
                    </Text>
                  </Col>
                  <Col span={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Alasan</Text>
                    <br />
                    <Tag color="orange">{detail.waste_reason}</Tag>
                  </Col>
                </Row>
                {detail.photo_urls && detail.photo_urls.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Foto Dokumentasi:</Text>
                    <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {detail.photo_urls.map((url, photoIdx) => (
                        <Image.PreviewGroup key={photoIdx}>
                          <Image
                            src={url}
                            alt={`Photo ${photoIdx + 1}`}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #E8E8E8' }}
                          />
                        </Image.PreviewGroup>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Fallback if no details */}
            {!selectedWaste.details && (
              <Table
                columns={detailColumns as any}
                dataSource={[
                  { id: 1, product_id: 1, product_code: 'COF001', product_name: 'Biji Kopi Arabica Premium 250g', qty: 2, unit_cost: 45000, total_cost: 90000, waste_reason: 'Melewati Expired Date', photo_urls: [] },
                  { id: 2, product_id: 2, product_code: 'MIL001', product_name: 'UHT Milk 1000ml', qty: 3, unit_cost: 12000, total_cost: 36000, waste_reason: 'Packaging Rusak', photo_urls: [] },
                  { id: 3, product_id: 3, product_code: 'SYR001', product_name: 'Syrup Vanilla 700ml', qty: 1, unit_cost: 35000, total_cost: 35000, waste_reason: 'Kontaminasi', photo_urls: [] }
                ].map((d, i) => ({ ...d, key: i }))}
                pagination={false}
                size="small"
              />
            )}

            <div style={{ marginTop: 16, padding: 12, background: '#FFF1F0', borderRadius: 8, border: '1px solid #FFCCC7' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Items"
                    value={selectedWaste.total_items}
                    valueStyle={{ fontSize: 18 }}
                  />
                </Col>
                <Col span={16}>
                  <Statistic
                    title="Total Waste Value"
                    value={selectedWaste.total_value}
                    precision={0}
                    prefix="Rp"
                    suffix=" (kerugian)"
                    valueStyle={{ fontSize: 20, color: '#FF4D4F', fontWeight: 700 }}
                  />
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Audit Trail */}
            <AuditTrail
              entries={[
                {
                  id: 1,
                  action: 'created',
                  performed_by: selectedWaste.created_by || 'System',
                  performed_at: selectedWaste.created_at || new Date().toISOString()
                },
                ...(selectedWaste.status !== 'draft' ? [{
                  id: 2,
                  action: 'submitted' as const,
                  performed_by: selectedWaste.submitted_by || 'PIC',
                  performed_at: selectedWaste.submitted_at || new Date().toISOString()
                }] : []),
                ...(selectedWaste.status === 'approved' || selectedWaste.status === 'rejected' ? [{
                  id: 3,
                  action: selectedWaste.status as 'approved' | 'rejected',
                  performed_by: selectedWaste.approved_by || 'Manager',
                  performed_at: selectedWaste.approved_at || new Date().toISOString(),
                  notes: selectedWaste.approval_notes
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
        showCost={true}
        selectedProducts={details.map(d => d.product_id)}
      />

      {/* Approval Modal */}
      <ApprovalModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onApprove={handleApprovalConfirm}
        onReject={handleRejectReason}
        title="Approval Waste Form"
        itemName={selectedWaste?.branch_name}
        itemValue={selectedWaste?.total_value}
        loading={submitting}
      />
    </Layout>
  );
}
