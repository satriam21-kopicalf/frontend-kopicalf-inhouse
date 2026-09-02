'use client';

import { useState, useEffect } from 'react';
import { Box, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { Unit } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';

const FIELDS: DrawerField[] = [
  { name: 'name', label: 'Unit Name', required: true, gridSpan: 2 },
  { name: 'code', label: 'Code', required: true },
  { name: 'companyId', label: 'Company ID', type: 'number', disabled: true },
  { name: 'flagActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const emptyValues = (): Record<string, unknown> => ({
  name: '',
  code: 'Unit',
  companyId: 3,
  flagActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function UnitPage() {
  const [data, setData] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [codeFilter, setCodeFilter] = useState<string>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Unit | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  useEffect(() => {
    apiClient.getUnits()
      .then((units) => setData(units.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load units'))
      .finally(() => setLoading(false));
  }, []);

  const codeOptions = useMemo(() => {
    const seen = new Set<string>();
    return data.filter(r => { if (!r.code) return false; if (seen.has(r.code)) return false; seen.add(r.code); return true; })
      .map(r => ({ value: r.code!, label: r.code! }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (statusFilter !== 'all' && ((r.flagActive ?? true) !== (statusFilter === 'active'))) return false;
      if (codeFilter !== 'all' && r.code !== codeFilter) return false;
      return true;
    });
  }, [data, statusFilter, codeFilter]);

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: Unit) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), id: data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1, esbId: 0 });
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
        const newUnit: Unit = {
          id: Number(values.id),
          companyId: Number(values.companyId),
          esbId: Number(values.esbId ?? 0),
          code: String(values.code ?? 'Unit'),
          name: String(values.name ?? ''),
          flagActive: Boolean(values.flagActive),
          syncedAt: fmtNow(),
          updatedAt: now,
        };
        setData((prev) => [...prev, newUnit].sort((a, b) => a.name.localeCompare(b.name)));
        showSnack('Unit added successfully');
      } else if (drawerMode === 'edit' && selected) {
        const updated: Unit = { ...selected, ...values, updatedAt: now } as Unit;
        setData((prev) => prev.map((d) => d.id === updated.id ? updated : d).sort((a, b) => a.name.localeCompare(b.name)));
        showSnack('Unit updated successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to save unit', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      setData((prev) => prev.filter((d) => d.id !== selected.id));
      showSnack('Unit deleted', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
  };

  const columns: TableColumn<Unit>[] = useMemo(() => [
    {
      id: 'id', label: 'Id', width: 55, align: 'right' as const,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.id}</Box>,
    },
    {
      id: 'esbId', label: 'ESB Id', width: 70, align: 'right' as const, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.esbId ?? 0}</Box>,
    },
    {
      id: 'code', label: 'Code', width: 80,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{r.code}</Box>,
    },
    {
      id: 'name', label: 'Unit Name', sortable: true,
      render: (r) => <Box sx={{ fontWeight: 500, fontSize: 14 }}>{r.name}</Box>,
    },
    {
      id: 'flagActive', label: 'Status', align: 'center',
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: (r.flagActive ?? true) ? 'success.lighter' : 'grey.200', color: (r.flagActive ?? true) ? 'success.dark' : 'text.secondary' }}>
          {(r.flagActive ?? true) ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
    {
      id: 'syncedAt', label: 'Synced At', width: 160, hideOnMobile: true,
    },
    {
      id: 'updatedAt', label: 'Updated At', width: 160, hideOnMobile: true,
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Unit), tooltip: 'Edit unit' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Unit), tooltip: 'Delete unit' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Unit" subtitle="Product unit name reference — e.g. CTN@24PACK, BTL@1000GR" breadcrumbs={['Data', 'Unit']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Unit" subtitle="Product unit name reference — e.g. CTN@24PACK, BTL@1000GR" breadcrumbs={['Data', 'Unit']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Unit" subtitle="Product unit name reference — e.g. CTN@24PACK, BTL@1000GR" breadcrumbs={['Data', 'Unit']} />
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
        title="Units"
        subtitle={`${filtered.length} of ${data.length} units`}
        columns={columns}
        data={filtered}
        keyField="id"
        actions={actions}
        searchPlaceholder="Search by name or code..."
        searchFields={['name', 'code']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No units found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Unit"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Unit"
        subtitle={drawerMode === 'add' ? 'Fill in the unit details' : drawerMode === 'edit' ? `Editing: ${selected?.name}` : `Confirm deletion of ${selected?.name}`}
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Unit' : 'Save Changes'}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
