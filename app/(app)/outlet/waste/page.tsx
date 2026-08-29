'use client';

import { useRef, useState } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem,
  Snackbar, Alert, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid as MuiGrid,
  Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Select,
} from '@mui/material';
import {
  Save as SaveIcon, Send as SendIcon, Add as AddIcon,
  Delete as DeleteIcon, AddPhotoAlternate as AddPhotoAlternateIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { WasteDetail, WasteReason, WASTE_PRODUCTS, WASTE_REASONS } from '@/lib/mockData';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const numField = (v: string) => (v === '' ? 0 : Number(v));

const REASON_COLORS: Record<WasteReason, { bg: string; color: string }> = {
  expired: { bg: 'warning.lighter', color: 'warning.dark' },
  damaged: { bg: 'error.lighter', color: 'error.dark' },
  spill: { bg: 'info.lighter', color: 'info.dark' },
  other: { bg: 'grey.200', color: 'text.secondary' },
};

export default function OutletWastePage() {
  const [date, setDate] = useState(fmtNow());
  const [outletName] = useState('Kopi Calf Cipete Jakarta Selatan');
  const [picName] = useState('Ahmad Fauzi');
  const [baristaName] = useState('Rizki Pratama');
  const [details, setDetails] = useState<WasteDetail[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });
  const [photosByDetail, setPhotosByDetail] = useState<Record<number, string[]>>({});

  const totalValue = details.reduce((s, d) => s + d.totalValue, 0);
  const wasteItems = details.filter((d) => d.qty > 0);

  const addProduct = (productCode: string) => {
    const product = WASTE_PRODUCTS.find((p) => p.productCode === productCode);
    if (!product) return;
    if (details.find((d) => d.productCode === productCode)) {
      setToast({ open: true, msg: 'Product already exists in the list', sev: 'error' });
      return;
    }
    const newDetail: WasteDetail = {
      detailId: Date.now(),
      wasteId: 0,
      productCode: product.productCode,
      productName: product.productName,
      categoryName: product.categoryName,
      uomName: product.uomName,
      qty: 0,
      unitPrice: product.unitPrice,
      totalValue: 0,
      reason: 'other' as WasteReason,
      notes: '',
    };
    setDetails((prev) => [...prev, newDetail]);
    setAddDialogOpen(false);
  };

  const removeProduct = (detailId: number) => {
    setDetails((prev) => prev.filter((d) => d.detailId !== detailId));
    setPhotosByDetail((prev) => {
      const next = { ...prev };
      delete next[detailId];
      return next;
    });
  };

  const updateDetail = (detailId: number, field: 'qty' | 'reason' | 'notes', value: string | number) => {
    setDetails((prev) =>
      prev.map((d) => {
        if (d.detailId !== detailId) return d;
        const next = { ...d, [field]: value };
        if (field === 'qty') {
          next.totalValue = Math.round(next.qty * next.unitPrice);
        }
        return next;
      })
    );
  };

  const handlePhotosChange = (detailId: number, photos: string[]) => {
    setPhotosByDetail((prev) => ({ ...prev, [detailId]: photos }));
  };

  const handleSave = (submit: boolean) => {
    if (details.length === 0) {
      setToast({ open: true, msg: 'Add at least 1 waste product', sev: 'error' });
      return;
    }
    const hasEmptyPhotos = details.some(
      (d) => d.qty > 0 && (!photosByDetail[d.detailId] || photosByDetail[d.detailId].length < 3)
    );
    if (submit && hasEmptyPhotos) {
      setToast({ open: true, msg: 'Each product with waste requires a minimum of 3 photo uploads', sev: 'error' });
      return;
    }
    setToast({
      open: true,
      msg: submit ? 'Waste record submitted successfully' : 'Draft saved successfully',
      sev: 'success',
    });
  };

  const availableToAdd = WASTE_PRODUCTS.filter(
    (p) => !details.find((d) => d.productCode === p.productCode)
  );

  return (
    <Box>
      <PageHeader
        title="Waste Form"
        subtitle="Record daily waste per product — for Barista & PIC Outlet"
        breadcrumbs={['Outlet Forms', 'Waste']}
      />

      <Paper
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 3, bgcolor: 'error.main' }} />

        <Box sx={{ p: 2 }}>
          {/* Header row — date + info + add button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Left: outlet + date + PIC + barista */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, auto)' },
                gap: 1,
                flex: 1,
              }}
            >
              <TextField
                label="Outlet"
                value={outletName}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />,
                  },
                  htmlInput: { readOnly: true },
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
              />
              <TextField
                label="Date"
                type="date"
                size="small"
                value={date}
                slotProps={{
                  input: {
                    startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />,
                  },
                  htmlInput: { readOnly: true },
                  inputLabel: { shrink: true },
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
              />
              <TextField
                label="PIC"
                value={picName}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />,
                  },
                  htmlInput: { readOnly: true },
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
              />
              <TextField
                label="Barista"
                value={baristaName}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />,
                  },
                  htmlInput: { readOnly: true },
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
              />
            </Box>

            {/* Right: add product */}
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Add Product
            </Button>
          </Box>

          {/* Total loss strip */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 1.5,
              py: 1,
              mb: 2,
              bgcolor: 'error.lighter',
              border: '1px solid',
              borderColor: 'error.light',
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Loss Value
              </Typography>
              <Typography sx={{ fontWeight: 800, color: 'error.dark', fontFamily: 'monospace', fontSize: 16 }}>
                {fmtCurr(totalValue)}
              </Typography>
            </Box>
            <Box sx={{ borderLeft: '1px solid', borderColor: 'error.light', pl: 2 }}>
              <Typography variant="caption" sx={{ color: 'error.dark', fontSize: 10 }}>
                Items with waste
              </Typography>
              <Typography sx={{ fontWeight: 700, color: 'error.dark', fontSize: 14 }}>
                {wasteItems.length}
              </Typography>
            </Box>
            <Chip
              label={`${details.length} product${details.length !== 1 ? 's' : ''} added`}
              size="small"
              sx={{ ml: 'auto', fontSize: 11, fontWeight: 600, bgcolor: 'white', color: 'error.dark' }}
            />
          </Box>

          {/* Empty state */}
          {details.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderStyle: 'dashed',
                borderColor: 'warning.main',
                bgcolor: 'warning.lighter',
                textAlign: 'center',
                cursor: 'pointer',
                mb: 2,
                '&:hover': { bgcolor: 'warning.light' },
              }}
              onClick={() => setAddDialogOpen(true)}
            >
              <AddIcon sx={{ fontSize: 32, color: 'warning.dark', mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600, fontSize: 13 }}>
                Click to add a waste product
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.dark' }}>
                Select from available products
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Detail table */}
              <TableContainer
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  maxHeight: 420,
                }}
              >
                <Table size="small" stickyHeader sx={{ minWidth: 680 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: 'grey.50', zIndex: 2, minWidth: 160, borderRight: '1px solid', borderColor: 'divider', py: 0.75 }}>
                        Product
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 44 }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'right', py: 0.75, minWidth: 72 }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 72, bgcolor: 'error.lighter', color: 'error.dark' }}>
                        Qty *
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'right', py: 0.75, minWidth: 72 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', py: 0.75, minWidth: 110, bgcolor: 'warning.lighter', color: 'warning.dark' }}>
                        Reason *
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', py: 0.75, minWidth: 110 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 108, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
                        Photo *
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 36 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((d) => {
                      const rc = REASON_COLORS[d.reason];
                      const photos = photosByDetail[d.detailId] || [];
                      const photoCount = photos.length;
                      const hasQty = d.qty > 0;
                      const hasEnoughPhotos = photoCount >= 3;

                      return (
                        <TableRow key={d.detailId} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', zIndex: 1, py: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{d.productName}</Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled', fontSize: 10 }}>{d.productCode}</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 0.5 }}><Typography variant="caption" sx={{ fontSize: 11 }}>{d.uomName}</Typography></TableCell>
                          <TableCell align="right" sx={{ py: 0.5 }}><Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{fmtCurr(d.unitPrice)}</Typography></TableCell>
                          <TableCell align="center" sx={{ py: 0.5, bgcolor: hasQty ? 'error.lighter' : undefined }}>
                            <TextField
                              size="small"
                              type="number"
                              value={d.qty}
                              onChange={(e) => updateDetail(d.detailId, 'qty', numField(e.target.value))}
                              sx={{ width: 64 }}
                              slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 0.5 }}>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: d.totalValue > 0 ? 'error.main' : 'text.disabled' }}
                            >
                              {d.totalValue > 0 ? fmtCurr(d.totalValue) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            <Select
                              size="small"
                              value={d.reason}
                              onChange={(e) => updateDetail(d.detailId, 'reason', e.target.value)}
                              sx={{ fontSize: 11, minWidth: 96 }}
                              renderValue={(v) => (
                                <Box component="span" sx={{ px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: 10, fontWeight: 700, bgcolor: REASON_COLORS[v as WasteReason].bg, color: REASON_COLORS[v as WasteReason].color }}>
                                  {v}
                                </Box>
                              )}
                            >
                              {WASTE_REASONS.map((r) => (
                                <MenuItem key={r.value} value={r.value}>
                                  <Box component="span" sx={{ px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: 10, fontWeight: 700, bgcolor: REASON_COLORS[r.value].bg, color: REASON_COLORS[r.value].color }}>
                                    {r.label}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            <TextField
                              size="small"
                              value={d.notes}
                              onChange={(e) => updateDetail(d.detailId, 'notes', e.target.value)}
                              placeholder="—"
                              sx={{ width: '100%', minWidth: 80 }}
                              slotProps={{ htmlInput: { style: { fontSize: 12 } } }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 0.5, bgcolor: 'grey.50' }}>
                            <MiniPhotoPicker
                              photos={photos}
                              onPhotosChange={(p) => handlePhotosChange(d.detailId, p)}
                              minPhotos={3}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 0.5 }}>
                            <Tooltip title="Remove">
                              <IconButton size="small" color="error" onClick={() => removeProduct(d.detailId)} sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{ fontSize: 11 }}
                >
                  + Add another
                </Button>
              </Box>

              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 10, mb: 1 }}>
                * Enter wasted qty. Select reason. Min 3 photos per wasted product.
              </Typography>
            </>
          )}

          {/* Action bar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button variant="outlined" size="small" startIcon={<SaveIcon sx={{ fontSize: 15 }} />} onClick={() => handleSave(false)}>
              Save Draft
            </Button>
            <Button variant="contained" color="error" size="small" startIcon={<SendIcon sx={{ fontSize: 15 }} />} onClick={() => handleSave(true)}>
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 15 }}>Add Waste Product</DialogTitle>
        <DialogContent dividers>
          {availableToAdd.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="text.secondary" variant="body2">All products have been added</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
              {availableToAdd.map((p) => (
                <Paper
                  key={p.productCode}
                  variant="outlined"
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
                    transition: 'all 0.15s',
                  }}
                  onClick={() => addProduct(p.productCode)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{p.productName}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled', fontSize: 10 }}>{p.productCode}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 11 }}>{fmtCurr(p.unitPrice)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontSize: 10 }}>{p.uomName}</Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} size="small">Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// --- Mini photo picker per row ---
interface MiniPhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  minPhotos: number;
}

function MiniPhotoPicker({ photos, onPhotosChange, minPhotos }: MiniPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const meetsMin = photos.length >= minPhotos;

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - photos.length;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onPhotosChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
    if (inputRef.current) inputRef.current.value = '';
    e.target.value = '';
  };

  const handleRemove = (idx: number) => {
    onPhotosChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAdd} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
        <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', justifyContent: 'center' }}>
          {photos.map((src, idx) => (
            <Box key={idx} sx={{ position: 'relative', width: 28, height: 28 }}>
              <Box
                component="img"
                src={src}
                alt={`Photo ${idx + 1}`}
                sx={{ width: 28, height: 28, borderRadius: 0.5, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemove(idx)}
                sx={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  bgcolor: 'error.main',
                  color: '#fff',
                  width: 14,
                  height: 14,
                  '&:hover': { bgcolor: 'error.dark' },
                  '& .MuiSvgIcon-root': { fontSize: 9 },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
        <Chip
          label={`${photos.length}/${minPhotos}`}
          size="small"
          color={meetsMin ? 'success' : 'default'}
          sx={{ fontSize: 9, height: 16, fontWeight: 700 }}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddPhotoAlternateIcon sx={{ fontSize: 11 }} />}
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= 5}
          sx={{ fontSize: 9, py: 0, px: 0.75, minWidth: 0, height: 20 }}
        >
          Upload
        </Button>
      </Box>
    </Box>
  );
}
