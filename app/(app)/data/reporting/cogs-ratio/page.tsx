'use client';

import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, MenuItem, Select,
  InputAdornment, TablePagination, IconButton, Tooltip, Button,
} from '@mui/material';
import {
  Search as SearchIcon, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon, TrendingFlat as TrendingFlatIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  Download as DownloadIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { MOCK_COGS_RATIO_DATA, COGSRatioData } from '@/lib/mockData';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const BRANCH_TYPE_OPTIONS = ['OUTLET', 'HUB WH', 'HUB CK'];
const ROWS_PER_PAGE = 20;

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
  if (trend === 'up')
    return <TrendingUpIcon sx={{ fontSize: 16, color: 'error.main' }} />;
  if (trend === 'down')
    return <TrendingDownIcon sx={{ fontSize: 16, color: 'success.main' }} />;
  return <TrendingFlatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
};

export default function CogsRatioPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [flaggedFilter, setFlaggedFilter] = useState<'ALL' | 'FLAGGED'>('ALL');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let data = MOCK_COGS_RATIO_DATA;
    if (typeFilter !== 'ALL') {
      data = data.filter((d) => d.branchType === typeFilter);
    }
    if (flaggedFilter === 'FLAGGED') {
      data = data.filter((d) => d.flagged);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.branchName.toLowerCase().includes(q) ||
          d.branchCode.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, typeFilter, flaggedFilter]);

  const paginated = useMemo(
    () => filtered.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [filtered, page]
  );

  const kpis = useMemo(() => {
    const data = filtered;
    const total = data.length;
    const flagged = data.filter((d) => d.flagged).length;
    const avgCogs = data.length
      ? data.reduce((s, d) => s + d.cogsRatio, 0) / data.length
      : 0;
    const avgUsage = data.length
      ? data.reduce((s, d) => s + d.usageRatio, 0) / data.length
      : 0;
    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const totalCogs = data.reduce((s, d) => s + d.cogs, 0);
    return { total, flagged, avgCogs, avgUsage, totalRevenue, totalCogs };
  }, [filtered]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  return (
    <Box>
      <PageHeader
        title="COGS Ratio Report"
        subtitle="Branch-level COGS and usage ratio — consumed from ERP ESB. Data source for dashboard COGS Ratio and Usage Ratio calculations."
        breadcrumbs={['Data', 'Reporting', 'COGS Ratio']}
      />

      {/* ─── Summary strip ─── */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mb: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
          {[
            { label: 'Total Branches', value: kpis.total },
            { label: 'Flagged', value: kpis.flagged, color: kpis.flagged > 0 ? 'error.main' : undefined },
            { label: 'Avg COGS Ratio', value: fmtPct(kpis.avgCogs) },
            { label: 'Avg Usage Ratio', value: fmtPct(kpis.avgUsage) },
            { label: 'Total Revenue', value: fmtCurr(kpis.totalRevenue) },
            { label: 'Total COGS', value: fmtCurr(kpis.totalCogs) },
          ].map((s) => (
            <Box key={s.label}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                {s.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, lineHeight: 1.2, color: (s as { label: string; value: number | string; color?: string }).color as string || 'text.primary' }}
              >
                {s.value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Tooltip title="Export data">
          <IconButton size="small">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ─── Table ─── */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Filter bar */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            size="small"
            placeholder="Search branch name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, minWidth: 180 }}
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
          <Select
            size="small"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 120, fontSize: 12 }}
          >
            <MenuItem value="ALL">All Types</MenuItem>
            {BRANCH_TYPE_OPTIONS.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
          <Select
            size="small"
            value={flaggedFilter}
            onChange={(e) => { setFlaggedFilter(e.target.value as 'ALL' | 'FLAGGED'); setPage(0); }}
            sx={{ minWidth: 130, fontSize: 12 }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="FLAGGED">Flagged Only</MenuItem>
          </Select>
          <Chip
            label={`${filtered.length} rows`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
          <Tooltip title="Refresh">
            <IconButton size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.900' }}>
                {[
                  { label: 'Branch', minWidth: 200 },
                  { label: 'Type', minWidth: 90 },
                  { label: 'Period', minWidth: 80 },
                  { label: 'Revenue', minWidth: 120, align: 'right' as const },
                  { label: 'COGS', minWidth: 120, align: 'right' as const },
                  { label: 'COGS %', minWidth: 80, align: 'center' as const },
                  { label: 'Target', minWidth: 80, align: 'center' as const },
                  { label: 'Gap', minWidth: 80, align: 'right' as const },
                  { label: 'Usage Ratio', minWidth: 90, align: 'center' as const },
                  { label: 'Flag', minWidth: 70, align: 'center' as const },
                  { label: 'Trend', minWidth: 70, align: 'center' as const },
                  { label: 'Last Updated', minWidth: 110 },
                ].map((col) => (
                  <TableCell
                    key={col.label}
                    sx={{
                      color: 'grey.100',
                      fontWeight: 700,
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                      textAlign: col.align || 'left',
                      minWidth: col.minWidth,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => {
                const overTarget = row.cogsRatio > row.targetCogsRatio;
                return (
                  <TableRow key={row.branchId} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                        {row.branchName}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {row.branchCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.branchType}
                        sx={{
                          fontSize: '0.65rem',
                          height: 18,
                          fontWeight: 700,
                          bgcolor:
                            row.branchType === 'OUTLET'
                              ? 'primary.lighter'
                              : row.branchType === 'HUB WH'
                              ? 'warning.lighter'
                              : 'secondary.lighter',
                          color:
                            row.branchType === 'OUTLET'
                              ? 'primary.dark'
                              : row.branchType === 'HUB WH'
                              ? 'warning.dark'
                              : 'secondary.dark',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {row.period}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {fmtCurr(row.revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {fmtCurr(row.cogs)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: 12,
                          color: overTarget ? 'error.main' : 'success.main',
                        }}
                      >
                        {fmtPct(row.cogsRatio)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {fmtPct(row.targetCogsRatio)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: 12,
                          color: row.gap > 0 ? 'error.main' : row.gap < 0 ? 'success.main' : 'text.secondary',
                        }}
                      >
                        {row.gap > 0 ? '+' : ''}{fmtPct(row.gap)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: 12,
                          color: row.usageRatio > 105 ? 'error.main' : row.usageRatio > 100 ? 'warning.main' : 'success.main',
                        }}
                      >
                        {fmtPct(row.usageRatio)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {row.flagged ? (
                        <Tooltip title="Needs investigation">
                          <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Within threshold">
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <TrendIcon trend={row.trend} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 11 }}>
                        {row.lastUpdated}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No records match the current filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 12 },
          }}
        />
      </Box>
    </Box>
  );
}
