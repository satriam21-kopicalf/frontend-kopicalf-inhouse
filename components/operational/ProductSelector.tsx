'use client';

import { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Space, Button, Typography, Empty, Spin } from 'antd';
import { SearchOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

export interface ProductItem {
  product_id: number;
  product_code: string;
  product_name: string;
  category_name?: string;
  uom_name?: string;
  current_qty?: number;
  unit_cost?: number;
  [key: string]: unknown;
}

interface ProductSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: ProductItem) => void;
  branchId?: number;
  showStock?: boolean;
  showCost?: boolean;
  multiSelect?: boolean;
  selectedProducts?: number[];
}

// Mock products for demo
const MOCK_PRODUCTS: ProductItem[] = [
  { product_id: 1, product_code: 'COF001', product_name: 'Biji Kopi Arabica Premium 250g', category_name: 'Biji Kopi', uom_name: 'pcs', current_qty: 50, unit_cost: 45000 },
  { product_id: 2, product_code: 'COF002', product_name: 'Biji Kopi Robusta 250g', category_name: 'Biji Kopi', uom_name: 'pcs', current_qty: 30, unit_cost: 35000 },
  { product_id: 3, product_code: 'MIL001', product_name: 'UHT Milk 1000ml', category_name: 'Dairy', uom_name: 'box', current_qty: 100, unit_cost: 18000 },
  { product_id: 4, product_code: 'MIL002', product_name: 'UHT Milk 250ml', category_name: 'Dairy', uom_name: 'pcs', current_qty: 200, unit_cost: 6000 },
  { product_id: 5, product_code: 'SYR001', product_name: 'Syrup Vanilla 700ml', category_name: 'Syrup', uom_name: 'btl', current_qty: 25, unit_cost: 35000 },
  { product_id: 6, product_code: 'SYR002', product_name: 'Syrup Caramel 700ml', category_name: 'Syrup', uom_name: 'btl', current_qty: 20, unit_cost: 35000 },
  { product_id: 7, product_code: 'SYR003', product_name: 'Syrup Hazelnut 700ml', category_name: 'Syrup', uom_name: 'btl', current_qty: 15, unit_cost: 35000 },
  { product_id: 8, product_code: 'PKG001', product_name: 'Cup Gajah 12oz', category_name: 'Packaging', uom_name: 'pcs', current_qty: 500, unit_cost: 2500 },
  { product_id: 9, product_code: 'PKG002', product_name: 'Cup Gajah 16oz', category_name: 'Packaging', uom_name: 'pcs', current_qty: 400, unit_cost: 3000 },
  { product_id: 10, product_code: 'PKG003', product_name: 'Paper Cup 8oz', category_name: 'Packaging', uom_name: 'pcs', current_qty: 600, unit_cost: 2000 },
  { product_id: 11, product_code: 'TOP001', product_name: 'Whipped Cream', category_name: 'Topping', uom_name: 'can', current_qty: 40, unit_cost: 22000 },
  { product_id: 12, product_code: 'TOP002', product_name: 'Chocolate Sauce', category_name: 'Topping', uom_name: 'btl', current_qty: 30, unit_cost: 28000 },
  { product_id: 13, product_code: 'TEA001', product_name: 'Teh Celup Sari Alam 25s', category_name: 'Teh', uom_name: 'box', current_qty: 80, unit_cost: 15000 },
  { product_id: 14, product_code: 'TEA002', product_name: 'Matcha Powder 100g', category_name: 'Teh', uom_name: 'can', current_qty: 20, unit_cost: 85000 },
  { product_id: 15, product_code: 'TEM001', product_name: 'Templar 500ml', category_name: 'Syrup', uom_name: 'btl', current_qty: 25, unit_cost: 42000 },
];

const CATEGORIES = [
  'All', 'Biji Kopi', 'Dairy', 'Syrup', 'Packaging', 'Topping', 'Teh'
];

export default function ProductSelector({
  open,
  onClose,
  onSelect,
  branchId,
  showStock = false,
  showCost = false,
  multiSelect = false,
  selectedProducts = []
}: ProductSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selected, setSelected] = useState<ProductItem | null>(null);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open, branchId]);

  const loadProducts = async () => {
    setLoading(true);
    // Simulate API call
    // In production, use: stockOpnameService.getProductsWithStock(branchId)
    await new Promise(resolve => setTimeout(resolve, 500));
    setProducts(MOCK_PRODUCTS);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = !search ||
      p.product_code.toLowerCase().includes(search.toLowerCase()) ||
      p.product_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category_name === category;
    const notSelected = !selectedProducts.includes(p.product_id);
    return matchSearch && matchCategory && notSelected;
  });

  const handleSelect = (product: ProductItem) => {
    setSelected(product);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
      setSearch('');
      setCategory('All');
      onClose();
    }
  };

  const columns: ColumnsType<ProductItem> = [
    {
      title: 'Code',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 100,
      render: (code) => <Text code style={{ fontSize: 11 }}>{code}</Text>
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.category_name} - {record.uom_name}</Text>
        </div>
      )
    },
    ...(showStock ? [{
      title: 'System Qty',
      dataIndex: 'current_qty',
      key: 'current_qty',
      width: 100,
      align: 'right' as const,
    }] : []),
    ...(showCost ? [{
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      width: 110,
      align: 'right' as const,
      render: (cost: number) => cost ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(cost) : '-'
    }] : []),
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        selected?.product_id === record.product_id ? (
          <CheckOutlined style={{ color: '#52C41A', fontSize: 16 }} />
        ) : null
      )
    }
  ];

  return (
    <Modal
      title="Select Product"
      open={open}
      onCancel={() => {
        setSelected(null);
        onClose();
      }}
      width={700}
      footer={
        <Space>
          <Button onClick={() => { setSelected(null); onClose(); }}>
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={!selected}
            onClick={handleConfirm}
          >
            Select Product
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
            prefix={<SearchOutlined style={{ color: '#8A8A8A' }} />}
          />
          <Select
            value={category}
            onChange={setCategory}
            style={{ width: 150 }}
          >
            {CATEGORIES.map(cat => (
              <Select.Option key={cat} value={cat}>{cat}</Select.Option>
            ))}
          </Select>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading products...</Text>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="product_id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} products`
          }}
          onRow={(record) => ({
            onClick: () => handleSelect(record),
            style: { cursor: 'pointer' },
            className: selected?.product_id === record.product_id ? 'ant-table-row-selected' : ''
          })}
        />
      )}
    </Modal>
  );
}
