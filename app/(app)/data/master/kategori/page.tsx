'use client';

import { useState, useEffect } from 'react';
import { Box, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { Category } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';
import { TableColumn } from '@/components/ModernTable';

const TYPE_OPTIONS = [
  { value: 'Beverage', label: 'Beverage' },
  { value: 'Food', label: 'Food' },
  { value: 'Ingredient', label: 'Ingredient' },
  { value: 'Other', label: 'Other' },
];

const FIELDS: DrawerField[] = [
  { name: 'name', label: 'Name', required: true, gridSpan: 2 },
  { name: 'code', label: 'Code', placeholder: 'e.g. FG-001' },
  { name: 'typeName', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
  { name: 'typeId', label: 'Type ID', type: 'number', disabled: true },
  { name: 'notes', label: 'Notes', placeholder: 'Optional notes...', gridSpan: 2 },
  { name: 'flagActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const typeToId = (t: string) =>
  t === 'Beverage' ? 1 : t === 'Food' ? 2 : t === 'Ingredient' ? 3 : 0;

const emptyValues = (): Record<string, unknown> => ({
  name: '',
  code: '',
  typeName: 'Beverage',
  typeId: 0,
  notes: '',
  flagActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function KategoriPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Beverage' | 'Food' | 'Ingredient' | 'Other'>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  useEffect(() => {
    apiClient.getCategories()
      .then((cats) => setData(cats.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (statusFilter !== 'all' && ((r.flagActive ?? r.isActive ?? true) !== (statusFilter === 'active'))) return false;
      if (typeFilter !== 'all' && r.typeName !== typeFilter) return false;
      return true;
    });
  }, [data, statusFilter, typeFilter]);

  const handleOpen = (mode: DrawerMode, row?: Category) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), esbId: 0, categoryId: data.length ? Math.max(...data.map((d) => d.categoryId)) + 1 : 1 });
    } else if (row) {
      setValues({ ...row });
    }
    setDrawerOpen(true);
  };

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'typeName') next.typeId = typeToId(String(value));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const now = fmtNow();
      if (drawerMode === 'add') {
        const newCat: Category = {
          categoryId: Number(values.categoryId),
          esbId: Number(values.esbId ?? 0),
          code: String(values.code ?? ''),
          name: String(values.name ?? ''),
          typeName: String(values.typeName ?? 'Beverage') as Category['typeName'],
          typeId: Number(values.typeId ?? 0),
          flagActive: Boolean(values.flagActive),
          notes: String(values.notes ?? ''),
          syncedAt: fmtNow(),
          updatedAt: now,
          parentId: null,
          isActive: true,
        };
        setData((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
        showSnack('Category added successfully');
      } else if (drawerMode === 'edit' && selected) {
        const updated: Category = { ...selected, ...values, updatedAt: now } as Category;
        setData((prev) => prev.map((d) => d.categoryId === updated.categoryId ? updated : d).sort((a, b) => a.name.localeCompare(b.name)));
        showSnack('Category updated successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      setData((prev) => prev.filter((d) => d.categoryId !== selected.categoryId));
      showSnack('Category deleted', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
  };

  const columns: TableColumn<Category>[] = useMemo(() => [
    {
      id: 'categoryId', label: 'Id', width: 60, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.categoryId}</Box>,
    },
    {
      id: 'esbId', label: 'ESB Id', width: 70, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.esbId ?? 0}</Box>,
    },
    {
      id: 'name', label: 'Name', sortable: true,
      render: (r) => <Box sx={{ fontWeight: 500, fontSize: 14 }}>{r.name}</Box>,
    },
    {
      id: 'code', label: 'Code', width: 100, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{r.code || '-'}</Box>,
    },
    {
      id: 'typeName', label: 'Type', align: 'center', sortable: true,
      render: (r) => {
        const bg = r.typeName === 'Beverage' ? 'primary.lighter' : r.typeName === 'Food' ? 'secondary.lighter' : r.typeName === 'Ingredient' ? 'info.lighter' : 'grey.200';
        const fg = r.typeName === 'Beverage' ? 'primary.dark' : r.typeName === 'Food' ? 'secondary.dark' : r.typeName === 'Ingredient' ? 'info.dark' : 'text.primary';
        return <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: bg, color: fg }}>{r.typeName}</Box>;
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
    {
      id: 'notes', label: 'Notes', hideOnMobile: true,
      render: (r) => <Box sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '-'}</Box>,
    },
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as Category), tooltip: 'Edit category' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as Category), tooltip: 'Delete category' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Category" subtitle="Product category master data — main categories and type grouping" breadcrumbs={['Data', 'Category']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Category" subtitle="Product category master data — main categories and type grouping" breadcrumbs={['Data', 'Category']} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Category" subtitle="Product category master data — main categories and type grouping" breadcrumbs={['Data', 'Category']} />
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
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Beverage' | 'Food' | 'Ingredient' | 'Other')}>
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Beverage">Beverage</MenuItem>
            <MenuItem value="Food">Food</MenuItem>
            <MenuItem value="Ingredient">Ingredient</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ModernTable
        title="Categories"
        subtitle={`${filtered.length} of ${data.length} categories`}
        columns={columns}
        data={filtered}
        keyField="categoryId"
        actions={actions}
        searchPlaceholder="Search by name, code, or notes..."
        searchFields={['name', 'code', 'typeName', 'notes']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No categories found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Category"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Category"
        subtitle={drawerMode === 'add' ? 'Fill in the category details' : drawerMode === 'edit' ? `Editing: ${selected?.name}` : `Confirm deletion of ${selected?.name}`}
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Category' : 'Save Changes'}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
