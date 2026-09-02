'use client';

import { useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Drawer,
  TextField, MenuItem, Snackbar, Alert, Select, FormControl,
  InputLabel, InputAdornment, Button, Chip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Tune as TuneIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import DataDrawer from '@/components/DataDrawer';
import WasteForm from '@/components/WasteForm';
import { MOCK_WASTE_RECORDS, MOCK_WASTE_DETAILS, WasteRecord, WasteStatus } from '@/lib/mockData';
import { useCreateWaste } from '@/lib/hooks/stock-opname';
import type { WasteFormValues } from '@/components/WasteForm';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<WasteStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: '#E8EEF6', color: '#0D2B5E', label: 'Draft' },
  submitted: { bg: '#DBEAFE', color: '#1A4080', label: 'Submitted' },
  approved: { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
  rejected: { bg: '#FEE2E2', color: '#C62828', label: 'Rejected' },
};

export default function WastePage() {
  // Form drawer state
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const createMutation = useCreateWaste();

  const [records] = useState<WasteRecord[]>(
    () => [...MOCK_WASTE_RECORDS].sort((a, b) => b.wasteId - a.wasteId)
  );

  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPic, setFilterPic] = useState('');
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState<WasteRecord | null>(null);
  const [viewDetails, setViewDetails] = useState<typeof MOCK_WASTE_DETAILS>([]);
  const [deleteTarget, setDeleteTarget] = useState<WasteRecord | null>(null);
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
  const [filterModalMinValue, setFilterModalMinValue] = useState('');
  const [filterModalMaxValue, setFilterModalMaxValue] = useState('');

  const ROWS_PER_PAGE = 20;

  const filtered = useMemo(() => {
    let list = records;
    if (filterBranch) list = list.filter((r) => r.branchId === Number(filterBranch));
    if (filterStatus) list = list.filter((r) => r.status === filterStatus);
    if (filterPic) list = list.filter((r) => r.submittedBy.toLowerCase().includes(filterPic.toLowerCase()));
    if (dateStart) list = list.filter((r) => r.wasteDate >= dateStart);
    if (dateEnd) list = list.filter((r) => r.wasteDate <= dateEnd);
    if (filterModalMinValue) list = list.filter((r) => r.totalValue >= Number(filterModalMinValue));
    if (filterModalMaxValue) list = list.filter((r) => r.totalValue <= Number(filterModalMaxValue));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.branchName.toLowerCase().includes(q) ||
          r.wasteDate.includes(q) ||
          r.submittedBy.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    return list;
  }, [records, filterBranch, filterStatus, filterPic, dateStart, dateEnd, search, filterModalMinValue, filterModalMaxValue]);

  const detailCount = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of MOCK_WASTE_DETAILS) {
      map.set(d.wasteId, (map.get(d.wasteId) ?? 0) + 1);
    }
    return map;
  }, []);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const approved = filtered.filter((r) => r.status === 'approved').length;
    const pending = filtered.filter((r) => r.status === 'submitted').length;
    const lossValue = filtered.reduce((s, r) => s + r.totalValue, 0);
    return { total, approved, pending, lossValue };
  }, [filtered]);

  // All unique PICs for filter
  const allPic = useMemo(() => [...new Set(records.map((r) => r.submittedBy))].sort(), [records]);

  const openView = (row: WasteRecord) => {
    setViewing({ ...row });
    setViewDetails(MOCK_WASTE_DETAILS.filter((d) => d.wasteId === row.wasteId).map((d) => ({ ...d })));
  };

  const handleDeleteOpen = (row: WasteRecord) => {
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
    setToast({ open: true, msg: 'Waste record deleted successfully.', sev: 'error' });
  };

  const handleCreateWaste = async (data: WasteFormValues) => {
    await createMutation.mutateAsync({
      branchId: data.branchId,
      wasteDate: data.wasteDate,
      details: data.details.map((d) => ({
        productCode: d.productCode,
        qty: d.qty,
        reason: d.reason,
        notes: d.notes,
      })),
      notes: data.notes,
    });
    setFormDrawerOpen(false);
    setToast({ open: true, msg: 'Waste saved successfully!', sev: 'success' });
  };

  const clearDateFilter = () => { setDateStart(''); setDateEnd(''); setPage(0); };

  const paginated = filtered.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  const deleteFields = deleteTarget
    ? [
        { name: 'branchName', label: 'Branch', type: 'readonly' as const },
        { name: 'wasteDate', label: 'Date', type: 'readonly' as const },
        { name: 'totalValue', label: 'Total Value', type: 'readonly' as const },
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
    setFilterModalMinValue('');
    setFilterModalMaxValue('');
    setPage(0);
  };

  const hasActiveFilters = !!(filterBranch || filterStatus || filterPic || dateStart || dateEnd);

  return (
    <Box>
      <PageHeader
        title="Waste Management"
        subtitle="Track and manage waste records across all branches"
        breadcrumbs={['Supply Chain & Cost Control', 'Waste']}
        actions={
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            onClick={() => setFormDrawerOpen(true)}
            size="small"
          >
            New Waste
          </Button>
        }
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
          { label: 'Approved', value: kpis.approved, color: '#065F46' },
          { label: 'Pending', value: kpis.pending, color: '#1A4080' },
          { label: 'Total Loss', value: fmtCurr(kpis.lossValue), color: '#C62828' },
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
        {/* Compact filter bar */}
        <Box
          sx={{
            display: 'flex', gap: 1.5, px: 2.5, py: 1.25,
            borderBottom: '1px solid', borderColor: 'divider',
            alignItems: 'center', flexWrap: 'wrap',
          }}
        >
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

          {/* Quick date filter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <SearchIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <TextField
              size="small"
              type="date"
              label="Start"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setPage(0); }}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 150, fontSize: 12.5 }}
            />
            <Typography variant="caption" color="text.secondary">–</Typography>
            <TextField
              size="small"
              type="date"
              label="End"
              value={dateEnd}
              onChange={(e) => { setDateEnd(e.target.value); setPage(0); }}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 150, fontSize: 12.5 }}
            />
            {(dateStart || dateEnd) && (
              <Tooltip title="Clear date filter">
                <IconButton size="small" onClick={clearDateFilter}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', width: '100%', mt: 0.5 }}>
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
                  label={`Status: ${STATUS_COLORS[filterStatus as WasteStatus].label}`}
                  size="small"
                  onDelete={() => { setFilterStatus(''); }}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {filterPic && (
                <Chip
                  label={`PIC: ${filterPic}`}
                  size="small"
                  onDelete={() => { setFilterPic(''); }}
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
              <TableRow sx={{ bgcolor: 'primary.dark' }}>
                {['#', 'Date', 'Branch', 'Items', 'Total Qty', 'Total Value', 'Status', 'PIC', 'Notes', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ color: 'white', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', bgcolor: 'primary.dark' }}
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
                  <TableRow key={r.wasteId} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 11 }}>
                        {r.wasteId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.wasteDate}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>{r.branchName}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: 10, fontWeight: 700,
                          bgcolor: r.branchType === 'OUTLET' ? '#DBEAFE' : r.branchType === 'HUB WH' ? '#FEF3C7' : '#EDE9FE',
                          color: r.branchType === 'OUTLET' ? '#1A4080' : r.branchType === 'HUB WH' ? '#92400E' : '#5B21B6',
                        }}
                      >
                        {r.branchType}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>{detailCount.get(r.wasteId) ?? 0}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, color: 'text.primary' }}>{r.totalQty}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#C62828', fontSize: 13 }}>
                        {fmtCurr(r.totalValue)}
                      </Typography>
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
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: 12 }}>{r.submittedBy}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 140 }}>
                      <Tooltip title={r.notes || '—'}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', display: 'block', cursor: 'default', fontSize: 11,
                          }}
                        >
                          {r.notes || '—'}
                        </Typography>
                      </Tooltip>
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
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Branch */}
            <FormControl size="small" fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select
                value={filterModalBranch}
                label="Branch"
                onChange={(e) => setFilterModalBranch(e.target.value)}
              >
                <MenuItem value="">All Branches</MenuItem>
                {[...new Map(records.map((r) => [r.branchId, r])).values()].map((r) => (
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

            {/* Value Range */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase', fontSize: 11 }}>
                Total Value Range (IDR)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  label="Min Value"
                  value={filterModalMinValue}
                  onChange={(e) => setFilterModalMinValue(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
                <Typography variant="caption" color="text.secondary">–</Typography>
                <TextField
                  size="small"
                  type="number"
                  label="Max Value"
                  value={filterModalMaxValue}
                  onChange={(e) => setFilterModalMaxValue(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Box>
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
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Waste Record Detail</Typography>
              <Typography variant="caption" color="text.secondary">
                {viewing?.branchName} — {viewing?.wasteDate}
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
                  gap: 2, mb: 2.5, p: 2, bgcolor: '#E8EEF6', borderRadius: 2,
                  border: '1px solid', borderColor: 'divider',
                }}
              >
                {[
                  { label: 'Branch', value: viewing.branchName },
                  { label: 'Type', value: viewing.branchType },
                  { label: 'Date', value: viewing.wasteDate },
                  { label: 'PIC', value: viewing.submittedBy },
                  { label: 'Status', value: STATUS_COLORS[viewing.status].label },
                  { label: 'Total Qty', value: viewing.totalQty },
                  { label: 'Total Value', value: fmtCurr(viewing.totalValue) },
                  { label: 'Last Updated', value: viewing.updatedAt || '—' },
                ].map((f) => (
                  <Box key={f.label}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.value}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Line Items ({viewDetails.length})
                </Typography>
                <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>
                  Total: {fmtCurr(viewDetails.reduce((s, d) => s + d.totalValue, 0))}
                </Typography>
              </Box>

              <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', maxHeight: 460 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#E8EEF6' }}>
                      {['Product', 'Unit', 'Qty', 'Unit Price', 'Total', 'Reason'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: 'primary.main' }}>{h}</TableCell>
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
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{d.qty}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{fmtCurr(d.unitPrice)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'error.main', fontSize: 13 }}>
                            {fmtCurr(d.totalValue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{ px: 1, py: 0.5, borderRadius: 1, fontSize: 11, fontWeight: 600, bgcolor: '#fee2e2', color: '#991b1b' }}
                          >
                            {d.reason}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {viewing.notes && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#E8EEF6', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{viewing.notes}</Typography>
                </Box>
              )}
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
        title="Waste Record"
        subtitle={`Confirm deletion of waste record — ${deleteTarget?.branchName} on ${deleteTarget?.wasteDate}`}
        fields={deleteFields}
        values={deleteTarget ? {
          branchName: deleteTarget.branchName,
          wasteDate: deleteTarget.wasteDate,
          totalValue: deleteTarget.totalValue,
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

      {/* Form Drawer */}
      <Drawer
        anchor="right"
        open={formDrawerOpen}
        onClose={() => setFormDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 600 },
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
          bgcolor: 'error.main',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddIcon sx={{ fontSize: 18, color: 'white' }} />
            <Typography sx={{ fontWeight: 700, color: 'white', fontSize: 15 }}>
              New Waste
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setFormDrawerOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <WasteForm
            onSubmit={handleCreateWaste}
            onCancel={() => setFormDrawerOpen(false)}
          />
        </Box>
      </Drawer>
    </Box>
  );
}
