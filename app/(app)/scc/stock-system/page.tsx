'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Chip, Snackbar,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, MenuItem, Select, InputAdornment,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, useMediaQuery, useTheme, Fab, LinearProgress,
  Paper, Card, CardContent, IconButton, CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon, Search as SearchIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon,
  Store as StoreIcon, Warehouse as WarehouseIcon,
  Kitchen as KitchenIcon, FilterList as FilterListIcon,
  Edit as EditIcon, Refresh as RefreshIcon,
  Inventory as InventoryIcon, TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { apiClient, StockSystemItem, Branch, Product, formatCurrency } from '@/lib/api/client';

const ROWS_PER_PAGE = 25;
const MOBILE_ITEMS_PER_PAGE = 5;

export default function StockSystemPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [stockItems, setStockItems] = useState<StockSystemItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  const [selectedOutletBranch, setSelectedOutletBranch] = useState<number>(0);
  const [selectedHubWhBranch, setSelectedHubWhBranch] = useState<number>(0);
  const [selectedHubCkBranch, setSelectedHubCkBranch] = useState<number>(0);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockSystemItem | null>(null);
  const [tempQty, setTempQty] = useState({ outlet: 0, hubWh: 0, hubCk: 0 });

  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stockData, branchesData, productsData] = await Promise.all([
        apiClient.getStockSystem(),
        apiClient.getBranches(),
        apiClient.getProducts()
      ]);

      setStockItems(stockData);
      setBranches(branchesData);
      setProducts(productsData);
      
      // Set default branch selections
      const outletBranches = branchesData.filter(b => b.branchType === 'OUTLET');
      const hubWhBranches = branchesData.filter(b => b.branchType === 'HUB WH');
      const hubCkBranches = branchesData.filter(b => b.branchType === 'HUB CK');
      
      if (outletBranches.length > 0) setSelectedOutletBranch(outletBranches[0].branchID);
      if (hubWhBranches.length > 0) setSelectedHubWhBranch(hubWhBranches[0].branchID);
      if (hubCkBranches.length > 0) setSelectedHubCkBranch(hubCkBranches[0].branchID);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock system data');
      console.error('Error fetching stock system data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const outletBranches = useMemo(() => branches.filter(b => b.branchType === 'OUTLET'), [branches]);
  const hubWhBranches = useMemo(() => branches.filter(b => b.branchType === 'HUB WH'), [branches]);
  const hubCkBranches = useMemo(() => branches.filter(b => b.branchType === 'HUB CK'), [branches]);

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
        if (location === 'outlet') return { ...item, outletStock: { ...item.outletStock, [branchId]: qty } };
        if (location === 'hubWh') return { ...item, hubWhStock: { ...item.hubWhStock, [branchId]: qty } };
        return { ...item, hubCkStock: { ...item.hubCkStock, [branchId]: qty } };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateStockSystem(stockItems);
      setToast({ open: true, msg: 'System stock data saved successfully.', sev: 'success' });
    } catch (err) {
      setToast({ open: true, msg: err instanceof Error ? err.message : 'Failed to save stock data', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditItem = (item: StockSystemItem) => {
    setSelectedItem(item);
    setTempQty({
      outlet: item.outletStock[selectedOutletBranch] ?? 0,
      hubWh: item.hubWhStock[selectedHubWhBranch] ?? 0,
      hubCk: item.hubCkStock[selectedHubCkBranch] ?? 0,
    });
    setEditDialogOpen(true);
  };

  const handleSaveItemQty = () => {
    if (!selectedItem) return;
    setStockItems((prev) =>
      prev.map((i) => {
        if (i.productId !== selectedItem.productId) return i;
        return {
          ...i,
          outletStock: { ...i.outletStock, [selectedOutletBranch]: tempQty.outlet },
          hubWhStock: { ...i.hubWhStock, [selectedHubWhBranch]: tempQty.hubWh },
          hubCkStock: { ...i.hubCkStock, [selectedHubCkBranch]: tempQty.hubCk },
        };
      })
    );
    setEditDialogOpen(false);
    setToast({ open: true, msg: 'Stock updated successfully.', sev: 'success' });
  };

  const stats = useMemo(() => {
    const outletTotal = stockItems.reduce(
      (s, i) => s + Object.values(i.outletStock).reduce((a, v) => a + v, 0), 0
    );
    const hubWhTotal = stockItems.reduce(
      (s, i) => s + Object.values(i.hubWhStock).reduce((a, v) => a + v, 0), 0
    );
    const hubCkTotal = stockItems.reduce(
      (s, i) => s + Object.values(i.hubCkStock).reduce((a, v) => a + v, 0), 0
    );
    const zeroStock = stockItems.filter(
      (i) =>
        Object.values(i.outletStock).every((v) => v === 0) &&
        Object.values(i.hubWhStock).every((v) => v === 0) &&
        Object.values(i.hubCkStock).every((v) => v === 0)
    ).length;
    const totalValue = stockItems.reduce((sum, item) => {
      const product = products.find(p => p.productId === item.productId);
      const unitPrice = product?.unitPrice || 0;
      return sum + (
        (Object.values(item.outletStock).reduce((a, v) => a + v, 0) +
         Object.values(item.hubWhStock).reduce((a, v) => a + v, 0) +
         Object.values(item.hubCkStock).reduce((a, v) => a + v, 0)) * unitPrice
      );
    }, 0);
    return { outletTotal, hubWhTotal, hubCkTotal, zeroStock, totalValue };
  }, [stockItems, products]);

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
    const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : ROWS_PER_PAGE;
    return filtered.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);
  }, [filtered, page, isMobile]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / (isMobile ? MOBILE_ITEMS_PER_PAGE : ROWS_PER_PAGE)));
  const categoryOptions = [...new Set(stockItems.map(p => p.categoryName))].sort();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, px: { xs: 1.5, sm: 2.5 } }}>
      <PageHeader
        title="Stock System"
        subtitle="System reference stock management — managed by Supply Chain & Cost Control team"
        breadcrumbs={['Supply Chain & Cost Control', 'Stock System']}
      />

      {/* ─── KPI Strip ─── */}
      <Paper elevation={0} sx={{ 
        display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 },
        px: { xs: 1.5, sm: 2.5 }, py: { xs: 1, sm: 1.5 },
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', mb: 2, flexWrap: 'wrap',
      }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, flexGrow: 1 }}>
          <Box>
            <Card variant="outlined" sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Products
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                  {stockItems.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box>
            <Card variant="outlined" sx={{ height: '100%', border: '1px solid', borderColor: '#0D2B5E' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <StoreIcon sx={{ fontSize: 16, color: '#0D2B5E' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    Outlets
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0D2B5E', mt: 0.5 }}>
                  {stats.outletTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card variant="outlined" sx={{ height: '100%', border: '1px solid', borderColor: '#1A4080' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <WarehouseIcon sx={{ fontSize: 16, color: '#1A4080' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    Hub WH
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1A4080', mt: 0.5 }}>
                  {stats.hubWhTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card variant="outlined" sx={{ height: '100%', border: '1px solid', borderColor: '#C62828' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <KitchenIcon sx={{ fontSize: 16, color: '#C62828' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    Central Kitchen
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#C62828', mt: 0.5 }}>
                  {stats.hubCkTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card variant="outlined" sx={{ height: '100%', border: stats.zeroStock > 0 ? '1px solid #C62828' : '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <InventoryIcon sx={{ fontSize: 16, color: stats.zeroStock > 0 ? '#C62828' : 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    Zero Stock
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: stats.zeroStock > 0 ? '#C62828' : 'text.primary', mt: 0.5 }}>
                  {stats.zeroStock}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ fontSize: { xs: 11, sm: 12.5 }, py: 0.75, px: { xs: 1.5, sm: 2 } }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      {loading && stockItems.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : error && stockItems.length === 0 ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <>
          {/* ─── Table Card ─── */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            {/* Filter bar */}
            <Box sx={{
              display: 'flex', gap: 1.5, px: { xs: 1.5, sm: 2.5 }, py: { xs: 1, sm: 1.25 },
              borderBottom: '1px solid', borderColor: 'divider',
              alignItems: 'center', flexWrap: 'wrap',
            }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                <TextField
                  size="small"
                  placeholder={isMobile ? "Search..." : "Search by product name or code..."}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  sx={{ minWidth: 0, flex: 1, maxWidth: { xs: '100%', sm: 300 } }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FilterListIcon sx={{ fontSize: { xs: 14, sm: 15 }, color: 'text.secondary' }} />
                  <Select
                    size="small"
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                    sx={{ minWidth: { xs: 120, sm: 150 }, fontSize: { xs: 11, sm: 12.5 } }}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {categoryOptions.map((cat) => (
                      <MenuItem key={cat} value={cat} sx={{ fontSize: { xs: 11, sm: 12 } }}>{cat}</MenuItem>
                    ))}
                   </Select>
                  <Chip
                    label={`${filtered.length} items`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: { xs: 10, sm: 11.5 }, height: 24 }}
                  />
                </Box>
              </Box>
            </Box>

          {/* Content Table */}
          <Box sx={{ overflow: 'auto', maxHeight: { xs: 'calc(100vh - 320px)', md: 'calc(100vh - 280px)' } }}>
            <TableContainer>
              <Table size={isMobile ? 'small' : 'small'} stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.dark' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: 'primary.dark', zIndex: 3, minWidth: 110 }}>
                      Code
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 12, minWidth: 200 }}>
                      Product Name
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 120 }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 100 }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 70 }}>
                      Unit
                    </TableCell>
                    <TableCell
                      sx={{
                        color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                        bgcolor: '#0D2B5E', minWidth: 170,
                        position: 'sticky', right: 274, zIndex: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <StoreIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }} />
                        <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Outlet</Typography>
                        <Select
                          value={selectedOutletBranch}
                          onChange={(e) => setSelectedOutletBranch(Number(e.target.value))}
                          sx={{
                            color: 'white', fontSize: 11, height: 26,
                            bgcolor: 'rgba(255,255,255,0.12)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
                            '& .MuiSvgIcon-root': { color: 'white', fontSize: 12 },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
                            '.MuiSelect-select': { py: 0.3 },
                          }}
                          renderValue={(val) => {
                            const b = outletBranches.find((x) => x.branchID === val);
                            return <Typography sx={{ fontSize: 11, lineHeight: 1, fontWeight: 600 }}>{b?.branchName ?? 'Select'}</Typography>;
                          }}
                        >
                          {outletBranches.map((b) => (
                            <MenuItem key={b.branchID} value={b.branchID} sx={{ fontSize: 12, py: 0.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StoreIcon sx={{ fontSize: 14, color: '#0D2B5E' }} />
                                {b.branchName}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                        bgcolor: '#1A4080', minWidth: 170,
                        position: 'sticky', right: 114, zIndex: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <WarehouseIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }} />
                        <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Hub WH</Typography>
                        <Select
                          value={selectedHubWhBranch}
                          onChange={(e) => setSelectedHubWhBranch(Number(e.target.value))}
                          sx={{
                            color: 'white', fontSize: 11, height: 26,
                            bgcolor: 'rgba(255,255,255,0.12)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
                            '& .MuiSvgIcon-root': { color: 'white', fontSize: 12 },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
                            '.MuiSelect-select': { py: 0.3 },
                          }}
                          renderValue={(val) => {
                            const b = hubWhBranches.find((x) => x.branchID === val);
                            return <Typography sx={{ fontSize: 11, lineHeight: 1, fontWeight: 600 }}>{b?.branchName ?? 'Select'}</Typography>;
                          }}
                        >
                          {hubWhBranches.map((b) => (
                            <MenuItem key={b.branchID} value={b.branchID} sx={{ fontSize: 12, py: 0.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarehouseIcon sx={{ fontSize: 14, color: '#1A4080' }} />
                                {b.branchName}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                        bgcolor: '#C62828', minWidth: 190,
                        position: 'sticky', right: 0, zIndex: 2,
                        boxShadow: '-2px 0 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <KitchenIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }} />
                        <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Central Kitchen</Typography>
                        <Select
                          value={selectedHubCkBranch}
                          onChange={(e) => setSelectedHubCkBranch(Number(e.target.value))}
                          sx={{
                            color: 'white', fontSize: 11, height: 26,
                            bgcolor: 'rgba(255,255,255,0.12)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
                            '& .MuiSvgIcon-root': { color: 'white', fontSize: 12 },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
                            '.MuiSelect-select': { py: 0.3 },
                          }}
                          renderValue={(val) => {
                            const b = hubCkBranches.find((x) => x.branchID === val);
                            return <Typography sx={{ fontSize: 11, lineHeight: 1, fontWeight: 600 }}>{b?.branchName ?? 'Select'}</Typography>;
                          }}
                        >
                          {hubCkBranches.map((b) => (
                            <MenuItem key={b.branchID} value={b.branchID} sx={{ fontSize: 12, py: 0.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <KitchenIcon sx={{ fontSize: 14, color: '#C62828' }} />
                                {b.branchName}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 70 }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((item) => {
                    const outletQty = item.outletStock[selectedOutletBranch] ?? 0;
                    const hubWhQty = item.hubWhStock[selectedHubWhBranch] ?? 0;
                    const hubCkQty = item.hubCkStock[selectedHubCkBranch] ?? 0;
                    const allZero = outletQty === 0 && hubWhQty === 0 && hubCkQty === 0;
                    return (
                      <TableRow key={item.productId} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', zIndex: 1 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: 11.5, fontWeight: 600 }}>
                            {item.productCode}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ bgcolor: 'background.paper' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary', lineHeight: 1.4 }}>
                            {item.productName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>
                          <Chip size="small" label={item.categoryName} sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600, bgcolor: 'primary.main', color: 'white' }} />
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, fontSize: 12 }}>{item.categoryTypeName}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, fontSize: 12 }}>{item.unit}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ position: 'sticky', right: 274, zIndex: 1, bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={outletQty}
                            onChange={(e) => handleQtyChange(item.productId, 'outlet', selectedOutletBranch, e.target.value)}
                            slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 700, color: '#0D2B5E' } } }}
                            sx={{ width: 100, '& input': { py: 0.5, px: 1 } }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ position: 'sticky', right: 114, zIndex: 1, bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={hubWhQty}
                            onChange={(e) => handleQtyChange(item.productId, 'hubWh', selectedHubWhBranch, e.target.value)}
                            slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 700, color: '#1A4080' } } }}
                            sx={{ width: 100, '& input': { py: 0.5, px: 1 } }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1, bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider', boxShadow: '-2px 0 4px rgba(0,0,0,0.06)' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={hubCkQty}
                            onChange={(e) => handleQtyChange(item.productId, 'hubCk', selectedHubCkBranch, e.target.value)}
                            slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 700, color: '#C62828' } } }}
                            sx={{ width: 110, '& input': { py: 0.5, px: 1 } }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>
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
          </Box>

          {/* Pagination */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', px: { xs: 1.5, sm: 2.5 }, py: { xs: 0.75, sm: 0.75 }, flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>
              {filtered.length === 0 ? 0 : page * (isMobile ? MOBILE_ITEMS_PER_PAGE : ROWS_PER_PAGE) + 1}–{Math.min((page + 1) * (isMobile ? MOBILE_ITEMS_PER_PAGE : ROWS_PER_PAGE), filtered.length)} of {filtered.length}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Button size="small" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Prev
              </Button>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', minWidth: 45, textAlign: 'center', fontSize: { xs: 10, sm: 12 } }}>
                {page + 1} / {totalPages}
              </Typography>
              <Button size="small" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                Next
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Mobile Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{ '& .MuiDialog-paper': { borderRadius: 2, mx: 1 } }}
        >
          <DialogTitle sx={{ fontSize: 16, pb: 1 }}>
            {selectedItem ? `Edit Stock: ${selectedItem.productName}` : ''}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 13, fontWeight: 600 }}>
                  <StoreIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Outlet: {outletBranches.find(b => b.branchID === selectedOutletBranch)?.branchName}
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  label="Quantity"
                  value={tempQty.outlet}
                  onChange={(e) => setTempQty(prev => ({ ...prev, outlet: Math.max(0, Number(e.target.value)) }))}
                  slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' }, input: { sx: { fontSize: 16, fontWeight: 600, color: '#0D2B5E' } } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 13, fontWeight: 600 }}>
                  <WarehouseIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Hub WH: {hubWhBranches.find(b => b.branchID === selectedHubWhBranch)?.branchName}
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  label="Quantity"
                  value={tempQty.hubWh}
                  onChange={(e) => setTempQty(prev => ({ ...prev, hubWh: Math.max(0, Number(e.target.value)) }))}
                  slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' }, input: { sx: { fontSize: 16, fontWeight: 600, color: '#1A4080' } } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 13, fontWeight: 600 }}>
                  <KitchenIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Central Kitchen: {hubCkBranches.find(b => b.branchID === selectedHubCkBranch)?.branchName}
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  label="Quantity"
                  value={tempQty.hubCk}
                  onChange={(e) => setTempQty(prev => ({ ...prev, hubCk: Math.max(0, Number(e.target.value)) }))}
                  slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' }, input: { sx: { fontSize: 16, fontWeight: 600, color: '#C62828' } } }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)} size="small">Cancel</Button>
            <Button onClick={handleSaveItemQty} variant="contained" size="small">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Mobile Floating Action Button */}
        {isMobile && (
          <Fab
            color="primary"
            onClick={handleSave}
            disabled={saving}
            sx={{
              position: 'fixed',
              bottom: { xs: 76, md: 20 },
              right: 16,
              zIndex: 1000,
              width: 56,
              height: 56,
            }}
          >
            {saving ? <Typography variant="caption">...</Typography> : <SaveIcon />}
          </Fab>
        )}
        </>
      )}

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