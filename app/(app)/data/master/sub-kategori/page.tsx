'use client';

import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import ModernTable from '@/components/ModernTable';
import DataDrawer, { DrawerField, DrawerMode } from '@/components/DataDrawer';
import { TableColumn } from '@/components/ModernTable';
import { MOCK_SUB_CATEGORIES, MOCK_CATEGORIES, SubCategory } from '@/lib/mockData';

const FIELDS: DrawerField[] = [
  { name: 'name', label: 'Sub Category Name', required: true, gridSpan: 2 },
  { name: 'code', label: 'Code', placeholder: 'e.g. SUBCAT-01' },
  { name: 'categoryId', label: 'Category', type: 'select', options: [], required: true },
  { name: 'deadStock', label: 'Dead Stock (days)', type: 'number', required: true },
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
  categoryId: '',
  categoryName: '',
  deadStock: 30,
  flagActive: true,
  syncedAt: fmtNow(),
  updatedAt: fmtNow(),
});

export default function SubKategoriPage() {
  const [data, setData] = useState<SubCategory[]>(() =>
    [...MOCK_SUB_CATEGORIES].sort((a, b) => a.name.localeCompare(b.name))
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<SubCategory | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const categoryOptions = useMemo(() =>
    MOCK_CATEGORIES.map((c) => ({ value: c.categoryId, label: c.name })),
    []
  );

  const fieldsWithOptions = useMemo(() =>
    FIELDS.map((f) => f.name === 'categoryId' ? { ...f, options: categoryOptions } : f),
    [categoryOptions]
  );

  const getCategoryName = (categoryId: number): string => {
    const cat = MOCK_CATEGORIES.find((c) => c.categoryId === categoryId || c.esbId === categoryId);
    return cat?.name ?? `Cat ${categoryId}`;
  };

  const showSnack = (msg: string, sev: 'success' | 'error' = 'success') => {
    setSnack({ open: true, msg, sev });
  };

  const handleOpen = (mode: DrawerMode, row?: SubCategory) => {
    setDrawerMode(mode);
    setSelected(row ?? null);
    if (mode === 'add') {
      setValues({ ...emptyValues(), esbId: 0, subCategoryId: data.length ? Math.max(...data.map((d) => d.subCategoryId)) + 1 : 1 });
    } else if (row) {
      setValues({ ...row, categoryId: row.categoryId });
    }
    setDrawerOpen(true);
  };

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'categoryId') {
        const cat = MOCK_CATEGORIES.find((c) => c.categoryId === Number(value));
        next.categoryName = cat?.name ?? '';
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const now = fmtNow();
    if (drawerMode === 'add') {
      const cat = MOCK_CATEGORIES.find((c) => c.categoryId === Number(values.categoryId));
      const newSub: SubCategory = {
        subCategoryId: Number(values.subCategoryId),
        esbId: Number(values.esbId),
        code: String(values.code ?? ''),
        name: String(values.name ?? ''),
        categoryId: Number(values.categoryId),
        categoryName: cat?.name ?? '',
        deadStock: Number(values.deadStock ?? 30),
        flagActive: Boolean(values.flagActive),
        syncedAt: fmtNow(),
        updatedAt: now,
      };
      setData((prev) => [...prev, newSub].sort((a, b) => a.name.localeCompare(b.name)));
      showSnack('Sub Category added successfully');
    } else if (drawerMode === 'edit' && selected) {
      const updated: SubCategory = { ...selected, ...values, categoryId: Number(values.categoryId), updatedAt: now } as SubCategory;
      setData((prev) => prev.map((d) => d.subCategoryId === updated.subCategoryId ? updated : d).sort((a, b) => a.name.localeCompare(b.name)));
      showSnack('Sub Category updated successfully');
    }
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => prev.filter((d) => d.subCategoryId !== selected.subCategoryId));
    showSnack('Sub Category deleted', 'error');
    setSaving(false);
    setDrawerOpen(false);
  };

  const columns: TableColumn<SubCategory>[] = useMemo(() => [
    {
      id: 'subCategoryId', label: 'Id', width: 60, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.subCategoryId}</Box>,
    },
    {
      id: 'esbId', label: 'ESB Id', width: 70, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.esbId}</Box>,
    },
    {
      id: 'name', label: 'Sub Category Name', sortable: true,
      render: (r) => <Box sx={{ fontWeight: 500, fontSize: 14 }}>{r.name}</Box>,
    },
    {
      id: 'categoryId', label: 'Category', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
          {getCategoryName(r.categoryId)}
        </Box>
      ),
    },
    {
      id: 'deadStock', label: 'Dead Stock', align: 'center', hideOnMobile: true,
      render: (r) => {
        const days = r.deadStock;
        const bg = days <= 3 ? 'error.lighter' : days <= 7 ? 'warning.lighter' : 'grey.100';
        const fg = days <= 3 ? 'error.dark' : days <= 7 ? 'warning.dark' : 'text.primary';
        return <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: bg, color: fg }}>{days} days</Box>;
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
  ], []);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => handleOpen('edit', r as SubCategory), tooltip: 'Edit sub category' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleOpen('delete', r as SubCategory), tooltip: 'Delete sub category' },
  ];

  return (
    <Box>
      <PageHeader title="Sub Category" subtitle="Sub category master data — linked to categories with dead stock threshold settings" breadcrumbs={['Data', 'Sub Category']} />
      <ModernTable
        title="Sub Categories"
        subtitle={`${data.length} total sub categories`}
        columns={columns}
        data={data}
        keyField="subCategoryId"
        actions={actions}
        searchPlaceholder="Search by name or category..."
        searchFields={['name', 'categoryName']}
        pagination={true}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No sub categories found."
        onAdd={() => handleOpen('add')}
        addButtonLabel="Add Sub Category"
      />
      <DataDrawer
        open={drawerOpen}
        mode={drawerMode}
        title="Sub Category"
        subtitle={drawerMode === 'add' ? 'Fill in the sub category details' : drawerMode === 'edit' ? `Editing: ${selected?.name}` : `Confirm deletion of ${selected?.name}`}
        fields={fieldsWithOptions}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDrawerOpen(false)}
        saving={saving}
        deleteLoading={saving}
        saveLabel={drawerMode === 'add' ? 'Add Sub Category' : 'Save Changes'}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
