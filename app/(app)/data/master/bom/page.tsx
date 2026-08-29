'use client';

import { useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Drawer,
  Button, TextField, MenuItem,
  Divider, Snackbar, Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import DataDrawer from '@/components/DataDrawer';
import ModernTable from '@/components/ModernTable';
import { TableColumn } from '@/components/ModernTable';
import { MOCK_BOM_DATA, MOCK_BOM_MATERIALS, BOM_TYPES, BomItem, BomMaterial } from '@/lib/mockData';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const numField = (value: string) => (value === '' ? 0 : Number(value));

export default function BomPage() {
  const [boms, setBoms] = useState<BomItem[]>(() =>
    [...MOCK_BOM_DATA].sort((a, b) => a.name.localeCompare(b.name))
  );
  const [materials, setMaterials] = useState<BomMaterial[]>(() => [...MOCK_BOM_MATERIALS]);

  const [editing, setEditing] = useState<BomItem | null>(null);
  const [editMaterials, setEditMaterials] = useState<BomMaterial[]>([]);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  // Delete drawer state
  const [deleting, setDeleting] = useState<BomItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);

  const hppByBom = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of materials) {
      map.set(m.bomID, (map.get(m.bomID) ?? 0) + m.totalCost);
    }
    return map;
  }, [materials]);

  const handleDeleteOpen = (row: BomItem) => {
    setDeleting(row);
    setDeleteDrawerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setBoms((prev) => prev.filter((b) => b.bomId !== deleting.bomId));
    setDeleteLoading(false);
    setDeleteDrawerOpen(false);
    setDeleting(null);
    setToast({ open: true, msg: 'BOM deleted successfully', sev: 'error' });
  };

  const openEdit = (bom: BomItem) => {
    setEditing({ ...bom });
    setEditMaterials(materials.filter((m) => m.bomID === bom.bomId).map((m) => ({ ...m })));
  };

  const updateMaterial = (idx: number, field: 'qty' | 'hpp', value: string) => {
    setEditMaterials((prev) =>
      prev.map((m, i) => {
        if (i !== idx) return m;
        const next = { ...m, [field]: numField(value) };
        next.totalCost = next.qty * next.hpp;
        return next;
      })
    );
  };

  const handleSave = () => {
    if (!editing) return;
    const saved: BomItem = { ...editing, updatedAt: fmtNow() };
    setBoms((prev) => {
      const updated = prev.map((b) => (b.bomId === saved.bomId ? saved : b));
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });
    setMaterials((prev) => {
      const others = prev.filter((m) => m.bomID !== saved.bomId);
      return [...others, ...editMaterials];
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

  const columns: TableColumn<BomItem>[] = useMemo(() => [
    {
      id: 'bomId', label: 'Id', width: 55, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{r.bomId}</Box>,
    },
    {
      id: 'code', label: 'Code', width: 100, hideOnMobile: true,
      render: (r) => <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{r.code}</Box>,
    },
    {
      id: 'name', label: 'BOM Name', sortable: true,
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
            HPP: {fmtCurr(hppByBom.get(r.bomId) ?? 0)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'productName', label: 'Product', sortable: true, hideOnMobile: true,
    },
    {
      id: 'outputQty', label: 'Output', align: 'center', hideOnMobile: true,
      render: (r) => <Box sx={{ fontWeight: 600, fontSize: 14 }}>{r.outputQty} {r.uomName}</Box>,
    },
    {
      id: 'bomTypeName', label: 'Type', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.bomTypeId === 1 ? 'primary.lighter' : 'secondary.lighter', color: r.bomTypeId === 1 ? 'primary.dark' : 'secondary.dark' }}>
          {r.bomTypeName}
        </Box>
      ),
    },
    {
      id: 'flagActive', label: 'Status', align: 'center', sortable: true,
      render: (r) => (
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: 12, bgcolor: r.flagActive ? 'success.lighter' : 'grey.200', color: r.flagActive ? 'success.dark' : 'text.secondary' }}>
          {r.flagActive ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
  ], [hppByBom]);

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, color: 'primary' as const, onClick: (r: unknown) => openEdit(r as BomItem), tooltip: 'Edit BOM' },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' as const, onClick: (r: unknown) => handleDeleteOpen(r as BomItem), tooltip: 'Delete BOM' },
  ];

  return (
    <Box>
      <PageHeader title="Bill of Material" subtitle="Recipe master data — BOM with material composition and HPP calculation" breadcrumbs={['Data', 'BOM']} />
      <ModernTable
        title="BOM Recipes"
        subtitle={`${boms.length} total recipes`}
        columns={columns}
        data={boms}
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
            <Typography variant="caption" color="text.secondary">Adjust BOM details and material composition</Typography>
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
                <TextField label="Uom Name" size="small" value={editing.uomName} onChange={(e) => setEditing({ ...editing, uomName: e.target.value })} />
                <TextField label="Output Qty" size="small" type="number" value={editing.outputQty} onChange={(e) => setEditing({ ...editing, outputQty: numField(e.target.value) })} />
                <TextField select label="Bom Type" size="small" value={editing.bomTypeId} onChange={(e) => setBomType(Number(e.target.value))}>
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

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Material ({editMaterials.length}) — total:{' '}
                  <Typography component="span" variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                    {fmtCurr(editMaterials.reduce((s, m) => s + m.totalCost, 0))}
                  </Typography>
                </Typography>
              </Box>
              <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Material</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>Satuan</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>HPP/Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editMaterials.map((m, idx) => (
                      <TableRow key={m.materialCode} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2">{m.materialName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{m.materialCode}</Typography>
                        </TableCell>
                        <TableCell align="center"><Typography variant="caption">{m.uomName}</Typography></TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={m.qty} onChange={(e) => updateMaterial(idx, 'qty', e.target.value)} sx={{ width: 100 }} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={m.hpp} onChange={(e) => updateMaterial(idx, 'hpp', e.target.value)} sx={{ width: 130 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtCurr(m.totalCost)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
