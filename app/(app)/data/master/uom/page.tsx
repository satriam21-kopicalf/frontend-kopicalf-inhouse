'use client';

import { useState, useEffect } from 'react';
import { Box, Snackbar, Alert, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { Uom } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';

const FIELDS: DrawerField[] = [
  { name: 'uomCode', label: 'UOM Code', required: true },
  { name: 'uomName', label: 'Unit Name', required: true },
  { name: 'isActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const emptyValues = (): Record<string, unknown> => ({
  uomCode: '',
  uomName: '',
  isActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function UomPage() {
  const [data, setData] = useState<Uom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [codeFilter, setCodeFilter] = useState<string>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Uom | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  useEffect(() => {
    apiClient.getUOMs()
      .then((uoms) => setData(uoms.sort((a, b) => a.uomName.localeCompare(b.uomName))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load UOMs'))
      .finally(() => setLoading(false));
  }, []);

  const codeOptions = useMemo(() => {
    const seen = new Set<string>();
    return data.filter(r => { if (!r.uomCode) return false; if (seen.has(r.uomCode)) return false; seen.add(r.uomCode); return true; })
      .map(r => ({ value: r.uomCode!, label: r.uomCode! }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (statusFilter !== 'all' && ((r.isActive ?? true) !== (statusFilter === 'active'))) return false;
      if (codeFilter !== 'all' && r.uomCode !== codeFilter) return false;
      return true;
    });
  }, [data, statusFilter, codeFilter]);

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: Uom) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), uomID: data.length ? Math.max(...data.map((d) => d.uomID)) + 1 : 1 });
    } else if (row) {
      setValues({ uomCode: row.uomCode, uomName: row.uomName, isActive: row.isActive, uomID: row.uomID, syncedAt: row.syncedAt, updatedAt: row.updatedAt });
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
        const newUom: Uom = {
          uomID: Number(values.uomID),
          uomCode: String(values.uomCode ?? ''),
          uomName: String(values.uomName ?? ''),
          category: 'Unit',
          baseUnit: String(values.uomCode ?? ''),
          conversionFactor: 1,
          description: '',
          isActive: Boolean(values.isActive),
          syncedAt: fmtNow(),
          updatedAt: now,
        };
        setData((prev) => [...prev, newUom].sort((a, b) => a.uomName.localeCompare(b.uomName)));
        showSnack('UOM added successfully');
      } else if (drawerMode === 'edit' && selected) {
        const updated: Uom = { ...selected, uomCode: String(values.uomCode ?? ''), uomName: String(values.uomName ?? ''), isActive: Boolean(values.isActive), updatedAt: now };
        setData((prev) => prev.map((d) => d.uomID === updated.uomID ? updated : d).sort((a, b) => a.uomName.localeCompare(b.uomName)));
        showSnack('UOM updated successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to save UOM', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      setData((prev) => prev.filter((d) => d.uomID !== selected.uomID));
      showSnack('UOM deleted', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
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
      id: 'isActive', label: 'Status', align: 'center',
      render: (r) => (
        <Chip
          label={(r.isActive ?? true) ? 'Active' : 'Inactive'}
          size="small"
          sx={{ fontWeight: 600, fontSize: 11, bgcolor: (r.isActive ?? true) ? 'success.lighter' : 'grey.200', color: (r.isActive ?? true) ? 'success.dark' : 'text.secondary' }}
        />
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Uom), tooltip: 'Edit UOM' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Uom), tooltip: 'Delete UOM' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Unit of Measure" subtitle="Unit master data — UoM codes and names from database" breadcrumbs={['Data', 'UoM']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Unit of Measure" subtitle="Unit master data — UoM codes and names from database" breadcrumbs={['Data', 'UoM']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Unit of Measure" subtitle="Unit master data — UoM codes and names from database" breadcrumbs={['Data', 'UoM']} />
      {/* Filter Bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Code</InputLabel>
          <Select label="Code" value={codeFilter} onChange={(e) => setCodeFilter(e.target.value)}>
            <MenuItem value="all">All Codes</MenuItem>
            {codeOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <ModernTable
        title="Units of Measure"
        subtitle={`${filtered.length} of ${data.length} records`}
        columns={columns}
        data={filtered}
        keyField="uomID"
        actions={actions}
        searchPlaceholder="Search by code or name..."
        searchFields={['uomCode', 'uomName']}
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
        width={480}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((sn) => ({ ...sn, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
