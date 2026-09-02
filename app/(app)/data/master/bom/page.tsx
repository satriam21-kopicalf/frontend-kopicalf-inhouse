'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Drawer,
  Button, TextField, MenuItem,
  Snackbar, Alert, CircularProgress,
  FormControl, InputLabel, Select,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import DataDrawer from '@/components/DataDrawer';
import ModernTable from '@/components/ModernTable';
import { TableColumn } from '@/components/ModernTable';
import { BOM } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';

const BOM_TYPES = [
  { bomTypeId: 1, bomTypeName: 'Standard' },
  { bomTypeId: 2, bomTypeName: 'Semi Finished' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const numField = (value: string) => (value === '' ? 0 : Number(value));

export default function BomPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bomTypeFilter, setBomTypeFilter] = useState<number | 'all'>('all');

  const [editing, setEditing] = useState<BOM | null>(null);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  // Delete drawer state
  const [deleting, setDeleting] = useState<BOM | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);

  useEffect(() => {
    apiClient.getBOMs()
      .then((bomsData) => {
        setBoms(bomsData.sort((a, b) => a.name.localeCompare(b.name)));
      }).catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load BOM data');
      }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return boms.filter(r => {
      if (statusFilter !== 'all' && ((r.flagActive ?? true) !== (statusFilter === 'active'))) return false;
      if (bomTypeFilter !== 'all' && r.bomTypeId !== bomTypeFilter) return false;
      return true;
    });
  }, [boms, statusFilter, bomTypeFilter]);

  const handleDeleteOpen = (row: BOM) => {
    setDeleting(row);
    setDeleteDrawerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      setBoms((prev) => prev.filter((b) => b.bomId !== deleting.bomId));
      setDeleteDrawerOpen(false);
      setDeleting(null);
      setToast({ open: true, msg: 'BOM deleted successfully', sev: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (bom: BOM) => {
    setEditing({ ...bom });
  };

  const handleSave = () => {
    if (!editing) return;
    const saved: BOM = { ...editing, updatedAt: fmtNow() };
    setBoms((prev) => {
      const updated = prev.map((b) => (b.bomId === saved.bomId ? saved : b));
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });
    setEditing(null);
    setToast({ open: true, msg: 'BOM saved successfully', sev: 'success' });
  };

  const setBomType = (bomTypeId: number) => {
    if (!editing) return;
    const t = BOM_TYPES.find((x) => x.bomTypeId === bomTypeId);
    setEditing({ ...editing, bomTypeId, bomTypeName: t?.bomTypeName ?? editing.bomTypeName });
  };

  const deleteFields = deleting ? [
    { name: 'code', label: 'Code', type: 'readonly' as const },
    { name: 'name', label: 'BOM Name', type: 'readonly' as const },
    { name: 'productName', label: 'Product', type: 'readonly' as const },
    { name: 'bomTypeName', label: 'Type', type: 'readonly' as const },
  ] : [];

  const columns: TableColumn<BOM>[] = useMemo(() => [
    {
      id: 'bomId', label: 'Id', width: 55, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.bomId}</Box>,
    },
    {
      id: 'code', label: 'Code', width: 100, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{r.code ?? '-'}</Box>,
    },
    {
      id: 'name', label: 'BOM Name', sortable: true,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography>,
    },
    {
      id: 'productName', label: 'Product', sortable: true, hideOnMobile: true,
      render: (r) => <Typography variant="caption">{r.productName ?? '-'}</Typography>,
    },
    {
      id: 'outputQty', label: 'Output', align: 'center', hideOnMobile: true,
      render: (r) => <Box sx={{ fontWeight: 600, fontSize: 14 }}>{r.outputQty ?? 1} {r.uomName ?? ''}</Box>,
    },
    {
      id: 'bomTypeName', label: 'Type', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: (r.bomTypeId ?? 1) === 1 ? 'primary.lighter' : 'secondary.lighter', color: (r.bomTypeId ?? 1) === 1 ? 'primary.dark' : 'secondary.dark' }}>
          {r.bomTypeName ?? 'Standard'}
        </Box>
      ),
    },
    {
      id: 'flagActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: (r.flagActive ?? true) ? 'success.lighter' : 'grey.200', color: (r.flagActive ?? true) ? 'success.dark' : 'text.secondary' }}>
          {(r.flagActive ?? true) ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => openEdit(r as BOM), tooltip: 'Edit BOM' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleDeleteOpen(r as BOM), tooltip: 'Delete BOM' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Bill of Material" subtitle="Recipe master data — BOM with material composition and HPP calculation" breadcrumbs={['Data', 'BOM']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Bill of Material" subtitle="Recipe master data — BOM with material composition and HPP calculation" breadcrumbs={['Data', 'BOM']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Bill of Material" subtitle="Recipe master data — BOM with material composition and HPP calculation" breadcrumbs={['Data', 'BOM']} />
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
          <InputLabel>BOM Type</InputLabel>
          <Select label="BOM Type" value={bomTypeFilter} onChange={(e) => setBomTypeFilter(e.target.value as number | 'all')}>
            <MenuItem value="all">All Types</MenuItem>
            {BOM_TYPES.map((t) => <MenuItem key={t.bomTypeId} value={t.bomTypeId}>{t.bomTypeName}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <ModernTable
        title="BOM Recipes"
        subtitle={`${filtered.length} of ${boms.length} recipes`}
        columns={columns}
        data={filtered}
        keyField="bomId"
        actions={actions}
        searchPlaceholder="Search by code, name, or product..."
        searchFields={['code', 'name', 'productName']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No BOM recipes found."
        onAdd={() => {}}
      />

      {/* Edit Drawer (BOM form + material sub-table) */}
      <Drawer
        anchor="right"
        open={!!editing}
        onClose={() => setEditing(null)}
        slotProps={{
          paper: {
            sx: { width: 680, maxWidth: '100vw', borderRadius: '16px 0 0 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
          },
          backdrop: {
            sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.4)' },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Edit BOM — {editing?.name}</Typography>
            <Typography variant="caption" color="text.secondary">BOM materials not yet synced — editing not available.</Typography>
          </Box>
          <IconButton size="small" onClick={() => setEditing(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          {editing && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <TextField label="Code" size="small" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
                <TextField label="Name" size="small" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <TextField label="Product Name" size="small" value={editing.productName} onChange={(e) => setEditing({ ...editing, productName: e.target.value })} />
                <TextField label="UoM Name" size="small" value={editing.uomName} onChange={(e) => setEditing({ ...editing, uomName: e.target.value })} />
                <TextField label="Output Qty" size="small" type="number" value={editing.outputQty} onChange={(e) => setEditing({ ...editing, outputQty: numField(e.target.value) })} />
                <TextField select label="BOM Type" size="small" value={editing.bomTypeId} onChange={(e) => setBomType(Number(e.target.value))}>
                  {BOM_TYPES.map((t) => <MenuItem key={t.bomTypeId} value={t.bomTypeId}>{t.bomTypeId} — {t.bomTypeName}</MenuItem>)}
                </TextField>
                <TextField label="Company Id" size="small" type="number" value={editing.companyId} onChange={(e) => setEditing({ ...editing, companyId: numField(e.target.value) })} />
                <TextField label="Esb Id" size="small" type="number" value={editing.esbId} onChange={(e) => setEditing({ ...editing, esbId: numField(e.target.value) })} />
                <TextField select label="Active" size="small" value={editing.flagActive ? '1' : '0'} onChange={(e) => setEditing({ ...editing, flagActive: e.target.value === '1' })}>
                  <MenuItem value="1">Active</MenuItem><MenuItem value="0">Inactive</MenuItem>
                </TextField>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Synced: <Box component="span" sx={{ fontFamily: 'monospace' }}>{editing.syncedAt}</Box></Typography>
                  <Typography variant="caption" color="text.secondary">Updated: <Box component="span" sx={{ fontFamily: 'monospace' }}>{editing.updatedAt}</Box></Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                BOM materials not yet synced — composition editing coming soon.
              </Alert>
</>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => setEditing(null)} color="inherit">Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Changes</Button>
        </Box>
      </Drawer>

      {/* Delete Confirmation Drawer */}
      <DataDrawer
        open={deleteDrawerOpen}
        mode="delete"
        title="BOM"
        subtitle={`Confirm deletion of ${deleting?.name}`}
        fields={deleteFields}
        values={deleting ? { code: deleting.code, name: deleting.name, productName: deleting.productName, bomTypeName: deleting.bomTypeName } : {}}
        onChange={() => {}}
        onSave={() => {}}
        onDelete={handleDeleteConfirm}
        onClose={() => { setDeleteDrawerOpen(false); setDeleting(null); }}
        saving={deleteLoading}
        deleteLoading={deleteLoading}
        width={520}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
