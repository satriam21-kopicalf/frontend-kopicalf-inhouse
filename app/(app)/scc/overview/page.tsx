'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Divider
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  DeleteSweep as WasteIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import TrendAnalysis from '@/components/TrendAnalysis';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_COGS_RATIO_DATA,
  MOCK_STOCK_OPNAMES,
  MOCK_WASTE_RECORDS,
  MOCK_ESTIMASI_BELANJA,
} from '@/lib/mockData';

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export default function SccOverviewPage() {
  const router = useRouter();
  const stats = MOCK_DASHBOARD_STATS;
  const cogsData = MOCK_COGS_RATIO_DATA;
  const stockOpnames = MOCK_STOCK_OPNAMES;
  const wasteRecords = MOCK_WASTE_RECORDS;
  const estimasiBelanja = MOCK_ESTIMASI_BELANJA;

  // Stock Opname stats by status
  const soByStatus = useMemo(() => {
    const counts = { draft: 0, submitted: 0, approved: 0, rejected: 0 };
    stockOpnames.forEach(s => { counts[s.status]++; });
    return counts;
  }, [stockOpnames]);

  // Waste stats by status
  const wasteByStatus = useMemo(() => {
    const counts = { draft: 0, submitted: 0, approved: 0, rejected: 0 };
    wasteRecords.forEach(w => { counts[w.status]++; });
    return counts;
  }, [wasteRecords]);

  // Total waste value
  const totalWasteValue = useMemo(() =>
    wasteRecords.reduce((sum, w) => sum + w.totalValue, 0),
    [wasteRecords]
  );

  // COGS by branch type
  const cogsByBranchType = useMemo(() => {
    const outlet = cogsData.filter(b => b.branchType === 'OUTLET');
    const others = cogsData.filter(b => b.branchType !== 'OUTLET');
    const avgOutlet = outlet.length ? outlet.reduce((s, b) => s + b.cogsRatio, 0) / outlet.length : 0;
    const avgOthers = others.length ? others.reduce((s, b) => s + b.cogsRatio, 0) / others.length : 0;
    return { avgOutlet, avgOthers, outlets: outlet.length, othersCount: others.length };
  }, [cogsData]);

  // Trend data for TrendAnalysis
  const trendData = useMemo(() => {
    return [
      { period: '2026-05', avgCogsRatio: 68.2, avgUsageRatio: 105.1, totalRevenue: 380_000_000, totalCogs: 259_200_000, flaggedBranches: 4 },
      { period: '2026-06', avgCogsRatio: 67.8, avgUsageRatio: 103.8, totalRevenue: 388_000_000, totalCogs: 263_000_000, flaggedBranches: 3 },
      { period: '2026-07', avgCogsRatio: 67.5, avgUsageRatio: 103.2, totalRevenue: 392_000_000, totalCogs: 264_600_000, flaggedBranches: 3 },
      { period: '2026-08', avgCogsRatio: stats.avgCogsRatio, avgUsageRatio: stats.avgUsageRatio, totalRevenue: stats.totalRevenue, totalCogs: stats.totalCogs, flaggedBranches: stats.flaggedOutlets },
    ];
  }, [stats]);

  // Top 5 highest COGS branches
  const topCogsBranches = useMemo(() =>
    [...cogsData].sort((a, b) => b.cogsRatio - a.cogsRatio).slice(0, 5),
    []
  );

  // Most wasted items
  const topWasteItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; code: string; totalValue: number }>();
    wasteRecords.forEach(w => {
      // In mock data we don't have per-item waste, so just show by branch
    });
    return wasteRecords.slice(0, 5);
  }, [wasteRecords]);

  return (
    <Box>
      <PageHeader
        title="Supply Chain Overview"
        subtitle="Cost control summary for all outlets — August 2026"
        breadcrumbs={['Supply Chain & Cost Control', 'Overview']}
      />

      {/* ─── KPI Overview ─── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
        gap: 2, mb: 3,
      }}>
        <StatCard
          label="COGS Ratio"
          value={fmtPct(stats.avgCogsRatio)}
          icon={<TrendingUpIcon />}
          color={stats.avgCogsRatio > 70 ? 'red' : stats.avgCogsRatio > 65 ? 'orange' : 'green'}
          subtext={`Target: 65%`}
          warning={stats.avgCogsRatio > 65}
        />
        <StatCard
          label="Usage Ratio"
          value={fmtPct(stats.avgUsageRatio)}
          icon={<TrendingUpIcon />}
          color={stats.avgUsageRatio > 105 ? 'red' : stats.avgUsageRatio > 100 ? 'orange' : 'green'}
          subtext={stats.avgUsageRatio > 100 ? 'Above 100%' : 'Under control'}
          warning={stats.avgUsageRatio > 100}
        />
        <StatCard
          label="Stock Opnames"
          value={String(stockOpnames.length)}
          icon={<InventoryIcon />}
          color="blue"
          subtext={`${soByStatus.approved} approved`}
        />
        <StatCard
          label="Waste MTD"
          value={fmtCurr(totalWasteValue)}
          icon={<WasteIcon />}
          color="red"
          subtext={`${wasteByStatus.approved} approved`}
        />
      </Box>

      {/* ─── Quick Actions ─── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/scc/stock-opname')}>
          New Stock Opname
        </Button>
        <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => router.push('/scc/waste')}>
          New Waste Record
        </Button>
        <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/scc/estimasi-belanja')}>
          Estimasi Belanja
        </Button>
      </Box>

      {/* ─── Main Content ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Trend Analysis */}
          <TrendAnalysis data={trendData} currentPeriod="August 2026" />

          {/* Stock Opname Summary */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Stock Opname Summary</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/scc/stock-opname')} sx={{ fontSize: 11 }}>
                  Full List
                </Button>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Draft', count: soByStatus.draft, color: '#E8EEF6', textColor: '#0D2B5E', icon: <PendingIcon sx={{ fontSize: 16 }} /> },
                    { label: 'Pending', count: soByStatus.submitted, color: '#DBEAFE', textColor: '#1A4080', icon: <PendingIcon sx={{ fontSize: 16 }} /> },
                    { label: 'Approved', count: soByStatus.approved, color: '#D1FAE5', textColor: '#065F46', icon: <CheckIcon sx={{ fontSize: 16 }} /> },
                    { label: 'Rejected', count: soByStatus.rejected, color: '#FEE2E2', textColor: '#C62828', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
                  ].map(item => (
                    <Grid key={item.label} size={{ xs: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: item.color, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: item.textColor, display: 'flex' }}>{item.icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: item.textColor, display: 'block', fontWeight: 600, fontSize: 11 }}>
                            {item.count}
                          </Typography>
                          <Typography variant="caption" sx={{ color: item.textColor, fontSize: 10 }}>
                            {item.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  By Period Type
                </Typography>
                {(['daily_packaging', 'weekly', 'monthly'] as const).map(pt => {
                  const count = stockOpnames.filter(s => s.periodType === pt).length;
                  const label = pt === 'daily_packaging' ? 'Daily Packaging' : pt === 'weekly' ? 'Weekly' : 'Monthly';
                  return (
                    <Box key={pt} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: 13 }}>{label}</Typography>
                      <Chip label={`${count} records`} size="small" sx={{ fontSize: 10 }} />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top 5 Branches by COGS */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Top 5 Branches by COGS Ratio
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['#', 'Branch', 'Revenue', 'COGS%', 'Gap', 'Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCogsBranches.map((b, i) => (
                      <TableRow key={b.branchId} hover>
                        <TableCell sx={{ py: 0.75, width: 28 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 11 }}>{i + 1}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{b.branchName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 10 }}>{b.branchCode}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{fmtCurr(b.revenue)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(b.cogsRatio, 100)}
                              sx={{ width: 40, height: 5, borderRadius: 3, bgcolor: 'grey.200' }}
                              color={b.cogsRatio > 70 ? 'error' : b.cogsRatio > 65 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 10, minWidth: 38, color: b.cogsRatio > 70 ? 'error.main' : b.cogsRatio > 65 ? 'warning.main' : 'success.main' }}>
                              {fmtPct(b.cogsRatio)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 10, color: b.gap > 0 ? 'error.main' : 'success.main' }}>
                            {b.gap > 0 ? '+' : ''}{fmtPct(b.gap)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          {b.flagged ? (
                            <Chip size="small" icon={<WarningIcon sx={{ fontSize: '10px !important' }} />} label="Flagged" color="error" sx={{ fontSize: 9, height: 18 }} />
                          ) : (
                            <Chip size="small" icon={<CheckIcon sx={{ fontSize: '10px !important' }} />} label="OK" color="success" sx={{ fontSize: 9, height: 18 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* COGS by Branch Type */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  COGS by Branch Type
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Outlet</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: cogsByBranchType.avgOutlet > 65 ? 'error.main' : 'success.main' }}>
                        {fmtPct(cogsByBranchType.avgOutlet)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(cogsByBranchType.avgOutlet, 100)}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'grey.200' }}
                      color={cogsByBranchType.avgOutlet > 70 ? 'error' : cogsByBranchType.avgOutlet > 65 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption" color="text.secondary">{cogsByBranchType.outlets} branches</Typography>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>HUB WH / HUB CK</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: cogsByBranchType.avgOthers > 65 ? 'error.main' : 'success.main' }}>
                        {fmtPct(cogsByBranchType.avgOthers)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(cogsByBranchType.avgOthers, 100)}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'grey.200' }}
                      color={cogsByBranchType.avgOthers > 70 ? 'error' : cogsByBranchType.avgOthers > 65 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption" color="text.secondary">{cogsByBranchType.othersCount} branches</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Target COGS Ratio</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>65%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Waste Summary */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WasteIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Waste Summary</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/scc/waste')} sx={{ fontSize: 11 }}>
                  Full List
                </Button>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {[
                    { label: 'Draft', count: wasteByStatus.draft, color: '#E8EEF6', textColor: '#0D2B5E' },
                    { label: 'Pending', count: wasteByStatus.submitted, color: '#DBEAFE', textColor: '#1A4080' },
                    { label: 'Approved', count: wasteByStatus.approved, color: '#D1FAE5', textColor: '#065F46' },
                    { label: 'Rejected', count: wasteByStatus.rejected, color: '#FEE2E2', textColor: '#C62828' },
                  ].map(item => (
                    <Grid key={item.label} size={{ xs: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: item.color, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: item.textColor, fontWeight: 700, fontSize: 16, display: 'block' }}>
                          {item.count}
                        </Typography>
                        <Typography variant="caption" sx={{ color: item.textColor, fontSize: 10 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Waste Value</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{fmtCurr(totalWasteValue)}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  From {wasteRecords.length} waste records in August 2026
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Critical Stock Alert */}
          <Card sx={{ border: '1px solid', borderColor: 'error.light', bgcolor: '#FFF5F5' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'error.light', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ color: 'error.main', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
                  Critical Stock Alert
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {estimasiBelanja.slice(0, 3).map(item => (
                  <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{item.productName}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 10 }}>{item.productCode}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'error.main', fontSize: 11 }}>
                        {item.daysInStock.toFixed(1)}d left
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: 10 }}>
                        Order: {Math.ceil(item.estimasiQty)} {item.uomName}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Button size="small" fullWidth variant="outlined" color="error" sx={{ mt: 1 }} onClick={() => router.push('/scc/estimasi-belanja')}>
                  View All Critical Items
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
