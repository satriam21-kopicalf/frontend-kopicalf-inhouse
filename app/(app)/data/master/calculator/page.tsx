'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, IconButton,
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Divider, InputAdornment, Grid, Alert, MenuItem, Chip,
} from '@mui/material';
import {
  Add as AddIcon, DeleteOutlined as DeleteIcon, Calculate as CalculateIcon,
  Schema as BomIcon, RestartAlt as ResetIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { BOM, apiClient } from '@/lib/api/client';

interface CalcRow {
  id: number;
  materialCode: string;
  name: string;
  qty: number | '';
  unit: string;
  cost: number | '';
}

let nextId = 100;

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('en-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const emptyRow = (): CalcRow => ({ id: nextId++, materialCode: '', name: '', qty: '', unit: '', cost: '' });

export default function CalculatorPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [bomLoadError, setBomLoadError] = useState<string | null>(null);
  const [bomId, setBomId] = useState<number | ''>('');
  const [outputQty, setOutputQty] = useState<number | ''>(1);
  const [unitName, setUnitName] = useState('PCS');
  const [rows, setRows] = useState<CalcRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [price, setPrice] = useState<number | ''>(25000);
  const [targetMargin, setTargetMargin] = useState<number | ''>(60);

  useEffect(() => {
    apiClient.getBOMs()
      .then((data) => setBoms(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setBomLoadError('Failed to load BOMs'));
  }, []);

  const bom = useMemo(() => boms.find((b) => b.bomId === bomId) ?? null, [boms, bomId]);

  const loadBom = (id: number) => {
    setBomId(id);
    const selected = boms.find((b) => b.bomId === id);
    if (!selected) return;
    setOutputQty(selected.outputQty ?? 1);
    setUnitName(selected.uomName ?? 'PCS');
  };

  const resetAll = () => {
    setBomId('');
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setOutputQty(1);
    setUnitName('PCS');
    setPrice(25000);
    setTargetMargin(60);
  };

  const total = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.cost) || 0), 0),
    [rows]
  );

  const out = Math.max(Number(outputQty) || 0, 0) || 1;
  const hppPerUnit = total / out;

  const margin = useMemo(() => {
    const p = Number(price) || 0;
    if (p <= 0) return null;
    return { value: p - hppPerUnit, pct: ((p - hppPerUnit) / p) * 100 };
  }, [price, hppPerUnit]);

  const recommendedPrice = useMemo(() => {
    const tm = Number(targetMargin) || 0;
    if (tm <= 0 || tm >= 100) return null;
    return hppPerUnit / (1 - tm / 100);
  }, [targetMargin, hppPerUnit]);

  const update = (id: number, field: keyof CalcRow, value: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === 'name' || field === 'unit' || field === 'materialCode' ? value : value === '' ? '' : Number(value) }
          : r
      )
    );

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));

  return (
    <Box>
      <PageHeader
        title="HPP Calculator"
        subtitle="Calculate HPP & margin per product"
        breadcrumbs={['Data', 'Calculator']}
      />

      <Grid container spacing={2}>
        {/* Left: BOM source + composition */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Material Composition
                </Typography>
                <Button size="small" startIcon={<ResetIcon />} onClick={resetAll} variant="outlined" color="inherit">
                  Reset
                </Button>
              </Box>
              <TextField
                select
                label="Load from BOM"
                size="small"
                fullWidth
                value={bomId}
                onChange={(e) => loadBom(Number(e.target.value))}
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BomIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {bomLoadError ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>{bomLoadError}</Alert>
                ) : boms.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>Loading BOMs...</Alert>
                ) : null}
                <MenuItem value="">
                  <em>— Manual (without BOM) —</em>
                </MenuItem>
                {boms.filter((b) => b.flagActive).map((b) => (
                  <MenuItem key={b.bomId} value={b.bomId}>
                    {b.code} — {b.name}
                  </MenuItem>
                ))}
              </TextField>

              {bom && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Loaded <strong>{bom.code} — {bom.name}</strong>. Enter materials manually below.
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                  Materials ({rows.length})
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addRow} variant="outlined">
                  Add
                </Button>
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Material</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 90 }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 70 }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 130 }}>HPP/Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, textAlign: 'right', width: 110 }}>Subtotal</TableCell>
                      <TableCell sx={{ width: 36 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Name"
                            value={r.name}
                            onChange={(e) => update(r.id, 'name', e.target.value)}
                            sx={{ minWidth: 100, width: { xs: 100, sm: 180 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={r.qty}
                            onChange={(e) => update(r.id, 'qty', e.target.value)}
                            sx={{ width: 85 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="GR"
                            value={r.unit}
                            onChange={(e) => update(r.id, 'unit', e.target.value)}
                            sx={{ width: 65 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={r.cost}
                            onChange={(e) => update(r.id, 'cost', e.target.value)}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
                            {fmtCurr((Number(r.qty) || 0) * (Number(r.cost) || 0))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => removeRow(r.id)} disabled={rows.length <= 1} sx={{ p: 0.5 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: calculation results */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ background: 'linear-gradient(160deg, #020231 0%, #050794 55%, #0359c9 100%)', border: 0, mb: 2 }}>
            <CardContent sx={{ color: '#fff', p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalculateIcon sx={{ opacity: 0.9 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Results
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Cost
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {fmtCurr(total)}
              </Typography>

              <TextField
                label="Output Qty"
                size="small"
                type="number"
                fullWidth
                value={outputQty}
                onChange={(e) => setOutputQty(e.target.value === '' ? '' : Number(e.target.value))}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(255,255,255,0.7)' }}>{unitName}</InputAdornment>,
                  },
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { color: '#fff' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                }}
              />

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

              <Box sx={{ pt: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  HPP per {unitName}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {fmtCurr(hppPerUnit)}
                </Typography>

                <TextField
                  label="Selling Price"
                  size="small"
                  type="number"
                  fullWidth
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': { color: '#fff' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                />

                {margin ? (
                  <>
                    <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Margin
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: margin.value >= 0 ? '#33ddff' : '#ff8a80' }}>
                      {fmtCurr(margin.value)} ({margin.pct.toFixed(1)}%)
                    </Typography>
                    {margin.pct < 55 && (
                      <Alert severity="warning" sx={{ mt: 1.5 }}>
                        Margin below 55% — review your pricing
                      </Alert>
                    )}
                  </>
                ) : (
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Enter selling price.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Target margin simulation */}
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Target Margin
              </Typography>
              <TextField
                label="Target (%)"
                size="small"
                type="number"
                fullWidth
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value === '' ? '' : Number(e.target.value))}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  },
                }}
                sx={{ mb: 1.5 }}
              />
              {recommendedPrice ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Recommended price
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary.main">
                    {fmtCurr(Math.ceil(recommendedPrice / 500) * 500)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Enter 1–99% to see price.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
