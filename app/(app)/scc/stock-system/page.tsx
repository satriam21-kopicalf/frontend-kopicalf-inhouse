'use client';

import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Chip, Snackbar,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, MenuItem, Select, InputAdornment,
  IconButton, Tooltip, FormControl,
} from '@mui/material';
import {
  Save as SaveIcon, Search as SearchIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon,
  Store as StoreIcon, Warehouse as WarehouseIcon,
  Kitchen as KitchenIcon, FilterList as FilterListIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { MOCK_PRODUCTS, MOCK_BRANCHES } from '@/lib/mockData';

const OUTLET_BRANCHES = MOCK_BRANCHES.filter((b) => b.branchType === 'OUTLET').slice(0, 10);
const HUB_WH_BRANCHES = MOCK_BRANCHES.filter((b) => b.branchType === 'HUB WH');
const HUB_CK_BRANCHES = MOCK_BRANCHES.filter((b) => b.branchType === 'HUB CK');

interface BranchStockEntry {
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  categoryTypeName: string;
  unit: string;
  outletQty: Record<string, number>;
  hubWhQty: Record<string, number>;
  hubCkQty: Record<string, number>;
}

const ACTIVE_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.flagActive);

const INITIAL_STOCK: BranchStockEntry[] = ACTIVE_PRODUCTS.slice(0, 40).map((p) => {
  const outletQty: Record<string, number> = {};
  const hubWhQty: Record<string, number> = {};
  const hubCkQty: Record<string, number> = {};
  OUTLET_BRANCHES.forEach((b) => { outletQty[b.branchID] = Math.floor(Math.random() * 50) + 5; });
  HUB_WH_BRANCHES.forEach((b) => { hubWhQty[b.branchID] = Math.floor(Math.random() * 200) + 50; });
  HUB_CK_BRANCHES.forEach((b) => { hubCkQty[b.branchID] = Math.floor(Math.random() * 100) + 20; });
  return {
    productId: p.productId,
    productCode: p.productCode,
    productName: p.name,
    categoryName: p.categoryName || 'General',
    categoryTypeName: p.categoryTypeName || 'Beverage',
    unit: 'UNIT',
    outletQty,
    hubWhQty,
    hubCkQty,
  };
});

const CATEGORY_OPTIONS = [...new Set(INITIAL_STOCK.map((p) => p.categoryName))].sort();
const ROWS_PER_PAGE = 25;

export default function StockSystemPage() {
  const [stockItems, setStockItems] = useState<BranchStockEntry[]>(INITIAL_STOCK);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });
  const [page, setPage] = useState(0);

  const [selectedOutletBranch, setSelectedOutletBranch] = useState<number>(
    OUTLET_BRANCHES[0]?.branchID ?? 0
  );
  const [selectedHubWhBranch, setSelectedHubWhBranch] = useState<number>(
    HUB_WH_BRANCHES[0]?.branchID ?? 0
  );
  const [selectedHubCkBranch, setSelectedHubCkBranch] = useState<number>(
    HUB_CK_BRANCHES[0]?.branchID ?? 0
  );

  const handleQtyChange = (
    productId: number,
    location: 'outlet' | 'hubWh' | 'hubCk',
    branchId: number,
    value: string
  ) => {
    const qty = value === '' ? 0 : Math.max(0, Number(value));
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        if (location === 'outlet') return { ...item, outletQty: { ...item.outletQty, [branchId]: qty } };
        if (location === 'hubWh') return { ...item, hubWhQty: { ...item.hubWhQty, [branchId]: qty } };
        return { ...item, hubCkQty: { ...item.hubCkQty, [branchId]: qty } };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setToast({ open: true, msg: 'System stock data saved successfully.', sev: 'success' });
  };

  const stats = useMemo(() => {
    const outletTotal = stockItems.reduce(
      (s, i) => s + Object.values(i.outletQty).reduce((a, v) => a + v, 0), 0
    );
    const hubWhTotal = stockItems.reduce(
      (s, i) => s + Object.values(i.hubWhQty).reduce((a, v) => a + v, 0), 0
    );
    const hubCkTotal = stockItems.reduce(
      (s, i) => s + Object.values(i.hubCkQty).reduce((a, v) => a + v, 0), 0
    );
    const zeroStock = stockItems.filter(
      (i) =>
        Object.values(i.outletQty).every((v) => v === 0) &&
        Object.values(i.hubWhQty).every((v) => v === 0) &&
        Object.values(i.hubCkQty).every((v) => v === 0)
    ).length;
    return { outletTotal, hubWhTotal, hubCkTotal, zeroStock };
  }, [stockItems]);

  const filtered = useMemo(() => {
    let data = stockItems;
    if (categoryFilter !== 'ALL') {
      data = data.filter((i) => i.categoryName === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.productCode.toLowerCase().includes(q) ||
          i.categoryTypeName.toLowerCase().includes(q)
      );
    }
    return data;
  }, [stockItems, categoryFilter, search]);

  const paginated = useMemo(() => {
    return filtered.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  }, [filtered, page]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <PageHeader
        title="Stock System"
        subtitle="System reference stock data — managed by Supply Chain & Cost Control team"
        breadcrumbs={['Supply Chain & Cost Control', 'Stock System']}
      />

      {/* ─── KPI Strip ─── */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 3,
          px: 2.5, py: 1.5,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper', mb: 0,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
          {[
            { label: 'Products', value: stockItems.length },
            { label: 'Outlets', value: stats.outletTotal.toLocaleString() },
            { label: 'Hub WH', value: stats.hubWhTotal.toLocaleString() },
            { label: 'Central Kitchen', value: stats.hubCkTotal.toLocaleString() },
            stats.zeroStock > 0
              ? { label: 'Zero Stock', value: stats.zeroStock, highlight: true }
              : null,
          ]
            .filter(Boolean)
            .map((s) => (
              <Box key={s!.label}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                  {s!.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700, lineHeight: 1.2,
                    color: s!.highlight ? 'error.main' : 'text.primary',
                  }}
                >
                  {s!.value.toLocaleString()}
                </Typography>
              </Box>
            ))}
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ fontSize: 12.5, py: 0.75, px: 2, flexShrink: 0 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* ─── Table Card ─── */}
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          border: '1px solid', borderColor: 'divider',
          borderRadius: 1, overflow: 'hidden',
          bgcolor: 'background.paper', mt: 0,
        }}
      >
        {/* Filter bar */}
        <Box
          sx={{
            display: 'flex', gap: 1.5, px: 2.5, py: 1.25,
            borderBottom: '1px solid', borderColor: 'divider',
            alignItems: 'center', flexWrap: 'wrap',
          }}
        >
          <TextField
            size="small"
            placeholder="Search by product name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FilterListIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Select
              size="small"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              sx={{ minWidth: 150, fontSize: 12.5 }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {CATEGORY_OPTIONS.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </Box>
          <Chip
            label={`${filtered.length} items`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: 11.5 }}
          />
        </Box>

        {/* Table */}
        <TableContainer sx={{ flex: 1, maxHeight: 'calc(100vh - 280px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.900' }}>
                <TableCell sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: 'grey.900', zIndex: 3, minWidth: 110 }}>
                  Code
                </TableCell>
                <TableCell sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, minWidth: 200 }}>
                  Product Name
                </TableCell>
                <TableCell sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 120 }}>
                  Category
                </TableCell>
                <TableCell sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 100 }}>
                  Type
                </TableCell>
                <TableCell sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 70 }}>
                  Unit
                </TableCell>
                {/* Outlet column */}
                <TableCell
                  sx={{
                    color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                    bgcolor: '#1565c0', minWidth: 160,
                    position: 'sticky', right: 274, zIndex: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <StoreIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700 }}>Outlet</Typography>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <Select
                        value={selectedOutletBranch}
                        onChange={(e) => setSelectedOutletBranch(Number(e.target.value))}
                        sx={{
                          color: 'white', fontSize: 11, height: 24,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                          '& .MuiSvgIcon-root': { color: 'white', fontSize: 12 },
                          '.MuiSelect-select': { py: 0.25 },
                        }}
                      >
                        {OUTLET_BRANCHES.map((b) => (
                          <MenuItem key={b.branchID} value={b.branchID} sx={{ fontSize: 11.5 }}>
                            {b.branchName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </TableCell>
                {/* Hub WH column */}
                <TableCell
                  sx={{
                    color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                    bgcolor: '#0277bd', minWidth: 160,
                    position: 'sticky', right: 114, zIndex: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <WarehouseIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700 }}>Hub WH</Typography>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <Select
                        value={selectedHubWhBranch}
                        onChange={(e) => setSelectedHubWhBranch(Number(e.target.value))}
                        sx={{
                          color: 'white', fontSize: 11, height: 24,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                          '& .MuiSvgIcon-root': { color: 'white', fontSize: 12 },
                          '.MuiSelect-select': { py: 0.25 },
                        }}
                      >
                        {HUB_WH_BRANCHES.map((b) => (
                          <MenuItem key={b.branchID} value={b.branchID} sx={{ fontSize: 11.5 }}>
                            {b.branchName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </TableCell>
                {/* Hub CK column */}
                <TableCell
                  sx={{
                    color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                    bgcolor: '#bf360c', minWidth: 180,
                    position: 'sticky', right: 0, zIndex: 2,
                    boxShadow: '-2px 0 4px rgba(0,0,0,0.15)',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <KitchenIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700 }}>Central Kitchen</Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={selectedHubCkBranch}
                        onChange={(e) => setSelectedHubCkBranch(Number(e.target.value))}
                        sx={{
                          color: 'white', fontSize: 11, height: 24,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                          '& .MuiSvgIcon-root': { color: 'white', fontSize: 12 },
                          '.MuiSelect-select': { py: 0.25 },
                        }}
                      >
                        {HUB_CK_BRANCHES.map((b) => (
                          <MenuItem key={b.branchID} value={b.branchID} sx={{ fontSize: 11.5 }}>
                            {b.branchName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 70 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((item) => {
                const outletQty = item.outletQty[selectedOutletBranch] ?? 0;
                const hubWhQty = item.hubWhQty[selectedHubWhBranch] ?? 0;
                const hubCkQty = item.hubCkQty[selectedHubCkBranch] ?? 0;
                const allZero = outletQty === 0 && hubWhQty === 0 && hubCkQty === 0;
                return (
                  <TableRow key={item.productId} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', zIndex: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 11 }}>
                        {item.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                        {item.productName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={item.categoryName} sx={{ fontSize: '0.7rem', height: 20 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">{item.categoryTypeName}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">{item.unit}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 274, zIndex: 1, bgcolor: 'background.paper' }}>
                      <TextField
                        type="number"
                        size="small"
                        value={outletQty}
                        onChange={(e) => handleQtyChange(item.productId, 'outlet', selectedOutletBranch, e.target.value)}
                        slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 600 } } }}
                        sx={{ width: 100, '& input': { py: 0.5, px: 1 } }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 114, zIndex: 1, bgcolor: 'background.paper' }}>
                      <TextField
                        type="number"
                        size="small"
                        value={hubWhQty}
                        onChange={(e) => handleQtyChange(item.productId, 'hubWh', selectedHubWhBranch, e.target.value)}
                        slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 600 } } }}
                        sx={{ width: 100, '& input': { py: 0.5, px: 1 } }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(0,0,0,0.06)' }}>
                      <TextField
                        type="number"
                        size="small"
                        value={hubCkQty}
                        onChange={(e) => handleQtyChange(item.productId, 'hubCk', selectedHubCkBranch, e.target.value)}
                        slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 600 } } }}
                        sx={{ width: 110, '& input': { py: 0.5, px: 1 } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {allZero ? (
                        <Tooltip title="Zero across all locations">
                          <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Has stock">
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No products match the current filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', px: 2.5, py: 0.75, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filtered.length === 0 ? 0 : page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <IconButton size="small" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              <Typography sx={{ fontSize: 18, lineHeight: 1, fontWeight: 600 }}>‹</Typography>
            </IconButton>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', minWidth: 52, textAlign: 'center' }}>
              {page + 1} / {Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.min(Math.ceil(filtered.length / ROWS_PER_PAGE) - 1, p + 1))}
              disabled={page >= Math.ceil(filtered.length / ROWS_PER_PAGE) - 1}
            >
              <Typography sx={{ fontSize: 18, lineHeight: 1, fontWeight: 600 }}>›</Typography>
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
