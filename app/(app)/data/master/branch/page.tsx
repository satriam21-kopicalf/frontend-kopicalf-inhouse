'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { apiClient, Branch } from '@/lib/api/client';
import { TableColumn } from '@/components/ModernTable';

const FIELDS: DrawerField[] = [
  { name: 'branchName', label: 'Branch Name', required: true, gridSpan: 2 },
  { name: 'branchCode', label: 'Branch Code', required: true },
  { name: 'address', label: 'Address', gridSpan: 2 },
  { name: 'isActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const emptyValues = (): Record<string, unknown> => ({
  branchName: '',
  branchCode: '',
  address: '',
  isActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function BranchPage() {
  const [data, setData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const branches = await apiClient.getBranches();
      setData(branches.sort((a, b) => a.branchName.localeCompare(b.branchName)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch branches');
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const locationOptions = useMemo(() => {
    const seen = new Set<string>();
    return data.filter(r => { if (!r.address) return false; if (seen.has(r.address)) return false; seen.add(r.address); return true; })
      .map(r => ({ value: r.address!, label: r.address! }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (statusFilter !== 'all' && ((r.isActive ?? true) !== (statusFilter === 'active'))) return false;
      if (locationFilter !== 'all' && r.address !== locationFilter) return false;
      return true;
    });
  }, [data, statusFilter, locationFilter]);

  const handleOpen = (mode: DrawerMode, row?: Branch) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), branchID: data.length ? Math.max(...data.map((d) => d.branchID)) + 1 : 1, esbId: 0 });
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
        const newBranch = await apiClient.createBranch(values as Partial<Branch>);
        setData((prev) => [...prev, newBranch].sort((a, b) => a.branchName.localeCompare(b.branchName)));
        showSnack('Branch added successfully');
      } else if (drawerMode === 'edit' && selected) {
        const updated = await apiClient.updateBranch(selected.branchID, values as Partial<Branch>);
        setData((prev) => prev.map((d) => d.branchID === updated.branchID ? updated : d).sort((a, b) => a.branchName.localeCompare(b.branchName)));
        showSnack('Branch updated successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to save branch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await apiClient.deleteBranch(selected.branchID);
      setData((prev) => prev.filter((d) => d.branchID !== selected.branchID));
      showSnack('Branch deleted', 'error');
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to delete branch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: TableColumn<Branch>[] = useMemo(() => [
    {
      id: 'branchID', label: 'Id', width: 60, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.branchID}</Box>,
    },
    {
      id: 'esbId', label: 'ESB Id', width: 70, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.esbId}</Box>,
    },
    {
      id: 'branchName', label: 'Branch Name', sortable: true,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.branchName}</Typography>,
    },
    {
      id: 'branchCode', label: 'Code', hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{r.branchCode}</Box>,
    },
    {
      id: 'address', label: 'Location', hideOnMobile: true,
      render: (r) => <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address || '-'}</Typography>,
    },
    {
      id: 'isActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.isActive ? 'success.lighter' : 'grey.200', color: r.isActive ? 'success.dark' : 'text.secondary' }}>
          {r.isActive ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
    {
      id: 'syncedAt', label: 'Last Synced', hideOnMobile: true,
      render: (r) => <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{r.syncedAt}</Typography>,
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Branch), tooltip: 'Edit branch' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Branch), tooltip: 'Delete branch' },
  ];

  return (
    <Box>
      <PageHeader
        title="Branch"
        subtitle="Branch master data from database — outlets, warehouses, and head office locations"
        breadcrumbs={['Data', 'Master', 'Branch']}
      />

      {loading && data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : error && data.length === 0 ? (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      ) : (
        <>
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
              <InputLabel>Location</InputLabel>
              <Select label="Location" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <MenuItem value="all">All Locations</MenuItem>
                {locationOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <ModernTable
            title="Branches"
            subtitle={`${filtered.length} of ${data.length} branches`}
            columns={columns}
            data={filtered}
            keyField="branchID"
            actions={actions}
            searchPlaceholder="Search by name or code..."
            searchFields={['branchName', 'branchCode']}
            pagination={true}
            defaultRowsPerPage={50}
            rowsPerPageOptions={[10, 25, 50, 100]}
            emptyMessage="No branches found."
            onAdd={() => handleOpen('add')}
            addButtonLabel="Add Branch"
          />
        </>
      )}

      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Branch"
        subtitle={drawerMode === 'add' ? 'Fill in the branch details' : drawerMode === 'edit' ? `Editing: ${selected?.branchName}` : `Confirm deletion of ${selected?.branchName}`}
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Branch' : 'Save Changes'}
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
