'use client';

import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { MOCK_BRANCHES, Branch } from '@/lib/mockData';
import { TableColumn } from '@/components/ModernTable';

const BRANCH_TYPE_OPTIONS = [
  { value: 'OUTLET', label: 'Outlet' },
  { value: 'HUB WH', label: 'Hub Warehouse' },
  { value: 'HUB CK', label: 'Hub Central Kitchen' },
  { value: 'HEAD OFFICE', label: 'Head Office' },
  { value: 'BULK ORDER', label: 'Bulk Order' },
  { value: 'COTR', label: 'COTR' },
];

const FIELDS: DrawerField[] = [
  { name: 'branchName', label: 'Branch Name', required: true, gridSpan: 2 },
  { name: 'branchCode', label: 'Branch Code', required: true },
  { name: 'branchType', label: 'Branch Type', type: 'select', options: BRANCH_TYPE_OPTIONS, required: true },
  { name: 'brandName', label: 'Brand Name', placeholder: 'e.g. Kopi Calf' },
  { name: 'address', label: 'Address', gridSpan: 2 },
  { name: 'phone', label: 'Phone' },
  { name: 'omsVersion', label: 'OMS Version', placeholder: 'e.g. v1.0.0' },
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
  branchType: 'OUTLET',
  brandName: 'Kopi Calf',
  address: '',
  phone: '',
  omsVersion: '',
  isActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function BranchPage() {
  const [data, setData] = useState<Branch[]>(() =>
    [...MOCK_BRANCHES].sort((a, b) => a.branchName.localeCompare(b.branchName))
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

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
    await new Promise((r) => setTimeout(r, 600));
    const now = fmtNow();
    if (drawerMode === 'add') {
      const newBranch: Branch = {
        branchID: Number(values.branchID),
        esbId: Number(values.esbId),
        branchName: String(values.branchName ?? ''),
        branchCode: String(values.branchCode ?? ''),
        branchType: values.branchType as Branch['branchType'],
        brandName: String(values.brandName ?? 'Kopi Calf'),
        address: String(values.address ?? ''),
        phone: String(values.phone ?? ''),
        omsVersion: String(values.omsVersion ?? ''),
        isActive: Boolean(values.isActive),
        syncedAt: fmtNow(),
        updatedAt: now,
      };
      setData((prev) => [...prev, newBranch].sort((a, b) => a.branchName.localeCompare(b.branchName)));
      showSnack('Branch added successfully');
    } else if (drawerMode === 'edit' && selected) {
      const updated: Branch = { ...selected, ...values, updatedAt: now } as Branch;
      setData((prev) => prev.map((d) => d.branchID === updated.branchID ? updated : d).sort((a, b) => a.branchName.localeCompare(b.branchName)));
      showSnack('Branch updated successfully');
    }
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => prev.filter((d) => d.branchID !== selected.branchID));
    showSnack('Branch deleted', 'error');
    setSaving(false);
    setDrawerOpen(false);
  };

  const typeBg = (t: string) =>
    t === 'OUTLET' ? 'primary.lighter' : t === 'HUB WH' ? 'secondary.lighter' : t === 'HEAD OFFICE' ? 'info.lighter' : t === 'HUB CK' ? 'warning.lighter' : 'grey.200';
  const typeFg = (t: string) =>
    t === 'OUTLET' ? 'primary.dark' : t === 'HUB WH' ? 'secondary.dark' : t === 'HEAD OFFICE' ? 'info.dark' : t === 'HUB CK' ? 'warning.dark' : 'text.primary';

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
      id: 'branchType', label: 'Type', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: typeBg(r.branchType), color: typeFg(r.branchType) }}>
          {r.branchType}
        </Box>
      ),
    },
    {
      id: 'brandName', label: 'Brand', hideOnMobile: true,
    },
    {
      id: 'isActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.isActive ? 'success.lighter' : 'grey.200', color: r.isActive ? 'success.dark' : 'text.secondary' }}>
          {r.isActive ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Branch), tooltip: 'Edit branch' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Branch), tooltip: 'Delete branch' },
  ];

  return (
    <Box>
      <PageHeader title="Branch" subtitle="Branch master data — outlets, HUB WH, HUB CK, and HEAD OFFICE locations" breadcrumbs={['Data', 'Branch']} />
      <ModernTable
        title="Branches"
        subtitle={`${data.length} total branches`}
        columns={columns}
        data={data}
        keyField="branchID"
        actions={actions}
        searchPlaceholder="Search by name, code, or brand..."
        searchFields={['branchName', 'branchCode', 'brandName']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No branches found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Branch"
      />
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
