'use client';

import { useMemo, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Drawer,
  TextField, MenuItem, Snackbar, Alert, Select, FormControl,
  InputLabel, InputAdornment, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  InfoOutlined as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import DataDrawer from '@/components/DataDrawer';
import { MOCK_STOCK_OPNAMES, MOCK_STOCK_OPNAME_DETAILS, StockOpname, SoPeriodType, SoStatus } from '@/lib/mockData';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const PERIOD_LABELS: Record<SoPeriodType, string> = {
  daily_packaging: 'Daily Packaging',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const STATUS_COLORS: Record<SoStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  submitted: { bg: '#dbeafe', color: '#1e40af', label: 'Submitted' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

export default function StockOpnamePage() {
  const [records] = useState<StockOpname[]>(
    () => [...MOCK_STOCK_OPNAMES].sort((a, b) => b.soId - a.soId)
  );

  const [tab, setTab] = useState<SoPeriodType>('daily_packaging');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPic, setFilterPic] = useState('');
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState<StockOpname | null>(null);
  const [viewDetails, setViewDetails] = useState<typeof MOCK_STOCK_OPNAME_DETAILS>([]);
  const [deleteTarget, setDeleteTarget] = useState<StockOpname | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  // Filter modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterModalBranch, setFilterModalBranch] = useState('');
  const [filterModalStatus, setFilterModalStatus] = useState('');
  const [filterModalPic, setFilterModalPic] = useState('');
  const [filterModalDateStart, setFilterModalDateStart] = useState('');
  const [filterModalDateEnd, setFilterModalDateEnd] = useState('');
  const [filterModalHasVariance, setFilterModalHasVariance] = useState('');

  const ROWS_PER_PAGE = 20;

  const filtered = useMemo(() => {
    let list = records.filter((r) => r.periodType === tab);
    if (filterBranch) list = list.filter((r) => r.branchId === Number(filterBranch));
    if (filterStatus) list = list.filter((r) => r.status === filterStatus);
    if (filterPic) list = list.filter((r) => r.submittedBy.toLowerCase().includes(filterPic.toLowerCase()));
    if (dateStart) list = list.filter((r) => r.soDate >= dateStart);
    if (dateEnd) list = list.filter((r) => r.soDate <= dateEnd);
    if (filterModalHasVariance === 'yes') list = list.filter((r) => r.varianceValue !== 0);
    if (filterModalHasVariance === 'no') list = list.filter((r) => r.varianceValue === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.branchName.toLowerCase().includes(q) ||
          r.soDate.includes(q) ||
          r.submittedBy.toLowerCase().includes(q) ||
          r.periodLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, tab, filterBranch, filterStatus, filterPic, dateStart, dateEnd, search, filterModalHasVariance]);

  const detailCount = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of MOCK_STOCK_OPNAME_DETAILS) {
      map.set(d.soId, (map.get(d.soId) ?? 0) + 1);
    }
    return map;
  }, []);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const approved = filtered.filter((r) => r.status === 'approved').length;
    const pending = filtered.filter((r) => r.status === 'submitted').length;
    const variance = filtered.reduce((s, r) => s + r.varianceValue, 0);
    return { total, approved, pending, variance };
  }, [filtered]);

  // All unique PICs for filter
  const allPic = useMemo(() => [...new Set(records.map((r) => r.submittedBy))].sort(), [records]);

  const openView = (row: StockOpname) => {
    setViewing({ ...row });
    setViewDetails(MOCK_STOCK_OPNAME_DETAILS.filter((d) => d.soId === row.soId).map((d) => ({ ...d })));
  };

  const handleDeleteOpen = (row: StockOpname) => {
    setDeleteTarget(row);
    setDeleteDrawerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setDeleteLoading(false);
    setDeleteDrawerOpen(false);
    setDeleteTarget(null);
    setToast({ open: true, msg: 'Stock Opname record deleted successfully.', sev: 'error' });
  };

  const clearDateFilter = () => { setDateStart(''); setDateEnd(''); setPage(0); };

  const paginated = filtered.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  const deleteFields = deleteTarget
    ? [
        { name: 'branchName', label: 'Branch', type: 'readonly' as const },
        { name: 'periodLabel', label: 'Period', type: 'readonly' as const },
        { name: 'soDate', label: 'Date', type: 'readonly' as const },
        { name: 'status', label: 'Status', type: 'readonly' as const },
      ]
    : [];

  // Apply filters from modal
  const applyFilterModal = () => {
    setFilterBranch(filterModalBranch);
    setFilterStatus(filterModalStatus);
    setFilterPic(filterModalPic);
    setDateStart(filterModalDateStart);
    setDateEnd(filterModalDateEnd);
    setFilterModalHasVariance(filterModalHasVariance);
    setPage(0);
    setFilterModalOpen(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterBranch('');
    setFilterStatus('');
    setFilterPic('');
    setDateStart('');
    setDateEnd('');
    setFilterModalBranch('');
    setFilterModalStatus('');
    setFilterModalPic('');
    setFilterModalDateStart('');
    setFilterModalDateEnd('');
    setFilterModalHasVariance('');
    setPage(0);
  };

  const hasActiveFilters = !!(filterBranch || filterStatus || filterPic || dateStart || dateEnd || filterModalHasVariance);

  const deleteFields2 = deleteTarget
    ? [
        { name: 'branchName', label: 'Branch', type: 'readonly' as const },
        { name: 'periodLabel', label: 'Period', type: 'readonly' as const },
        { name: 'soDate', label: 'Date', type: 'readonly' as const },
        { name: 'status', label: 'Status', type: 'readonly' as const },
      ]
    : [];

  return (
    <Box>
      <PageHeader
        title="Stock Opname"
        subtitle="Stock opname records — inventory verification across all branches and period types"
        breadcrumbs={['Supply Chain & Cost Control', 'Stock Opname']}
      />

      {/* ─── KPI Strip ─── */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 3,
          px: 2.5, py: 1.25,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper', mb: 0, flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Total Records', value: kpis.total },
          { label: 'Approved', value: kpis.approved, color: '#166534' },
          { label: 'Pending', value: kpis.pending, color: '#1e40af' },
          {
            label: 'Variance',
            value: kpis.variance !== 0 ? fmtCurr(Math.abs(kpis.variance)) : 'Balanced',
            color: kpis.variance !== 0 ? '#991b1b' : '#166534',
          },
        ].map((s) => (
          <Box key={s.label} sx={{ minWidth: 90 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              {s.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: (s as { color?: string }).color || 'text.primary' }}>
              {s.value}
            </Typography>
          </Box>
        ))}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`${filtered.length} items`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: 11.5 }}
          />
          <Button
            variant={hasActiveFilters ? 'contained' : 'outlined'}
            size="small"
            startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
            onClick={() => setFilterModalOpen(true)}
            sx={{ fontSize: 12, py: 0.5, px: 1.5 }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* ─── Table Card ─── */}
      <Box
        sx={{
          border: '1px solid', borderColor: 'divider',
          borderRadius: 1, overflow: 'hidden',
          bgcolor: 'background.paper', mt: 0,
        }}
      >
        {/* Compact filter bar (always visible — minimal) */}
        <Box
          sx={{
            display: 'flex', gap: 1.5, px: 2.5, py: 1.25,
            borderBottom: '1px solid', borderColor: 'divider',
            alignItems: 'center', flexWrap: 'wrap',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setPage(0); }}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
          >
            {Object.entries(PERIOD_LABELS).map(([val, label]) => (
              <Tab key={val} value={val} label={label} sx={{ fontSize: 12, minHeight: 36, px: 2 }} />
            ))}
          </Tabs>

          <TextField
            size="small"
            placeholder="Quick search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}
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

          {/* Quick filter chips */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {[
              { label: 'Has Variance', val: 'yes', color: 'error' },
              { label: 'Balanced', val: 'no', color: 'success' },
            ].map((chip) => (
              <Chip
                key={chip.val}
                label={chip.label}
                size="small"
                variant={filterModalHasVariance === chip.val ? 'filled' : 'outlined'}
                color={filterModalHasVariance === chip.val ? chip.color as 'error' | 'success' : 'default'}
                onClick={() => {
                  setFilterModalHasVariance(filterModalHasVariance === chip.val ? '' : chip.val);
                  setPage(0);
                }}
                sx={{ fontSize: 11, height: 24 }}
              />
            ))}
          </Box>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', ml: 0.5 }}>
              {filterBranch && (
                <Chip
                  label={`Branch: ${records.find((r) => r.branchId === Number(filterBranch))?.branchName ?? filterBranch}`}
                  size="small"
                  onDelete={() => { setFilterBranch(''); }}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {filterStatus && (
                <Chip
                  label={`Status: ${STATUS_COLORS[filterStatus as SoStatus].label}`}
                  size="small"
                  onDelete={() => { setFilterStatus(''); }}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {(dateStart || dateEnd) && (
                <Chip
                  label={`${dateStart || '...' } – ${dateEnd || '...'}`}
                  size="small"
                  onDelete={clearDateFilter}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              <Chip
                label="Clear all"
                size="small"
                color="default"
                variant="outlined"
                onClick={clearAllFilters}
                sx={{ fontSize: 11, height: 22 }}
              />
            </Box>
          )}
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.900' }}>
                {['#', 'Date', 'Branch', 'Period', 'Items', 'Variance', 'Status', 'PIC', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ color: 'grey.100', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', bgcolor: 'grey.900' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((r) => {
                const sc = STATUS_COLORS[r.status];
                return (
                  <TableRow key={r.soId} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 11 }}>
                        {r.soId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.soDate}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>{r.branchName}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: 10, fontWeight: 700,
                          bgcolor: r.branchType === 'OUTLET' ? '#dbeafe' : r.branchType === 'HUB WH' ? '#fef9c3' : '#f3e5f5',
                          color: r.branchType === 'OUTLET' ? '#1e40af' : r.branchType === 'HUB WH' ? '#92400e' : '#4a148c',
                        }}
                      >
                        {r.branchType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.periodLabel}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{detailCount.get(r.soId) ?? 0}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                        {r.varianceValue !== 0 && (
                          <WarningIcon sx={{ fontSize: 12, color: 'error.main' }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600, fontFamily: 'monospace', fontSize: 12,
                            color: r.varianceValue !== 0 ? 'error.main' : 'text.primary',
                          }}
                        >
                          {r.varianceValue !== 0 ? fmtCurr(r.varianceValue) : 'Balanced'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        component="span"
                        sx={{
                          px: 1.25, py: 0.375, borderRadius: 1, fontWeight: 600, fontSize: 11,
                          display: 'inline-block', bgcolor: sc.bg, color: sc.color,
                        }}
                      >
                        {sc.label}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>{r.submittedBy}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="View Detail">
                          <IconButton size="small" onClick={() => openView(r)} sx={{ color: 'primary.main' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteOpen(r)} sx={{ color: 'error.main' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No records match the current filters.</Typography>
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

      {/* ─── Filter Drawer ─── */}
      <Drawer
        anchor="right"
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 400 },
              borderRadius: { xs: 0, sm: '16px 0 0 16px' },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
          backdrop: { sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.4)' } },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{
          px: 3, py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TuneIcon sx={{ fontSize: 18, color: 'white' }} />
            <Typography sx={{ fontWeight: 700, color: 'white', fontSize: 15 }}>
              Filter Options
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setFilterModalOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Stack spacing={2.5}>
            {/* Branch */}
            <FormControl size="small" fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select
                value={filterModalBranch}
                label="Branch"
                onChange={(e) => setFilterModalBranch(e.target.value)}
              >
                <MenuItem value="">All Branches</MenuItem>
                {[...new Map(records.filter((r) => r.periodType === tab).map((r) => [r.branchId, r])).values()].map((r) => (
                  <MenuItem key={r.branchId} value={r.branchId}>{r.branchName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterModalStatus}
                label="Status"
                onChange={(e) => setFilterModalStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            {/* PIC */}
            <FormControl size="small" fullWidth>
              <InputLabel>PIC / Submitted By</InputLabel>
              <Select
                value={filterModalPic}
                label="PIC / Submitted By"
                onChange={(e) => setFilterModalPic(e.target.value)}
              >
                <MenuItem value="">All PIC</MenuItem>
                {allPic.map((pic) => (
                  <MenuItem key={pic} value={pic}>{pic}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Variance */}
            <FormControl size="small" fullWidth>
              <InputLabel>Variance</InputLabel>
              <Select
                value={filterModalHasVariance}
                label="Variance"
                onChange={(e) => setFilterModalHasVariance(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Has Variance</MenuItem>
                <MenuItem value="no">Balanced (No Variance)</MenuItem>
              </Select>
            </FormControl>

            {/* Date Range */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase', fontSize: 11 }}>
                Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="date"
                  label="Start Date"
                  value={filterModalDateStart}
                  onChange={(e) => setFilterModalDateStart(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
                <Typography variant="caption" color="text.secondary">–</Typography>
                <TextField
                  size="small"
                  type="date"
                  label="End Date"
                  value={filterModalDateEnd}
                  onChange={(e) => setFilterModalDateEnd(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Drawer Actions */}
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, flexShrink: 0, bgcolor: 'background.paper' }}>
          <Button variant="outlined" color="inherit" size="small" onClick={clearAllFilters} fullWidth>
            Clear All
          </Button>
          <Button variant="contained" size="small" onClick={applyFilterModal} fullWidth>
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* View Drawer */}
      <Drawer
        anchor="right"
        open={!!viewing}
        onClose={() => setViewing(null)}
        slotProps={{
          paper: {
            sx: {
              width: 720, maxWidth: '100vw', borderRadius: '16px 0 0 16px',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            },
          },
          backdrop: { sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.4)' } },
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <InfoIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Stock Opname Detail</Typography>
              <Typography variant="caption" color="text.secondary">
                {viewing?.branchName} — {viewing?.periodLabel}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setViewing(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          {viewing && (
            <>
              <Box
                sx={{
                  display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                  gap: 2, mb: 2.5, p: 2, bgcolor: 'grey.50', borderRadius: 2,
                  border: '1px solid', borderColor: 'divider',
                }}
              >
                {[
                  { label: 'Branch', value: viewing.branchName },
                  { label: 'Type', value: viewing.branchType },
                  { label: 'Date', value: viewing.soDate },
                  { label: 'Period', value: viewing.periodLabel },
                  { label: 'Status', value: STATUS_COLORS[viewing.status].label },
                  { label: 'PIC', value: viewing.submittedBy },
                  {
                    label: 'Variance',
                    value: viewing.varianceValue !== 0 ? fmtCurr(viewing.varianceValue) : 'Balanced',
                  },
                  { label: 'Last Updated', value: viewing.updatedAt || '—' },
                ].map((f) => (
                  <Box key={f.label}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.value}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Line Items ({viewDetails.length})
              </Typography>
              <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', maxHeight: 520 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      {['Product', 'Unit', 'Beg. Bal.', 'Balance', 'Actual', 'Variance', 'Value'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap', fontSize: 12 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetails.map((d) => (
                      <TableRow key={d.detailId} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>{d.productName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 11 }}>{d.productCode}</Typography>
                        </TableCell>
                        <TableCell align="center"><Typography variant="caption">{d.uomName}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{d.beginningBalance}</Typography></TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.balanceStock}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main', fontSize: 13 }}>
                            {d.actualStock}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, justifyContent: 'flex-end' }}>
                            {d.varianceQty !== 0 && (
                              <WarningIcon sx={{ fontSize: 11, color: 'error.main' }} />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace', fontWeight: 700, fontSize: 12,
                                color: d.varianceQty !== 0 ? 'error.main' : 'success.main',
                              }}
                            >
                              {d.varianceQty > 0 ? '+' : ''}{d.varianceQty}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace', fontWeight: 600, fontSize: 12,
                              color: d.varianceValue !== 0 ? 'error.main' : 'text.primary',
                            }}
                          >
                            {d.varianceValue !== 0 ? fmtCurr(d.varianceValue) : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>

        <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => setViewing(null)} color="inherit">Close</Button>
        </Box>
      </Drawer>

      {/* Delete Drawer */}
      <DataDrawer
        open={deleteDrawerOpen}
        mode="delete"
        title="Stock Opname"
        subtitle={`Confirm deletion of Stock Opname record — ${deleteTarget?.periodLabel}`}
        fields={deleteFields2}
        values={deleteTarget ? {
          branchName: deleteTarget.branchName,
          periodLabel: deleteTarget.periodLabel,
          soDate: deleteTarget.soDate,
          status: deleteTarget.status,
        } : {}}
        onChange={() => {}}
        onSave={() => {}}
        onDelete={handleDeleteConfirm}
        onClose={() => { setDeleteDrawerOpen(false); setDeleteTarget(null); }}
        saving={deleteLoading}
        deleteLoading={deleteLoading}
        width={520}
      />

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
