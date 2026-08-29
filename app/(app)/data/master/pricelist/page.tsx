'use client';

import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { MOCK_PRICELISTS, PriceList } from '@/lib/mockData';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const FIELDS: DrawerField[] = [
  { name: 'pricelistNum', label: 'Price List Number', required: true },
  { name: 'productCode', label: 'Product Code', required: true },
  { name: 'productName', label: 'Product Name', required: true },
  { name: 'unitName', label: 'Unit' },
  { name: 'price', label: 'Price (IDR)', type: 'number', required: true },
  { name: 'currency', label: 'Currency' },
  { name: 'supplierName', label: 'Supplier' },
  { name: 'priceDate', label: 'Price Date' },
  { name: 'expiredDate', label: 'Expired Date' },
  { name: 'flagActive', label: 'Active', type: 'switch' },
];

const emptyValues = (): Record<string, unknown> => ({
  pricelistNum: '',
  productCode: '',
  productName: '',
  unitName: '',
  price: 0,
  currency: 'IDR',
  supplierName: '',
  priceDate: '',
  expiredDate: '',
  flagActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function PriceListPage() {
  const [data, setData] = useState<PriceList[]>(() =>
    [...MOCK_PRICELISTS].sort((a, b) => a.productName.localeCompare(b.productName))
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<PriceList | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: PriceList) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), id: data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1, esbId: 0, companyId: 3, productEsbId: 0, branchEsbId: 0 });
    } else if (row) {
      setValues({ ...row });
    }
    setDrawerOpen(true);
  };

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const now = fmtNow();
    if (drawerMode === 'add') {
      const newPl: PriceList = {
        id: Number(values.id),
        companyId: Number(values.companyId),
        esbId: Number(values.esbId),
        productEsbId: Number(values.productEsbId ?? 0),
        branchEsbId: Number(values.branchEsbId ?? 0),
        price: Number(values.price ?? 0),
        flagActive: Boolean(values.flagActive),
        priceDate: String(values.priceDate ?? ''),
        supplierName: String(values.supplierName ?? ''),
        productName: String(values.productName ?? ''),
        productCode: String(values.productCode ?? ''),
        unitName: String(values.unitName ?? ''),
        currency: String(values.currency ?? 'IDR'),
        expiredDate: String(values.expiredDate ?? ''),
        pricelistNum: String(values.pricelistNum ?? ''),
        syncedAt: fmtNow(),
        updatedAt: now,
      };
      setData((prev) => [...prev, newPl].sort((a, b) => a.productName.localeCompare(b.productName)));
      showSnack('Price List added successfully');
    } else if (drawerMode === 'edit' && selected) {
      const updated: PriceList = { ...selected, ...values, updatedAt: now } as PriceList;
      setData((prev) => prev.map((d) => d.id === updated.id ? updated : d).sort((a, b) => a.productName.localeCompare(b.productName)));
      showSnack('Price List updated successfully');
    }
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => prev.filter((d) => d.id !== selected.id));
    showSnack('Price List deleted', 'error');
    setSaving(false);
    setDrawerOpen(false);
  };

  const columns: TableColumn<PriceList>[] = useMemo(() => [
    {
      id: 'id', label: 'Id', width: 55, align: 'right' as const,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.id}</Box>,
    },
    {
      id: 'pricelistNum', label: 'PL No.', width: 130,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{r.pricelistNum}</Box>,
    },
    {
      id: 'productCode', label: 'Product Code', width: 120,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.productCode}</Box>,
    },
    {
      id: 'productName', label: 'Product Name', sortable: true,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.productName}</Typography>,
    },
    {
      id: 'unitName', label: 'Unit', width: 100,
    },
    {
      id: 'price', label: 'Price', align: 'right' as const,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', fontSize: 13 }}>
          {fmtCurr(r.price)}
        </Typography>
      ),
    },
    {
      id: 'supplierName', label: 'Supplier', width: 150,
      render: (r) => <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.supplierName}</Typography>,
    },
    {
      id: 'flagActive', label: 'Status', align: 'center',
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.flagActive ? 'success.lighter' : 'grey.200', color: r.flagActive ? 'success.dark' : 'text.secondary' }}>
          {r.flagActive ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as PriceList), tooltip: 'Edit price list' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as PriceList), tooltip: 'Delete price list' },
  ];

  return (
    <Box>
      <PageHeader title="Price List" subtitle="Product pricing master data — by supplier and unit" breadcrumbs={['Data', 'Price List']} />
      <ModernTable
        title="Price Lists"
        subtitle={`${data.length} total records`}
        columns={columns}
        data={data}
        keyField="id"
        actions={actions}
        searchPlaceholder="Search by product, code, or supplier..."
        searchFields={['productName', 'productCode', 'supplierName', 'unitName', 'pricelistNum']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No price lists found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Price List"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Price List"
        subtitle={drawerMode === 'add' ? 'Fill in the price list details' : drawerMode === 'edit' ? `Editing: ${selected?.productName}` : `Confirm deletion of ${selected?.productName}`}
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Price List' : 'Save Changes'}
        width={600}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
