'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, MenuItem, Select,
  InputAdornment, TablePagination, IconButton, Tooltip, Button,
  CircularProgress, Alert, LinearProgress, Card, CardContent,
  Grid, Paper
} from '@mui/material';
import {
  Search as SearchIcon, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon, TrendingFlat as TrendingFlatIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  Download as DownloadIcon, Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  DeleteSweep as WasteIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import TrendAnalysis from '@/components/TrendAnalysis';
import { COGSRatioData, apiClient, formatCurrency, formatPercentage } from '@/lib/api/client';
import { PeriodOption } from '@/lib/api/client';

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
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState<PeriodOption[]>([]);

  const [data, setData] = useState<COGSRatioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [showTrends, setShowTrends] = useState(false);

  const fetchTrendData = async () => {
    if (!selectedPeriod) return;
    
    try {
      setLoadingTrends(true);
      const trends = await apiClient.getCOGSTrend(undefined, undefined);
      setTrendData(trends);
    } catch (err) {
      console.error('Error fetching trend data:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const fetchData = async (period?: string) => {
    try {
      setLoading(true);
      setError(null);

      const targetPeriod = period || selectedPeriod || new Date().toISOString().slice(0, 7);
      const response = await apiClient.getCOGSRatio(targetPeriod, typeFilter !== 'ALL' ? typeFilter : undefined);
      setData(response.data);
      
      if (!selectedPeriod) {
        setSelectedPeriod(targetPeriod);
      }
      
      if (showTrends) {
        await fetchTrendData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch COGS ratio data');
      console.error('Error fetching COGS ratio:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const periods = await apiClient.getAvailablePeriods();
      setAvailablePeriods(periods);
      if (!selectedPeriod && periods.length > 0) {
        setSelectedPeriod(periods[0].value);
      }
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchData(selectedPeriod);
    }
  }, [typeFilter, selectedPeriod]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvContent = await apiClient.exportCOGSToCSV(selectedPeriod, typeFilter !== 'ALL' ? typeFilter : undefined);
      const filename = `cogs-ratio-${selectedPeriod}.csv`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      console.error('Error exporting COGS data:', err);
    } finally {
      setExporting(false);
    }
  };

  const handlePeriodChange = (event: any) => {
    const newPeriod = event.target.value;
    setSelectedPeriod(newPeriod);
    setPage(0);
  };

  const filtered = useMemo(() => {
    let filteredData = data;
    if (flaggedFilter === 'FLAGGED') {
      filteredData = filteredData.filter((d) => d.flagged);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filteredData = filteredData.filter(
        (d) =>
          d.branchName.toLowerCase().includes(q) ||
          d.branchCode.toLowerCase().includes(q)
      );
    }
    return filteredData;
  }, [data, search, flaggedFilter]);

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
    const totalMaterialCost = data.reduce((s, d) => s + (d.materialCost || 0), 0);
    const totalWasteCost = data.reduce((s, d) => s + (d.wasteCost || 0), 0);
    
    return { 
      total, 
      flagged, 
      avgCogs, 
      avgUsage, 
      totalRevenue, 
      totalCogs,
      totalMaterialCost,
      totalWasteCost
    };
  }, [filtered]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  if (loading && data.length === 0) {
    return (
      <Box>
        <PageHeader
          title="COGS Ratio Analysis"
          subtitle="Branch-level COGS and usage ratio analytics with real-time data integration"
          breadcrumbs={['Data', 'Reporting', 'COGS Ratio']}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error && data.length === 0) {
    return (
      <Box>
        <PageHeader
          title="COGS Ratio Analysis"
          subtitle="Branch-level COGS and usage ratio analytics with real-time data integration"
          breadcrumbs={['Data', 'Reporting', 'COGS Ratio']}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="COGS Ratio Analysis"
        subtitle="Branch-level COGS and usage ratio analytics with real-time data integration"
        breadcrumbs={['Data', 'Reporting', 'COGS Ratio']}
      />

      {/* Period Selection & Action Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '25%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                Period:
              </Typography>
              <Select
                size="small"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                sx={{ minWidth: 140 }}
                disabled={loading}
              >
                {availablePeriods.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '75%' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
              <Button
                variant={showTrends ? "contained" : "outlined"}
                size="small"
                onClick={() => {
                  setShowTrends(!showTrends);
                  if (!showTrends) {
                    fetchTrendData();
                  }
                }}
                disabled={loadingTrends}
              >
                {showTrends ? 'Hide Trends' : 'Show Trends'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={loading || exporting}
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        {[
          { 
            label: 'Total Branches', 
            value: kpis.total, 
            icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
            color: 'primary.main'
          },
          { 
            label: 'Flagged Branches', 
            value: kpis.flagged, 
            icon: <WarningIcon sx={{ fontSize: 24 }} />,
            color: kpis.flagged > 0 ? 'error.main' : 'success.main'
          },
          { 
            label: 'Avg COGS Ratio', 
            value: formatPercentage(kpis.avgCogs), 
            icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
            color: kpis.avgCogs > 70 ? 'error.main' : kpis.avgCogs > 65 ? 'warning.main' : 'success.main'
          },
          { 
            label: 'Avg Usage Ratio', 
            value: formatPercentage(kpis.avgUsage), 
            icon: <InventoryIcon sx={{ fontSize: 24 }} />,
            color: kpis.avgUsage > 105 ? 'error.main' : kpis.avgUsage > 100 ? 'warning.main' : 'success.main'
          },
          { 
            label: 'Total Revenue', 
            value: formatCurrency(kpis.totalRevenue), 
            icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
            color: 'info.main'
          },
          { 
            label: 'Total COGS', 
            value: formatCurrency(kpis.totalCogs), 
            icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
            color: 'text.primary'
          },
          { 
            label: 'Material Cost', 
            value: formatCurrency(kpis.totalMaterialCost), 
            icon: <InventoryIcon sx={{ fontSize: 24 }} />,
            color: 'success.main'
          },
          { 
            label: 'Waste Cost', 
            value: formatCurrency(kpis.totalWasteCost), 
            icon: <WasteIcon sx={{ fontSize: 24 }} />,
            color: 'error.main'
          },
        ].map((kpi) => (
          <Box key={kpi.label}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    {kpi.label}
                  </Typography>
                  <Box sx={{ color: kpi.color, opacity: 0.7 }}>
                    {kpi.icon}
                  </Box>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: '1.1rem',
                    color: kpi.color 
                  }}
                >
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Trend Analysis Section */}
      {showTrends && (
        <Box sx={{ mb: 2 }}>
          {loadingTrends ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading trend analysis...
              </Typography>
            </Paper>
          ) : (
            <TrendAnalysis data={trendData} currentPeriod={selectedPeriod} />
          )}
        </Box>
      )}

      {loading && data.length > 0 && (
        <LinearProgress sx={{ height: 2, mb: 2 }} />
      )}

      {error && !loading && data.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
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
            label={`${filtered.length} branches`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Box>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
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
                  { label: 'Material Cost', minWidth: 120, align: 'right' as const },
                  { label: 'Waste Cost', minWidth: 120, align: 'right' as const },
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
                        {formatCurrency(row.revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {formatCurrency(row.cogs)}
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
                        {formatPercentage(row.cogsRatio)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {formatPercentage(row.targetCogsRatio)}
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
                        {row.gap > 0 ? '+' : ''}{formatPercentage(row.gap)}
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
                        {formatPercentage(row.usageRatio)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {formatCurrency(row.materialCost || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'error.main' }}>
                        {formatCurrency(row.wasteCost || 0)}
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
                  <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
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