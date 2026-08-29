'use client';

import { useState } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { MOCK_CATEGORIES, Category } from '@/lib/mockData';
import { TableColumn } from '@/components/ModernTable';

const TYPE_OPTIONS = [
  { value: 'Inventory', label: 'Inventory' },
  { value: 'Non Inventory', label: 'Non Inventory' },
  { value: 'Asset', label: 'Asset' },
];

const FIELDS: DrawerField[] = [
  { name: 'name', label: 'Name', required: true, gridSpan: 2 },
  { name: 'code', label: 'Code', placeholder: 'e.g. FG-001' },
  { name: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
  { name: 'typeId', label: 'Type ID', type: 'number', disabled: true },
  { name: 'notes', label: 'Notes', placeholder: 'Optional notes...', gridSpan: 2 },
  { name: 'flagActive', label: 'Active', type: 'switch' },
];

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const emptyValues = (): Record<string, unknown> => ({
  name: '',
  code: '',
  type: 'Inventory',
  typeId: 0,
  notes: '',
  flagActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

const typeToId = (t: string) => t === 'Inventory' ? 1 : t === 'Non Inventory' ? 2 : t === 'Asset' ? 3 : 0;

export default function KategoriPage() {
  const [data, setData] = useState<Category[]>(() =>
    [...MOCK_CATEGORIES].sort((a, b) => a.name.localeCompare(b.name))
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

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
      if (name === 'type') next.typeId = typeToId(String(value));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const now = fmtNow();
    if (drawerMode === 'add') {
      const newCat: Category = {
        categoryId: Number(values.categoryId),
        esbId: Number(values.esbId),
        code: String(values.code ?? ''),
        name: String(values.name ?? ''),
        type: String(values.type ?? 'Inventory'),
        typeId: Number(values.typeId ?? 0),
        flagActive: Boolean(values.flagActive),
        notes: String(values.notes ?? ''),
        syncedAt: String(values.syncedAt ?? now),
        updatedAt: now,
      };
      setData((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      showSnack('Category added successfully');
    } else if (drawerMode === 'edit' && selected) {
      const updated: Category = { ...selected, ...values, updatedAt: now } as Category;
      setData((prev) => prev.map((d) => d.categoryId === updated.categoryId ? updated : d).sort((a, b) => a.name.localeCompare(b.name)));
      showSnack('Category updated successfully');
    }
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => prev.filter((d) => d.categoryId !== selected.categoryId));
    showSnack('Category deleted', 'error');
    setSaving(false);
    setDrawerOpen(false);
  };

  const columns: TableColumn<Category>[] = useMemo(() => [
    {
      id: 'categoryId', label: 'Id', width: 60, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.categoryId}</Box>,
    },
    {
      id: 'esbId', label: 'ESB Id', width: 70, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.esbId}</Box>,
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
      id: 'type', label: 'Type', align: 'center', sortable: true,
      render: (r) => {
        const bg = r.type === 'Inventory' ? 'primary.lighter' : r.type === 'Non Inventory' ? 'secondary.lighter' : 'info.lighter';
        const fg = r.type === 'Inventory' ? 'primary.dark' : r.type === 'Non Inventory' ? 'secondary.dark' : 'info.dark';
        return <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: bg, color: fg }}>{r.type}</Box>;
      },
    },
    {
      id: 'flagActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.flagActive ? 'success.lighter' : 'grey.200', color: r.flagActive ? 'success.dark' : 'text.secondary' }}>
          {r.flagActive ? 'Active' : 'Inactive'}
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

  return (
    <Box>
      <PageHeader title="Category" subtitle="Product category master data — main categories and type grouping" breadcrumbs={['Data', 'Category']} />
      <ModernTable
        title="Categories"
        subtitle={`${data.length} total categories`}
        columns={columns}
        data={data}
        keyField="categoryId"
        actions={actions}
        searchPlaceholder="Search by name, code, or notes..."
        searchFields={['name', 'code', 'type', 'notes']}
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
