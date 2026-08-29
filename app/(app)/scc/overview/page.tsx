'use client';

import {
  Box, Card, CardContent, Typography, Grid, Chip, LinearProgress,
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Alert, Divider,
} from '@mui/material';
import Link from 'next/link';
import {
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningIcon,
  PointOfSale as POSIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useDashboardStats, useCOGSRatio } from '@/lib/hooks';

const COGS_TARGET = 65;
const USAGE_FLAG_THRESHOLD = 105;

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`;

export default function SccOverviewPage() {
  const { data: stats, loading } = useDashboardStats();
  const { data: cogsData, stats: cogsStats } = useCOGSRatio('2026-08');
  const flagged = cogsData.filter((d) => d.flagged);

  return (
    <Box>
      <PageHeader
        title="Supply Chain Overview"
        subtitle={`Cost control summary for all outlets — Period ${stats?.period || '2026-08'}`}
        breadcrumbs={['Supply Chain & Cost Control', 'Overview']}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Avg COGS Ratio"
            value={stats ? fmtPct(stats.avgCogsRatio) : '—'}
            icon={<TrendingUpIcon />}
            color="primary"
            subtext={`Target ≤ ${COGS_TARGET}%`}
            warning={(stats?.avgCogsRatio ?? 0) > COGS_TARGET}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Avg Usage Ratio"
            value={stats ? fmtPct(stats.avgUsageRatio) : '—'}
            icon={<AssessmentIcon />}
            color="secondary"
            subtext="Flag > 105%"
            warning={(stats?.avgUsageRatio ?? 0) > USAGE_FLAG_THRESHOLD}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total COGS"
            value={stats ? fmtCurr(stats.totalCogs) : '—'}
            icon={<POSIcon />}
            color="info"
            subtext={`Revenue ${stats ? fmtCurr(stats.totalRevenue) : '—'}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Flagged Outlets"
            value={String(stats?.flaggedOutlets ?? 0)}
            icon={<WarningIcon />}
            color="error"
            subtext="Usage Ratio > 105%"
            warning={(stats?.flaggedOutlets ?? 0) > 0}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Outlets Requiring Investigation
                </Typography>
                <Chip
                  component={Link}
                  href="/scc/reporting"
                  clickable
                  label="View All"
                  size="small"
                  color="primary"
                  variant="outlined"
                  deleteIcon={<ArrowForwardIcon />}
                  onDelete={() => undefined}
                />
              </Box>
              <Divider sx={{ mb: 1 }} />
              {loading ? (
                <LinearProgress sx={{ my: 4 }} />
              ) : flagged.length === 0 ? (
                <Alert severity="success">No outlets flagged this month.</Alert>
              ) : (
                <List disablePadding>
                  {flagged.map((d) => (
                    <ListItem
                      key={d.branchId}
                      component={Link}
                      href="/scc/reporting"
                      sx={{ px: 0, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                      secondaryAction={
                        <Chip label={fmtPct(d.usageRatio)} size="small" color="warning" sx={{ fontSize: 11 }} />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.light', color: 'error.dark', width: 36, height: 36 }}>
                          <WarningIcon sx={{ fontSize: 19 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={d.branchName}
                        slotProps={{
                          primary: { variant: 'body2', sx: { fontWeight: 600 } },
                          secondary: { variant: 'caption' },
                        }}
                        secondary={`COGS ${fmtPct(d.cogsRatio)} — Gap +${fmtPct(d.gap)} vs target`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Period Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Avg COGS vs Target</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} color={(cogsStats?.avgCogsRatio ?? 0) > COGS_TARGET ? 'error.main' : 'success.main'}>
                      {fmtPct(cogsStats?.avgCogsRatio ?? 0)} / {COGS_TARGET}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((cogsStats?.avgCogsRatio ?? 0), 100)}
                    color={(cogsStats?.avgCogsRatio ?? 0) > COGS_TARGET ? 'error' : 'success'}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Outlet On-Target</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {(cogsStats?.count ?? 0) - (cogsStats?.flaggedOutlets ?? 0)} / {cogsStats?.count ?? 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cogsStats && cogsStats.count > 0 ? ((cogsStats.count - cogsStats.flaggedOutlets) / cogsStats.count) * 100 : 0}
                    color="info"
                  />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Pending Approvals</Typography>
                  <Chip label={stats?.pendingApprovals ?? 0} size="small" color="warning" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Critical Stock Items</Typography>
                  <Chip label={stats?.criticalStockItems ?? 0} size="small" color="error" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Waste Value MTD</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} color="error.main">
                    {fmtCurr(stats?.wasteValueMTD ?? 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
