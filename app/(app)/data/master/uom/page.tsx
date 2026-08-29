'use client';

import { useState } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { MOCK_UOMS, Uom } from '@/lib/mockData';

const CATEGORY_OPTIONS = [
  { value: 'Weight', label: 'Weight' },
  { value: 'Volume', label: 'Volume' },
  { value: 'Unit', label: 'Unit' },
  { value: 'Serving', label: 'Serving' },
];

const FIELDS: DrawerField[] = [
  { name: 'uomCode', label: 'UOM Code', required: true },
  { name: 'uomName', label: 'Unit Name', required: true },
  { name: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, required: true },
  { name: 'baseUnit', label: 'Base Unit', required: true },
  { name: 'conversionFactor', label: 'Conversion Factor', type: 'number', required: true },
  { name: 'description', label: 'Description', gridSpan: 2 },
  { name: 'isActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const fmtFactor = (n: number) => (n >= 1000 ? n.toLocaleString('id-ID') : String(n));

const emptyValues = (): Record<string, unknown> => ({
  uomCode: '',
  uomName: '',
  category: 'Unit',
  baseUnit: '',
  conversionFactor: 1,
  description: '',
  isActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

const catColors: Record<string, { bg: string; color: string }> = {
  Weight: { bg: 'primary.lighter', color: 'primary.dark' },
  Volume: { bg: 'secondary.lighter', color: 'secondary.dark' },
  Unit: { bg: 'grey.200', color: 'text.primary' },
  Serving: { bg: 'info.lighter', color: 'info.dark' },
};

export default function UomPage() {
  const [data, setData] = useState<Uom[]>(() =>
    [...MOCK_UOMS].sort((a, b) => a.uomName.localeCompare(b.uomName))
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Uom | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: Uom) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), uomID: data.length ? Math.max(...data.map((d) => d.uomID)) + 1 : 1 });
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
      const newUom: Uom = {
        uomID: Number(values.uomID),
        uomCode: String(values.uomCode ?? ''),
        uomName: String(values.uomName ?? ''),
        category: values.category as Uom['category'],
        baseUnit: String(values.baseUnit ?? ''),
        conversionFactor: Number(values.conversionFactor ?? 1),
        description: String(values.description ?? ''),
        isActive: Boolean(values.isActive),
        syncedAt: fmtNow(),
        updatedAt: now,
      };
      setData((prev) => [...prev, newUom].sort((a, b) => a.uomName.localeCompare(b.uomName)));
      showSnack('UOM added successfully');
    } else if (drawerMode === 'edit' && selected) {
      const updated: Uom = { ...selected, ...values, updatedAt: now } as Uom;
      setData((prev) => prev.map((d) => d.uomID === updated.uomID ? updated : d).sort((a, b) => a.uomName.localeCompare(b.uomName)));
      showSnack('UOM updated successfully');
    }
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => prev.filter((d) => d.uomID !== selected.uomID));
    showSnack('UOM deleted', 'error');
    setSaving(false);
    setDrawerOpen(false);
  };

  const columns: TableColumn<Uom>[] = useMemo(() => [
    {
      id: 'uomID', label: 'Id', width: 55, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.uomID}</Box>,
    },
    {
      id: 'uomCode', label: 'Code', width: 90,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{r.uomCode}</Box>,
    },
    {
      id: 'uomName', label: 'Unit Name', sortable: true,
      render: (r) => (
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: 14 }}>{r.uomName}</Box>
          <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>#{r.uomID}</Box>
        </Box>
      ),
    },
    {
      id: 'category', label: 'Category', align: 'center', sortable: true,
      render: (r) => {
        const colors = catColors[r.category] || catColors['Unit'];
        return <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: colors.bg, color: colors.color }}>{r.category}</Box>;
      },
    },
    {
      id: 'conversionFactor', label: 'Conversion', align: 'center',
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.conversionFactor === 1 ? 'primary.main' : 'grey.200', color: r.conversionFactor === 1 ? 'primary.contrastText' : 'text.primary' }}>
          {r.conversionFactor === 1 ? 'Base' : `×${fmtFactor(r.conversionFactor)}`}
        </Box>
      ),
    },
    {
      id: 'baseUnit', label: 'Base Unit', align: 'center', hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.baseUnit}</Box>,
    },
    {
      id: 'description', label: 'Description', hideOnMobile: true,
      render: (r) => <Box sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</Box>,
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Uom), tooltip: 'Edit UOM' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Uom), tooltip: 'Delete UOM' },
  ];

  return (
    <Box>
      <PageHeader title="Unit of Measure" subtitle="Unit master data — grouped by category with conversion to base unit" breadcrumbs={['Data', 'UoM']} />
      <ModernTable
        title="Units of Measure"
        subtitle={`${data.length} total units`}
        columns={columns}
        data={data}
        keyField="uomID"
        actions={actions}
        searchPlaceholder="Search by code, name, or description..."
        searchFields={['uomCode', 'uomName', 'category', 'baseUnit', 'description']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No units found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add UOM"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Unit of Measure"
        subtitle={drawerMode === 'add' ? 'Fill in the UOM details' : drawerMode === 'edit' ? `Editing: ${selected?.uomName}` : `Confirm deletion of ${selected?.uomName}`}
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add UOM' : 'Save Changes'}
        width={560}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
