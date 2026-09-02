'use client';

import { useState, useEffect } from 'react';
import { Box, Snackbar, Alert, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { Staff } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const emptyValues = (): Record<string, unknown> => ({
  name: '',
  role: '',
  flagActive: true,
});

const FIELDS: DrawerField[] = [
  { name: 'name', label: 'Name', required: true },
  { name: 'role', label: 'Role' },
  { name: 'flagActive', label: 'Active', type: 'switch' },
];

export default function AccountAccessPage() {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  useEffect(() => {
    apiClient.getStaff()
      .then((staff) => setData(staff.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load accounts'))
      .finally(() => setLoading(false));
  }, []);

  const roleOptions = useMemo(() => {
    const seen = new Set<string>();
    return data.filter(r => { if (!r.role) return false; if (seen.has(r.role)) return false; seen.add(r.role); return true; })
      .map(r => ({ value: r.role!, label: r.role! }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (statusFilter !== 'all' && ((r.flagActive ?? r.isActive ?? true) !== (statusFilter === 'active'))) return false;
      if (roleFilter !== 'all' && r.role !== roleFilter) return false;
      return true;
    });
  }, [data, statusFilter, roleFilter]);

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: Staff) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), esbId: 0 });
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
        const newStaff: Staff = {
          staffId: 0,
          name: String(values.name ?? ''),
          role: String(values.role ?? ''),
          flagActive: Boolean(values.flagActive),
          syncedAt: fmtNow(),
          updatedAt: now,
        };
        setData((prev) => [...prev, newStaff].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')));
        showSnack('Account added successfully');
      } else if (drawerMode === 'edit' && selected) {
        const updated: Staff = { ...selected, ...values, updatedAt: now } as Staff;
        setData((prev) => prev.map((d) => d.staffId === updated.staffId ? updated : d).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')));
        showSnack('Account updated successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to save account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      setData((prev) => prev.filter((d) => d.staffId !== selected.staffId));
      showSnack('Account deleted', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
  };

  const roleColors: Record<string, { bgcolor: string; color: string }> = {
    Manager: { bgcolor: 'primary.lighter', color: 'primary.dark' },
    Barista: { bgcolor: 'secondary.lighter', color: 'secondary.dark' },
    Cashier: { bgcolor: 'warning.lighter', color: 'warning.dark' },
    Kitchen: { bgcolor: 'error.lighter', color: 'error.dark' },
  };

  const columns: TableColumn<Staff>[] = useMemo(() => [
    {
      id: 'staffId', label: 'Id', width: 55, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.staffId}</Box>,
    },
    {
      id: 'name', label: 'Name', sortable: true,
      render: (r) => <Box sx={{ fontWeight: 500, fontSize: 14 }}>{r.name ?? '-'}</Box>,
    },
    {
      id: 'role', label: 'Role', align: 'center', sortable: true,
      render: (r) => {
        const colors = roleColors[r.role ?? ''] ?? { bgcolor: 'grey.200', color: 'text.primary' };
        return <Chip label={r.role ?? '-'} size="small" sx={{ bgcolor: colors.bgcolor, color: colors.color, fontWeight: 600, fontSize: 12 }} />;
      },
    },
    {
      id: 'flagActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: (r.flagActive ?? r.isActive) ? 'success.lighter' : 'grey.200', color: (r.flagActive ?? r.isActive) ? 'success.dark' : 'text.secondary' }}>
          {(r.flagActive ?? r.isActive) ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Staff), tooltip: 'Edit account access' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Staff), tooltip: 'Delete account access' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Account Access" subtitle="Manage user accounts, roles, and access permissions" breadcrumbs={['Data', 'Master', 'Account Access']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Account Access" subtitle="Manage user accounts, roles, and access permissions" breadcrumbs={['Data', 'Master', 'Account Access']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Account Access" subtitle="Manage user accounts, roles, and access permissions" breadcrumbs={['Data', 'Master', 'Account Access']} />
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="all">All Roles</MenuItem>
            {roleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <ModernTable
        title="Account Access"
        subtitle={`${filtered.length} of ${data.length} accounts`}
        columns={columns}
        data={filtered}
        keyField="staffId"
        actions={actions}
        searchPlaceholder="Search by name or role..."
        searchFields={['name', 'role']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No accounts found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Account"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Account Access"
        subtitle={drawerMode === 'add' ? 'Fill in the account details' : drawerMode === 'edit' ? `Editing: ${selected?.name}` : `Confirm deletion of ${selected?.name}`}
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Account' : 'Save Changes'}
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
