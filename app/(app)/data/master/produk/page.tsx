'use client';

import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BOM_DATA, Product } from '@/lib/mockData';

const TYPE_OPTIONS = [
  { value: 'Beverage', label: 'Beverage' },
  { value: 'Food', label: 'Food' },
  { value: 'Ingredient', label: 'Ingredient' },
  { value: 'Other', label: 'Other' },
];

const FIELDS: DrawerField[] = [
  { name: 'name', label: 'Product Name', required: true, gridSpan: 2 },
  { name: 'productCode', label: 'Product Code', required: true },
  { name: 'categoryId', label: 'Category', type: 'select', options: [], required: true },
  { name: 'subCategoryId', label: 'Sub Category', type: 'number' },
  { name: 'bomId', label: 'BOM ID', type: 'number' },
  { name: 'bomName', label: 'BOM Name' },
  { name: 'categoryTypeName', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
  { name: 'normalizedName', label: 'Normalized Name' },
  { name: 'flagActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const emptyValues = (): Record<string, unknown> => ({
  name: '',
  productCode: '',
  categoryId: '',
  subCategoryId: 0,
  bomId: null,
  bomName: '',
  categoryTypeName: 'Beverage',
  normalizedName: '',
  flagActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function ProdukPage() {
  const [data, setData] = useState<Product[]>(() =>
    [...MOCK_PRODUCTS].sort((a, b) => a.name.localeCompare(b.name))
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const categoryOptions = useMemo(() =>
    MOCK_CATEGORIES.map((c) => ({ value: c.categoryId, label: c.name })),
    []
  );

  const fieldsWithOptions = useMemo(() =>
    FIELDS.map((f) => f.name === 'categoryId' ? { ...f, options: categoryOptions } : f),
    [categoryOptions]
  );

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: Product) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), esbId: 0, productId: data.length ? Math.max(...data.map((d) => d.productId)) + 1 : 1 });
    } else if (row) {
      setValues({ ...row, categoryId: row.categoryId });
    }
    setDrawerOpen(true);
  };

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'categoryId') {
        const cat = MOCK_CATEGORIES.find((c) => c.categoryId === Number(value));
        if (cat) {
          next.categoryName = cat.name;
          next.categoryTypeName = cat.type;
        }
      }
      if (name === 'bomId' && typeof value === 'number') {
        const bom = MOCK_BOM_DATA.find((b) => b.bomId === value);
        next.bomName = bom?.name ?? '';
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const now = fmtNow();
    if (drawerMode === 'add') {
      const cat = MOCK_CATEGORIES.find((c) => c.categoryId === Number(values.categoryId));
      const newProd: Product = {
        productId: Number(values.productId),
        esbId: 0,
        productCode: String(values.productCode ?? ''),
        name: String(values.name ?? ''),
        categoryId: Number(values.categoryId),
        categoryName: cat?.name ?? '',
        subCategoryId: Number(values.subCategoryId ?? 0),
        subCategoryName: '',
        bomId: values.bomId != null && values.bomId !== '' ? Number(values.bomId) : null,
        bomName: String(values.bomName ?? ''),
        categoryTypeName: String(values.categoryTypeName ?? 'Beverage'),
        normalizedName: String(values.normalizedName ?? ''),
        flagActive: Boolean(values.flagActive),
        syncedAt: fmtNow(),
        updatedAt: now,
      };
      setData((prev) => [...prev, newProd].sort((a, b) => a.name.localeCompare(b.name)));
      showSnack('Product added successfully');
    } else if (drawerMode === 'edit' && selected) {
      const updated: Product = { ...selected, ...values, categoryId: Number(values.categoryId), updatedAt: now } as Product;
      setData((prev) => prev.map((d) => d.productId === updated.productId ? updated : d).sort((a, b) => a.name.localeCompare(b.name)));
      showSnack('Product updated successfully');
    }
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => prev.filter((d) => d.productId !== selected.productId));
    showSnack('Product deleted', 'error');
    setSaving(false);
    setDrawerOpen(false);
  };

  const columns: TableColumn<Product>[] = useMemo(() => [
    {
      id: 'productId', label: 'Id', width: 55, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.productId}</Box>,
    },
    {
      id: 'name', label: 'Product Name', sortable: true,
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{r.productCode}</Typography>
        </Box>
      ),
    },
    {
      id: 'categoryName', label: 'Category', hideOnMobile: true, sortable: true,
      render: (r) => (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 500 }}>{r.categoryName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{r.subCategoryName}</Typography>
        </Box>
      ),
    },
    {
      id: 'bomName', label: 'BOM', hideOnMobile: true,
      render: (r) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: r.bomName ? 'primary.main' : 'text.disabled' }}>
          {r.bomName || '—'}
        </Typography>
      ),
    },
    {
      id: 'categoryTypeName', label: 'Type', align: 'center', sortable: true,
      render: (r) => {
        const bg = r.categoryTypeName === 'Beverage' ? 'primary.lighter' : r.categoryTypeName === 'Food' ? 'secondary.lighter' : r.categoryTypeName === 'Ingredient' ? 'info.lighter' : 'grey.200';
        const fg = r.categoryTypeName === 'Beverage' ? 'primary.dark' : r.categoryTypeName === 'Food' ? 'secondary.dark' : r.categoryTypeName === 'Ingredient' ? 'info.dark' : 'text.primary';
        return <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: bg, color: fg }}>{r.categoryTypeName}</Box>;
      },
    },
    {
      id: 'flagActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.flagActive ? 'success.lighter' : 'grey.200', color: r.flagActive ? 'success.dark' : 'text.secondary' }}>
          {r.flagActive ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Product), tooltip: 'Edit product' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Product), tooltip: 'Delete product' },
  ];

  return (
    <Box>
      <PageHeader title="Product" subtitle="Product master data — menu items, raw materials, and sale items" breadcrumbs={['Data', 'Product']} />
      <ModernTable
        title="Products"
        subtitle={`${data.length} total products`}
        columns={columns}
        data={data}
        keyField="productId"
        actions={actions}
        searchPlaceholder="Search by name, code, or category..."
        searchFields={['name', 'productCode', 'categoryName', 'subCategoryName', 'normalizedName']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No products found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Product"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Product"
        subtitle={drawerMode === 'add' ? 'Fill in the product details' : drawerMode === 'edit' ? `Editing: ${selected?.name}` : `Confirm deletion of ${selected?.name}`}
        fields={fieldsWithOptions}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Product' : 'Save Changes'}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
