'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, TextField, MenuItem, Select, InputAdornment, 
  Button, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress,
  Tabs, Tab, Paper, IconButton, Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Store as StoreIcon,
  LocalDrink as LocalDrinkIcon
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { apiClient, SalesRecapDetail, SalesRecapHead, formatCurrency, formatPercentage } from '@/lib/api/client';

const BRANCH_TYPE_OPTIONS = ['ALL', 'OUTLET', 'HUB WH', 'HUB CK'];
const ROWS_PER_PAGE = 25;

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [branchTypeFilter, setBranchTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  
  const [salesDetails, setSalesDetails] = useState<SalesRecapDetail[]>([]);
  const [salesHeads, setSalesHeads] = useState<SalesRecapHead[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [detailsData, headsData, summaryData] = await Promise.all([
        apiClient.getSalesRecapDetail(selectedPeriod),
        apiClient.getSalesRecapHead(selectedPeriod),
        apiClient.getSalesSummary(selectedPeriod)
      ]);

      setSalesDetails(detailsData);
      setSalesHeads(headsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales data');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    const csvContent = generateSalesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${selectedPeriod}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateSalesCSV = () => {
    const headers = [
      'Sales Number', 'Sales Date', 'Branch Code', 'Menu Code', 
      'Menu Name', 'Category', 'Quantity', 'Price', 'Discount', 
      'Total', 'Cost', 'COGS', 'Synced At'
    ];
    
    const rows = filteredDetails.map(row => [
      row.sales_num,
      row.sales_date,
      row.branch_code,
      row.menu_code,
      `"${row.menu_name}"`,
      row.category_name,
      row.qty,
      row.price,
      row.discount,
      row.total,
      row.cost,
      row.cogs,
      row.synced_at
    ].join(','));
    
    return [headers.join(','), ...rows].join('\n');
  };

  const filteredDetails = useMemo(() => {
    let filtered = salesDetails;
    
    if (branchTypeFilter !== 'ALL') {
      // This would need to be enhanced with actual branch type data
      // For now, we'll filter by branch code patterns if available
      filtered = filtered.filter(item => {
        if (branchTypeFilter === 'OUTLET') return item.branch_code.startsWith('CTG') || item.branch_code.startsWith('CCI');
        if (branchTypeFilter === 'HUB WH') return item.branch_code.startsWith('WH');
        if (branchTypeFilter === 'HUB CK') return item.branch_code.startsWith('CK');
        return true;
      });
    }
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.menu_name.toLowerCase().includes(q) ||
        item.menu_code.toLowerCase().includes(q) ||
        item.branch_code.toLowerCase().includes(q) ||
        item.category_name.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [salesDetails, branchTypeFilter, searchTerm]);

  const paginatedDetails = useMemo(() => {
    return filteredDetails.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  }, [filteredDetails, page]);

  const summaryStats = useMemo(() => {
    if (!summary || filteredDetails.length === 0) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        totalItems: 0,
        avgTicketSize: 0,
        totalCOGS: 0,
        avgCOGSRatio: 0,
        uniqueBranches: 0,
        uniqueProducts: 0
      };
    }

    const totalRevenue = filteredDetails.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = new Set(filteredDetails.map(item => item.sales_num)).size;
    const totalItems = filteredDetails.reduce((sum, item) => sum + item.qty, 0);
    const avgTicketSize = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalCOGS = filteredDetails.reduce((sum, item) => sum + (item.cogs || 0), 0);
    const avgCOGSRatio = totalRevenue > 0 ? (totalCOGS / totalRevenue) * 100 : 0;
    const uniqueBranches = new Set(filteredDetails.map(item => item.branch_code)).size;
    const uniqueProducts = new Set(filteredDetails.map(item => item.menu_code)).size;

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      avgTicketSize,
      totalCOGS,
      avgCOGSRatio,
      uniqueBranches,
      uniqueProducts
    };
  }, [filteredDetails, summary]);

  if (loading && salesDetails.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Sales Recapitulation Report"
          subtitle="Detailed sales data from v_sales_recap_detail — supporting COGS & Usage Ratio calculations"
          breadcrumbs={['Data', 'Reporting', 'Sales']}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Sales Recapitulation Report"
        subtitle="Detailed sales data from v_sales_recap_detail — supporting COGS & Usage Ratio calculations"
        breadcrumbs={['Data', 'Reporting', 'Sales']}
      />

      {/* Period Selection & Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '25%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 50 }}>
                Period:
              </Typography>
              <TextField
                type="month"
                size="small"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                sx={{ minWidth: 140 }}
              />
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '25%' } }}>
            <TextField
              size="small"
              placeholder="Search menu, branch, or category..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              fullWidth
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
          </Box>

          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '16.67%' } }}>
            <Select
              size="small"
              value={branchTypeFilter}
              onChange={(e) => { setBranchTypeFilter(e.target.value); setPage(0); }}
              fullWidth
            >
              {BRANCH_TYPE_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option === 'ALL' ? 'All Branch Types' : option}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '33.33%' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Chip 
                label={`${filteredDetails.length} records`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Summary KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 2 }}>
        {[
          { 
            label: 'Total Revenue', 
            value: formatCurrency(summaryStats.totalRevenue), 
            icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
            color: 'primary.main',
            subtext: `${summaryStats.totalTransactions} transactions`
          },
          { 
            label: 'Total Items Sold', 
            value: summaryStats.totalItems.toLocaleString(), 
            icon: <LocalDrinkIcon sx={{ fontSize: 24 }} />,
            color: 'success.main',
            subtext: `Avg ${summaryStats.totalTransactions > 0 ? (summaryStats.totalItems / summaryStats.totalTransactions).toFixed(1) : 0} per transaction`
          },
          { 
            label: 'Average Ticket', 
            value: formatCurrency(summaryStats.avgTicketSize), 
            icon: <TrendingUpIcon sx={{ fontSize: 24 }} />,
            color: 'info.main',
            subtext: 'Per transaction average'
          },
          { 
            label: 'Total COGS', 
            value: formatCurrency(summaryStats.totalCOGS), 
            icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
            color: summaryStats.avgCOGSRatio > 70 ? 'error.main' : summaryStats.avgCOGSRatio > 65 ? 'warning.main' : 'success.main',
            subtext: `${formatPercentage(summaryStats.avgCOGSRatio)} of revenue`
          },
          { 
            label: 'Active Branches', 
            value: summaryStats.uniqueBranches, 
            icon: <StoreIcon sx={{ fontSize: 24 }} />,
            color: 'text.primary',
            subtext: 'With sales this period'
          },
          { 
            label: 'Products Sold', 
            value: summaryStats.uniqueProducts, 
            icon: <LocalDrinkIcon sx={{ fontSize: 24 }} />,
            color: 'text.primary',
            subtext: 'Unique menu items'
          },
        ].map((kpi) => (
          <Box key={kpi.label}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { boxShadow: 2 }
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
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  {kpi.subtext}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {error && !loading && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Sales Line Items ({filteredDetails.length} records)
          </Typography>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 12 } }}
          >
            <Tab label="Detail View" value={0} />
            <Tab label="Summary View" value={1} />
          </Tabs>
        </Box>

        {tabValue === 0 ? (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.900' }}>
                  {[
                    { label: 'Sales #', minWidth: 100 },
                    { label: 'Date', minWidth: 90 },
                    { label: 'Branch', minWidth: 80 },
                    { label: 'Menu Code', minWidth: 80 },
                    { label: 'Menu Name', minWidth: 200 },
                    { label: 'Category', minWidth: 100 },
                    { label: 'Qty', minWidth: 60, align: 'right' as const },
                    { label: 'Price', minWidth: 80, align: 'right' as const },
                    { label: 'Discount', minWidth: 70, align: 'right' as const },
                    { label: 'Total', minWidth: 90, align: 'right' as const },
                    { label: 'COGS', minWidth: 80, align: 'right' as const },
                    { label: 'COGS %', minWidth: 70, align: 'center' as const },
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
                {paginatedDetails.map((row) => {
                  const cogsRatio = row.total > 0 ? ((row.cogs || 0) / row.total) * 100 : 0;
                  return (
                    <TableRow key={`${row.sales_num}-${row.menu_code}`} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'primary.main', fontWeight: 600 }}>
                          {row.sales_num}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {row.sales_date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                          {row.branch_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                          {row.menu_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>
                          {row.menu_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.category_name} sx={{ fontSize: '0.65rem', height: 18 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {row.qty}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {formatCurrency(row.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: row.discount > 0 ? 'error.main' : 'text.secondary' }}>
                          {row.discount > 0 ? `-${formatCurrency(row.discount)}` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                          {formatCurrency(row.total)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                          {formatCurrency(row.cogs || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 600, 
                            fontSize: 11,
                            color: cogsRatio > 70 ? 'error.main' : cogsRatio > 65 ? 'warning.main' : 'success.main'
                          }}
                        >
                          {formatPercentage(cogsRatio)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedDetails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {loading ? 'Loading data...' : 'No sales records found for the current filters.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Summary view coming soon...</Typography>
          </Box>
        )}

        {/* Pagination */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {filteredDetails.length === 0 ? 0 : page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filteredDetails.length)} of {filteredDetails.length}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Button size="small" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              Prev
            </Button>
            <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center', fontFamily: 'monospace' }}>
              {page + 1}
            </Typography>
            <Button 
              size="small" 
              onClick={() => setPage(p => Math.min(Math.ceil(filteredDetails.length / ROWS_PER_PAGE) - 1, p + 1))} 
              disabled={page >= Math.ceil(filteredDetails.length / ROWS_PER_PAGE) - 1}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}