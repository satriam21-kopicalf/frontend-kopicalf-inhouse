'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  DeleteSweep as WasteIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Circle as CircleIcon,
  ArrowForward as ArrowForwardIcon,
  Assessment as AssessmentIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as PurchasedIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
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

export default function DashboardPage() {
  const router = useRouter();
  const stats = MOCK_DASHBOARD_STATS;
  const cogsData = MOCK_COGS_RATIO_DATA;
  const stockOpnames = MOCK_STOCK_OPNAMES;
  const wasteRecords = MOCK_WASTE_RECORDS;
  const estimasiBelanja = MOCK_ESTIMASI_BELANJA;

  // Top flagged branches by COGS
  const topFlagged = useMemo(() =>
    [...cogsData].filter(b => b.flagged).sort((a, b) => b.cogsRatio - a.cogsRatio).slice(0, 5),
    []
  );

  // Recent stock opnames
  const recentStockOpnames = useMemo(() =>
    [...stockOpnames].sort((a, b) => b.soId - a.soId).slice(0, 5),
    []
  );

  // Recent waste records
  const recentWaste = useMemo(() =>
    [...wasteRecords].sort((a, b) => b.wasteId - a.wasteId).slice(0, 5),
    []
  );

  // Critical stock items
  const criticalItems = useMemo(() =>
    estimasiBelanja.filter(i => i.daysInStock < i.daysTarget * 0.5).slice(0, 5),
    []
  );

  // Pending approvals
  const pendingSO = stockOpnames.filter(s => s.status === 'submitted').length;
  const pendingWaste = wasteRecords.filter(w => w.status === 'submitted').length;

  return (
    <Box>
      <PageHeader
        title="Inventory & Cost Control Dashboard"
        subtitle={`Overview for period ${stats.period} — August 2026`}
        breadcrumbs={['Dashboard']}
      />

      {/* ─── KPI Strip ─── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
        gap: 2, mb: 3,
      }}>
        <StatCard
          label="Total Revenue"
          value={fmtCurr(stats.totalRevenue)}
          icon={<MoneyIcon />}
          color="blue"
          subtext={`Avg COGS ${fmtPct(stats.avgCogsRatio)}`}
        />
        <StatCard
          label="Avg Usage Ratio"
          value={fmtPct(stats.avgUsageRatio)}
          icon={<SpeedIcon />}
          color={stats.avgUsageRatio > 105 ? 'red' : stats.avgUsageRatio > 100 ? 'orange' : 'green'}
          subtext={stats.avgUsageRatio > 100 ? 'Above target' : 'Within target'}
          warning={stats.avgUsageRatio > 105}
        />
        <StatCard
          label="Flagged Branches"
          value={String(stats.flaggedOutlets)}
          icon={<WarningIcon />}
          color={stats.flaggedOutlets > 0 ? 'red' : 'green'}
          subtext={`${pendingSO} pending approvals`}
          warning={stats.flaggedOutlets > 0}
        />
        <StatCard
          label="Waste Value MTD"
          value={fmtCurr(stats.wasteValueMTD)}
          icon={<WasteIcon />}
          color="red"
          subtext={`${pendingWaste} pending approvals`}
        />
      </Box>

      {/* ─── Quick Actions ─── */}
      <Box sx={{
        display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap',
        '& > button': { textTransform: 'none', fontSize: 13 }
      }}>
        <Button
          variant="contained"
          startIcon={<InventoryIcon />}
          onClick={() => router.push('/scc/stock-opname')}
        >
          Stock Opname
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<WasteIcon />}
          onClick={() => router.push('/scc/waste')}
        >
          Waste Management
        </Button>
        <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={() => router.push('/scc/overview')}
        >
          SCC Overview
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShippingIcon />}
          onClick={() => router.push('/scc/purchased')}
        >
          Purchased Order
        </Button>
        <Button
          variant="outlined"
          startIcon={<PurchasedIcon />}
          onClick={() => router.push('/scc/estimasi-belanja')}
        >
          Estimasi Belanja
        </Button>
      </Box>

      {/* ─── Main Grid ─── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 3,
      }}>
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Flagged Branches */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ color: 'error.main', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Branches with High Usage Ratio
                  </Typography>
                </Box>
                <Chip label={`${topFlagged.length} flagged`} size="small" color="error" />
              </Box>
              <TableContainer sx={{ maxHeight: 260 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['Branch', 'Revenue', 'COGS Ratio', 'Usage Ratio', 'Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topFlagged.map(b => (
                      <TableRow key={b.branchId} hover>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{b.branchName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 10 }}>{b.branchCode}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{fmtCurr(b.revenue)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: b.cogsRatio > 70 ? 'error.main' : b.cogsRatio > 65 ? 'warning.main' : 'success.main', fontSize: 11 }}>
                            {fmtPct(b.cogsRatio)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(b.usageRatio, 130)}
                              sx={{ width: 50, height: 6, borderRadius: 3, bgcolor: 'grey.200' }}
                              color={b.usageRatio > 110 ? 'error' : b.usageRatio > 100 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 10, minWidth: 35 }}>
                              {fmtPct(b.usageRatio)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <Chip
                            size="small"
                            icon={b.trend === 'up' ? <TrendingUpIcon sx={{ fontSize: '12px !important' }} /> : b.trend === 'down' ? <TrendingDownIcon sx={{ fontSize: '12px !important' }} /> : undefined}
                            label={b.trend === 'up' ? 'Rising' : b.trend === 'down' ? 'Improving' : 'Stable'}
                            color={b.trend === 'up' ? 'error' : b.trend === 'down' ? 'success' : 'default'}
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {topFlagged.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">No flagged branches</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recent Stock Opname */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Stock Opnames</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/scc/stock-opname')} sx={{ fontSize: 11 }}>
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['Date', 'Branch', 'Period', 'Status', 'Variance'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStockOpnames.map(so => (
                      <TableRow key={so.soId} hover>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{so.soDate}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{so.branchName}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontSize: 11 }}>{so.periodLabel}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <Chip
                            size="small"
                            label={so.status.charAt(0).toUpperCase() + so.status.slice(1)}
                            color={so.status === 'approved' ? 'success' : so.status === 'submitted' ? 'info' : 'default'}
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                              color: so.varianceValue !== 0 ? 'error.main' : 'success.main'
                            }}
                          >
                            {so.varianceValue !== 0 ? fmtCurr(so.varianceValue) : 'Balanced'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Critical Stock Items */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ color: 'error.main', fontSize: 16 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Critical Stock Items
                  </Typography>
                </Box>
                <Chip label={`${criticalItems.length} items`} size="small" color="error" />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['Product', 'Current', 'Days', 'Est. Order'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criticalItems.map(item => (
                      <TableRow key={item.productId} hover>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{item.productName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 10 }}>{item.productCode}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {item.currentStock} {item.uomName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{
                            fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                            color: item.daysInStock < 2 ? 'error.main' : item.daysInStock < 3 ? 'warning.main' : 'text.primary'
                          }}>
                            {item.daysInStock.toFixed(1)}d
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: 'error.main' }}>
                            {Math.ceil(item.estimasiQty)} {item.uomName}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {criticalItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">All stock levels are adequate</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recent Waste */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Waste Records</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/scc/waste')} sx={{ fontSize: 11 }}>
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['Date', 'Branch', 'Items', 'Total Value', 'Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentWaste.map(w => (
                      <TableRow key={w.wasteId} hover>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{w.wasteDate}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{w.branchName}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{w.totalQty}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: 'error.main' }}>
                            {fmtCurr(w.totalValue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <Chip
                            size="small"
                            label={w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                            color={w.status === 'approved' ? 'success' : w.status === 'submitted' ? 'info' : 'default'}
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* COGS Summary by Branch Type */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  COGS Summary — August 2026
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Total Revenue', value: stats.totalRevenue, color: '#2196f3' },
                    { label: 'Total COGS', value: stats.totalCogs, color: '#f44336' },
                    { label: 'Target COGS (65%)', value: stats.totalRevenue * 0.65, color: '#4caf50' },
                  ].map(item => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {fmtCurr(item.value)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((item.value / stats.totalRevenue) * 100, 100)}
                        sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: item.color } }}
                      />
                    </Box>
                  ))}
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Actual COGS Ratio</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: stats.avgCogsRatio > 70 ? 'error.main' : stats.avgCogsRatio > 65 ? 'warning.main' : 'success.main' }}>
                      {fmtPct(stats.avgCogsRatio)} / 65%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Variance from Target</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: stats.avgCogsRatio > 65 ? 'error.main' : 'success.main' }}>
                      {stats.avgCogsRatio > 65 ? '+' : '-'}{fmtPct(Math.abs(stats.avgCogsRatio - 65))}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
