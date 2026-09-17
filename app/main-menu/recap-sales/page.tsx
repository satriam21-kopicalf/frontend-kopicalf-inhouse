'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Typography, Table, Button, Input, Select, message } from 'antd';
import type { TableColumnsType } from 'antd';

const { Title, Text } = Typography;

interface SalesRecord {
  key: string;
  date: string;
  salesNo: string;
  billNo: string;
  branch: string;
  branchCode: string;
  menu: string;
  category: string;
  qty: number;
  price: number;
  total: number;
  nett: number;
  status: 'completed' | 'void';
}

// Flat Stats - Vercel Style
function FlatStats({ stats }: { stats: { label: string; value: string; highlight?: boolean }[] }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px 20px',
      marginBottom: 16,
      padding: '10px 0',
      borderTop: '1px solid #E5E5E5',
      borderBottom: '1px solid #E5E5E5'
    }}>
      {stats.map((stat, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <Text style={{ fontSize: 10, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            {stat.label}
          </Text>
          <Text style={{
            fontSize: 14,
            fontWeight: 600,
            color: stat.highlight ? '#000000' : '#666666',
            lineHeight: 1
          }}>
            {stat.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

// Custom Pagination Component
function Pagination({ current, total, pageSize, onChange }: { current: number; total: number; pageSize: number; onChange: (page: number, size: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      borderTop: '1px solid #E5E5E5',
      flexWrap: 'wrap',
      gap: 8
    }}>
      <Text style={{ fontSize: 12, color: '#8A8A8A' }}>
        {start}-{end} of {total}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onChange(current - 1, pageSize)}
          disabled={current === 1}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid #E5E5E5',
            background: current === 1 ? '#F7F7F7' : '#FFFFFF',
            cursor: current === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: current === 1 ? '#CCCCCC' : '#666666'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let page = i + 1;
          if (totalPages > 5) {
            if (current > 3) {
              page = current - 2 + i;
            }
            if (current > totalPages - 2) {
              page = totalPages - 4 + i;
            }
          }
          if (page < 1 || page > totalPages) return null;

          return (
            <button
              key={page}
              onClick={() => onChange(page, pageSize)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: page === current ? '1px solid #000000' : '1px solid #E5E5E5',
                background: page === current ? '#000000' : '#FFFFFF',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: page === current ? 600 : 400,
                color: page === current ? '#FFFFFF' : '#666666'
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onChange(current + 1, pageSize)}
          disabled={current === totalPages}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid #E5E5E5',
            background: current === totalPages ? '#F7F7F7' : '#FFFFFF',
            cursor: current === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: current === totalPages ? '#CCCCCC' : '#666666'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function RecapSalesPage() {
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ branch: '', category: '', status: '' });
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const data: SalesRecord[] = Array.from({ length: 50 }, (_, i) => ({
    key: `${i}`,
    date: '2026-09-14',
    salesNo: `SL-${String(i + 1).padStart(5, '0')}`,
    billNo: `BILL-${Math.floor(Math.random() * 900000 + 100000)}`,
    branch: ['Kopi Calf Cipete', 'Kopi Calf Bandung', 'Central Kitchen'][i % 3],
    branchCode: ['KCC001', 'KCB001', 'CK001'][i % 3],
    menu: ['Kopi Hitam', 'Kopi Susu', 'Teh Tarik', 'Nasi Goreng', 'Roti Bakar'][i % 5],
    category: ['Beverage', 'Food', 'Dessert'][i % 3],
    qty: Math.floor(Math.random() * 5) + 1,
    price: Math.floor(Math.random() * 60000 + 15000),
    total: Math.floor(Math.random() * 100000 + 20000),
    nett: Math.floor(Math.random() * 90000 + 10000),
    status: Math.random() > 0.15 ? 'completed' : 'void',
  }));

  const filteredData = data.filter(item => {
    if (searchText) {
      const search = searchText.toLowerCase();
      return item.salesNo.toLowerCase().includes(search) ||
             item.billNo.toLowerCase().includes(search) ||
             item.menu.toLowerCase().includes(search) ||
             item.branch.toLowerCase().includes(search);
    }
    return true;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: TableColumnsType<SalesRecord> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 80,
      render: (v: string) => <Text style={{ fontSize: 11, color: '#666666' }}>{v}</Text>,
    },
    {
      title: 'Sales No',
      dataIndex: 'salesNo',
      key: 'salesNo',
      width: 100,
      render: (v: string) => <Text style={{ fontSize: 11, fontWeight: 500, color: '#000000' }}>{v}</Text>,
    },
    {
      title: 'Branch',
      key: 'branch',
      width: 120,
      render: (_: unknown, record) => (
        <div>
          <Text style={{ fontSize: 11, fontWeight: 500, color: '#000000' }}>{record.branch}</Text>
        </div>
      ),
    },
    {
      title: 'Menu',
      dataIndex: 'menu',
      key: 'menu',
      width: 90,
      render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text>,
    },
    {
      title: 'Cat',
      dataIndex: 'category',
      key: 'category',
      width: 70,
      render: (v: string) => (
        <span style={{
          display: 'inline-block',
          padding: '2px 5px',
          borderRadius: 4,
          fontSize: 9,
          fontWeight: 500,
          background: v === 'Beverage' ? '#F0F9FF' : v === 'Food' ? '#FFF7ED' : '#F5F3FF',
          color: v === 'Beverage' ? '#2563EB' : v === 'Food' ? '#EA580C' : '#7C3AED'
        }}>
          {v}
        </span>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 40,
      align: 'center' as const,
      render: (v: number) => <Text style={{ fontWeight: 600, fontSize: 11 }}>{v}</Text>,
    },
    {
      title: 'Nett',
      dataIndex: 'nett',
      key: 'nett',
      width: 85,
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ fontSize: 11, fontWeight: 600, color: v > 0 ? '#059669' : '#DC2626' }}>
          {v.toLocaleString('id-ID')}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      align: 'center' as const,
      render: (v: string) => (
        <span style={{
          display: 'inline-block',
          padding: '2px 5px',
          borderRadius: 4,
          fontSize: 9,
          fontWeight: 500,
          background: v === 'completed' ? '#ECFDF5' : '#FEF2F2',
          color: v === 'completed' ? '#059669' : '#DC2626'
        }}>
          {v === 'completed' ? 'Done' : 'Void'}
        </span>
      ),
    },
  ];

  const summaryData = {
    totalBills: filteredData.length,
    completedBills: filteredData.filter((d) => d.status === 'completed').length,
    voidBills: filteredData.filter((d) => d.status === 'void').length,
    totalNett: filteredData.reduce((sum, d) => sum + d.nett, 0),
  };

  const stats = [
    { label: 'Total Bills', value: summaryData.totalBills.toString() },
    { label: 'Completed', value: summaryData.completedBills.toString(), highlight: true },
    { label: 'Void', value: summaryData.voidBills.toString() },
    { label: 'Total Nett', value: `Rp ${(summaryData.totalNett / 1000000).toFixed(1)}M`, highlight: true },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{
            width: 20,
            height: 20,
            border: '2px solid #E5E5E5',
            borderTopColor: '#000000',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
          Recap Sales
        </Title>
        <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
          Kelola dan lihat data recap penjualan
        </Text>
      </div>

      {/* Flat Stats */}
      <FlatStats stats={stats} />

      {/* Table Container */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        overflow: 'hidden'
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '10px 12px',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{
              borderRadius: 6,
              maxWidth: 200,
              width: '100%',
              border: '1px solid #E5E5E5',
              height: 32,
              fontSize: 12
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              onClick={() => {}}
              style={{ borderRadius: 6, border: '1px solid #E5E5E5', color: '#666666', height: 32, fontSize: 11, padding: '0 10px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </Button>
            <Button
              onClick={() => setFilterOpen(true)}
              style={{ borderRadius: 6, border: '1px solid #E5E5E5', color: '#666666', height: 32, fontSize: 11, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            size="small"
            style={{ borderRadius: 0 }}
            rowClassName={(record) => record.status === 'void' ? 'table-row-void' : ''}
            scroll={{ x: 600 }}
          />
        </div>

        {/* Pagination */}
        <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={(page, size) => { setCurrentPage(page); if (size !== pageSize) setPageSize(size); }}
        />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .ant-table-cell {
            padding: 8px 8px !important;
            font-size: 11px;
          }
          .ant-table-cell::before {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
}
