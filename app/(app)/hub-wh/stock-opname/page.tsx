'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Box, Typography, Button, TextField,
  Snackbar, Alert, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, ToggleButtonGroup,
  ToggleButton, Grid as MuiGrid, IconButton,
} from '@mui/material';
import {
  Save as SaveIcon, Send as SendIcon, Lock as LockIcon,
  Delete as DeleteIcon, AddPhotoAlternate as AddPhotoAlternateIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { RAW_MATERIAL_PRODUCTS } from '@/lib/mockData';

interface HubStockDetail {
  detailId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  uomName: string;
  systemStock: number;
  actualStock: number;
  varianceQty: number;
  unitPrice: number;
  notes: string;
}

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type PeriodType = 'daily' | 'weekly' | 'monthly';

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const numField = (v: string) => (v === '' ? 0 : Number(v));

function buildDetails(): HubStockDetail[] {
  return RAW_MATERIAL_PRODUCTS.map((p, i) => {
    const systemStock = Math.floor(Math.random() * 100) + 20;
    return {
      detailId: i + 1,
      productCode: p.productCode,
      productName: p.productName,
      categoryName: p.categoryName,
      uomName: p.uomName,
      systemStock,
      actualStock: systemStock,
      varianceQty: 0,
      unitPrice: p.unitPrice,
      notes: '',
    };
  });
}

export default function HubWhStockOpnamePage() {
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [date, setDate] = useState(fmtNow());
  const [startDate, setStartDate] = useState(fmtNow());
  const [endDate, setEndDate] = useState(fmtNow());
  const [outletName] = useState('HUB WH - Central Warehouse Jakarta');
  const [picName] = useState('Supply Chain & Cost Control Team');
  const [details, setDetails] = useState<HubStockDetail[]>(() => buildDetails());
  const [photosByDetail, setPhotosByDetail] = useState<Record<number, string[]>>({});
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const handlePeriodChange = (v: PeriodType) => {
    setPeriodType(v);
    const today = fmtNow();
    setDate(today);
    setStartDate(today);
    setEndDate(today);
  };

  const updateDetail = (idx: number, field: keyof HubStockDetail, value: number | string) => {
    setDetails((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        const next = { ...d, [field]: value };
        if (field === 'actualStock') {
          next.varianceQty = Number(next.actualStock) - next.systemStock;
        }
        return next;
      })
    );
  };

  const handlePhotosChange = (detailId: number, photos: string[]) => {
    setPhotosByDetail((prev) => ({ ...prev, [detailId]: photos }));
  };

  const handleSave = (submit: boolean) => {
    const hasEmptyPhotos = details.some(
      (d) => !photosByDetail[d.detailId] || photosByDetail[d.detailId].length < 3
    );
    if (submit && hasEmptyPhotos) {
      setToast({ open: true, msg: 'Each product requires a minimum of 3 photo uploads', sev: 'error' });
      return;
    }
    setToast({
      open: true,
      msg: submit ? 'Hub Warehouse Stock Opname submitted successfully' : 'Draft saved successfully',
      sev: 'success',
    });
  };

  const totals = useMemo(() => {
    const varianceItems = details.filter((d) => d.varianceQty !== 0).length;
    const varianceValue = details.reduce((s, d) => s + (d.varianceQty * d.unitPrice), 0);
    return { varianceItems, varianceValue };
  }, [details]);

  const photosComplete = details.every(
    (d) => photosByDetail[d.detailId] && photosByDetail[d.detailId].length >= 3
  );

  return (
    <Box>
      <PageHeader
        title="Hub Warehouse Stock Opname"
        subtitle="HUB WH stock opname entry form — Supply Chain & Cost Control team"
        breadcrumbs={['Hub Warehouse', 'Stock Opname']}
      />

      <Paper
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Top accent bar — hub blue brand */}
        <Box sx={{ height: 3, bgcolor: '#1A4080' }} />

        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          {/* Period selector — compact strip */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Period
            </Typography>
            <ToggleButtonGroup
              value={periodType}
              exclusive
              onChange={(_, v) => v && handlePeriodChange(v)}
              size="small"
              sx={{
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '6px !important',
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: '#1A4080',
                    color: '#fff',
                    borderColor: '#1A4080',
                    '&:hover': { bgcolor: '#152d5c' },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                },
              }}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Date chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {periodType === 'daily' ? (
                <Chip
                  icon={<LockIcon style={{ fontSize: 12 }} />}
                  label={date}
                  size="small"
                  color="default"
                  variant="outlined"
                  sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}
                />
              ) : (
                <Chip
                  label={`${startDate} → ${endDate}`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>

          {/* Form fields — responsive grid: 1 col mobile, 2 col tablet, 4 col desktop */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 1.5,
              mb: 2,
              p: 1.5,
              bgcolor: '#F0F4FA',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <TextField
              label="Hub Warehouse"
              value={outletName}
              size="small"
              slotProps={{
                input: { startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} /> },
                htmlInput: { readOnly: true },
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
            />
            {periodType === 'daily' ? (
              <TextField
                label="Date"
                type="date"
                size="small"
                value={date}
                slotProps={{
                  input: { startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} /> },
                  htmlInput: { readOnly: true },
                  inputLabel: { shrink: true },
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, gridColumn: 'span 1' }}>
                <TextField
                  label="Start"
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
                />
                <Typography sx={{ color: 'text.disabled', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>→</Typography>
                <TextField
                  label="End"
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
                />
              </Box>
            )}
            <TextField
              label="PIC"
              value={picName}
              size="small"
              slotProps={{
                input: { startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} /> },
                htmlInput: { readOnly: true },
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
            />
            <TextField
              label="Period Type"
              value={PERIOD_OPTIONS.find((p) => p.value === periodType)?.label}
              size="small"
              slotProps={{
                input: { startAdornment: <LockIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} /> },
                htmlInput: { readOnly: true },
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: 12, fontWeight: 600 } }}
            />
          </Box>

          {/* KPI strip */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip label={`${details.length} products`} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />
            <Chip
              label={`${totals.varianceItems} variance`}
              size="small"
              color={totals.varianceItems > 0 ? 'warning' : 'success'}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
            {totals.varianceValue !== 0 && (
              <Chip
                label={`Loss: ${fmtCurr(totals.varianceValue)}`}
                size="small"
                color="error"
                sx={{ fontWeight: 700, fontSize: 11 }}
              />
            )}
            <Box sx={{ ml: 'auto' }}>
              <Chip
                label={photosComplete ? 'Photos OK' : `${Object.keys(photosByDetail).length}/${details.length} photos`}
                size="small"
                color={photosComplete ? 'success' : 'warning'}
                sx={{ fontWeight: 600, fontSize: 11 }}
              />
            </Box>
          </Box>

          {/* Detail table */}
          <Box sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
            <TableContainer
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                maxHeight: 460,
              }}
            >
              <Table size="small" stickyHeader sx={{ minWidth: { xs: 800, sm: 'auto' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F0F4FA' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: '#F0F4FA', zIndex: 3, minWidth: 160, borderRight: '1px solid', borderColor: 'divider', py: 0.75 }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 80, bgcolor: '#F0F4FA' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 40, bgcolor: '#F0F4FA' }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 72, bgcolor: 'info.lighter', color: 'info.dark' }}>
                      System Stock
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 72, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
                      Actual Stock *
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 64, bgcolor: '#F0F4FA' }}>Variance</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', textAlign: 'center', py: 0.75, minWidth: 108, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
                      Photo *
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', py: 0.75, minWidth: 130, bgcolor: '#F0F4FA' }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((d, idx) => {
                    const photos = photosByDetail[d.detailId] || [];
                    return (
                      <TableRow key={d.detailId} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1, borderRight: '1px solid', borderColor: 'divider', py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{d.productName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled', fontSize: 10 }}>{d.productCode}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5, bgcolor: 'background.paper' }}><Typography variant="caption" sx={{ fontSize: 11 }}>{d.categoryName}</Typography></TableCell>
                        <TableCell align="center" sx={{ py: 0.5, bgcolor: 'background.paper' }}><Typography variant="caption" sx={{ fontSize: 11 }}>{d.uomName}</Typography></TableCell>
                        <TableCell align="center" sx={{ py: 0.5, bgcolor: 'background.paper' }}>
                          <Chip label={d.systemStock} size="small" color="info" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 10, height: 20 }} />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5, bgcolor: 'background.paper' }}>
                          <TextField
                            size="small"
                            type="number"
                            value={d.actualStock}
                            onChange={(e) => updateDetail(idx, 'actualStock', numField(e.target.value))}
                            sx={{ width: 64 }}
                            slotProps={{ htmlInput: { min: 0 } }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5, bgcolor: 'background.paper' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: 11,
                              color: d.varianceQty !== 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {d.varianceQty > 0 ? '+' : ''}{d.varianceQty}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5, bgcolor: '#F0F4FA' }}>
                          <MiniPhotoPicker
                            photos={photos}
                            onPhotosChange={(p) => handlePhotosChange(d.detailId, p)}
                            minPhotos={3}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, bgcolor: 'background.paper' }}>
                          <TextField
                            size="small"
                            placeholder="—"
                            value={d.notes}
                            onChange={(e) => updateDetail(idx, 'notes', e.target.value)}
                            sx={{ width: '100%' }}
                            slotProps={{ htmlInput: { style: { fontSize: 12 } } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75, fontSize: 10 }}>
            * Enter physical count. Variance auto-calculated. Min 3 photos per product.
          </Typography>

          {/* Action bar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button variant="outlined" size="small" startIcon={<SaveIcon sx={{ fontSize: 15 }} />} onClick={() => handleSave(false)}>
              Save Draft
            </Button>
            <Button variant="contained" size="small" startIcon={<SendIcon sx={{ fontSize: 15 }} />} onClick={() => handleSave(true)}
              sx={{ bgcolor: '#1A4080', '&:hover': { bgcolor: '#152d5c' } }}>
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>

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
            <Box key={idx} sx={{ position: 'relative', width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 } }}>
              <Box
                component="img"
                src={src}
                alt={`Photo ${idx + 1}`}
                sx={{ width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 }, borderRadius: 0.5, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
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
