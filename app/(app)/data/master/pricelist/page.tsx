'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { PriceList } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('en-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

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
  const [data, setData] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<PriceList | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  useEffect(() => {
    apiClient.getPriceLists()
      .then((lists) => setData(lists.sort((a, b) => (a.productName ?? '').localeCompare(b.productName ?? ''))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load price lists'))
      .finally(() => setLoading(false));
  }, []);

  const supplierOptions = useMemo(() => {
    const seen = new Set<string>();
    return data.filter(r => { if (!r.supplierName) return false; if (seen.has(r.supplierName)) return false; seen.add(r.supplierName); return true; })
      .map(r => ({ value: r.supplierName!, label: r.supplierName! }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (statusFilter !== 'all' && ((r.flagActive ?? true) !== (statusFilter === 'active'))) return false;
      if (supplierFilter !== 'all' && r.supplierName !== supplierFilter) return false;
      if (currencyFilter !== 'all' && r.currency !== currencyFilter) return false;
      return true;
    });
  }, [data, statusFilter, supplierFilter, currencyFilter]);

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
    try {
      const now = fmtNow();
      if (drawerMode === 'add') {
        const newPl: PriceList = {
          id: Number(values.id),
          companyId: Number(values.companyId ?? 3),
          esbId: Number(values.esbId ?? 0),
          productEsbId: Number(values.productEsbId ?? 0),
          branchEsbId: (values.branchEsbId ?? 'ALL') as number | 'ALL',
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
        setData((prev) => [...prev, newPl].sort((a, b) => (a.productName ?? '').localeCompare(b.productName ?? '')));
        showSnack('Price List added successfully');
      } else if (drawerMode === 'edit' && selected) {
        const updated: PriceList = { ...selected, ...values, updatedAt: now } as PriceList;
        setData((prev) => prev.map((d) => d.id === updated.id ? updated : d).sort((a, b) => (a.productName ?? '').localeCompare(b.productName ?? '')));
        showSnack('Price List updated successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to save price list', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      setData((prev) => prev.filter((d) => d.id !== selected.id));
      showSnack('Price List deleted', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
  };

  const columns: TableColumn<PriceList>[] = useMemo(() => [
    {
      id: 'id', label: 'Id', width: 55, align: 'right' as const,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.id}</Box>,
    },
    {
      id: 'pricelistNum', label: 'PL No.', width: 130,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{r.pricelistNum ?? '-'}</Box>,
    },
    {
      id: 'productCode', label: 'Product Code', width: 120,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.productCode ?? '-'}</Box>,
    },
    {
      id: 'productName', label: 'Product Name', sortable: true,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.productName ?? '-'}</Typography>,
    },
    {
      id: 'unitName', label: 'Unit', width: 100,
      render: (r) => <Box sx={{ fontSize: 13 }}>{r.unitName ?? '-'}</Box>,
    },
    {
      id: 'price', label: 'Price', align: 'right' as const,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', fontSize: 13 }}>
          {fmtCurr(r.price ?? 0)}
        </Typography>
      ),
    },
    {
      id: 'supplierName', label: 'Supplier', width: 150,
      render: (r) => <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.supplierName ?? '-'}</Typography>,
    },
    {
      id: 'flagActive', label: 'Status', align: 'center',
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: (r.flagActive ?? true) ? 'success.lighter' : 'grey.200', color: (r.flagActive ?? true) ? 'success.dark' : 'text.secondary' }}>
          {(r.flagActive ?? true) ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as PriceList), tooltip: 'Edit price list' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as PriceList), tooltip: 'Delete price list' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Price List" subtitle="Product pricing master data — by supplier and unit" breadcrumbs={['Data', 'Price List']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Price List" subtitle="Product pricing master data — by supplier and unit" breadcrumbs={['Data', 'Price List']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Price List" subtitle="Product pricing master data — by supplier and unit" breadcrumbs={['Data', 'Price List']} />
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Supplier</InputLabel>
          <Select label="Supplier" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
            <MenuItem value="all">All Suppliers</MenuItem>
            {supplierOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Currency</InputLabel>
          <Select label="Currency" value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="IDR">IDR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="SGD">SGD</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ModernTable
        title="Price Lists"
        subtitle={`${filtered.length} of ${data.length} records`}
        columns={columns}
        data={filtered}
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
