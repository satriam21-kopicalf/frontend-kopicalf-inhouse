'use client';

import { Box, Typography, Paper, Grid, Card, CardContent, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { formatCurrency, formatPercentage } from '@/lib/api/client';

interface TrendData {
  period: string;
  avgCogsRatio: number;
  avgUsageRatio: number;
  totalRevenue: number;
  totalCogs: number;
  flaggedBranches: number;
}

interface TrendAnalysisProps {
  data: TrendData[];
  currentPeriod: string;
}

const TrendIcon = ({ value, threshold = 0 }: { value: number; threshold?: number }) => {
  if (value > threshold) return <TrendingUp sx={{ fontSize: 16, color: 'error.main' }} />;
  if (value < threshold) return <TrendingDown sx={{ fontSize: 16, color: 'success.main' }} />;
  return <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />;
};

const SimpleBarChart = ({ data, valueKey, color }: { data: TrendData[]; valueKey: keyof TrendData; color: string }) => {
  const maxValue = Math.max(...data.map(d => Number(d[valueKey])));
  const minValue = Math.min(...data.map(d => Number(d[valueKey])));
  const range = maxValue - minValue || 1;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 120, pt: 2 }}>
      {data.map((item, index) => {
        const value = Number(item[valueKey]);
        const height = ((value - minValue) / range) * 100;
        const isCurrent = item.period === data[data.length - 1]?.period;
        
        return (
          <Box
            key={item.period}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: `${Math.max(height, 5)}%`,
                backgroundColor: isCurrent ? color : `${color}80`,
                borderRadius: 1,
                transition: 'all 0.3s',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scaleY(1.05)',
                },
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -25,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'background.paper',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 600,
                  boxShadow: 1,
                  opacity: 0,
                  '&:hover': { opacity: 1 },
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                }}
              >
                {typeof value === 'number' && valueKey.includes('Ratio') 
                  ? formatPercentage(value) 
                  : formatCurrency(value)}
              </Box>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: 9, 
                textAlign: 'center',
                color: isCurrent ? 'text.primary' : 'text.secondary',
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {item.period.split('-')[1]}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default function TrendAnalysis({ data, currentPeriod }: TrendAnalysisProps) {
  if (!data || data.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography color="text.secondary">No trend data available</Typography>
      </Paper>
    );
  }

  const currentData = data[data.length - 1];
  const previousData = data.length > 1 ? data[data.length - 2] : null;

  const calculateChange = (current: number, previous: number | null) => {
    if (previous === null || previous === 0) return { value: 0, percentage: 0, trend: 'flat' as const };
    const change = current - previous;
    const percentage = (change / Math.abs(previous)) * 100;
    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (percentage > 1) trend = 'up';
    if (percentage < -1) trend = 'down';
    return { value: change, percentage, trend };
  };

  const cogsChange = calculateChange(currentData.avgCogsRatio, previousData?.avgCogsRatio || null);
  const usageChange = calculateChange(currentData.avgUsageRatio, previousData?.avgUsageRatio || null);
  const revenueChange = calculateChange(currentData.totalRevenue, previousData?.totalRevenue || null);
  const flaggedChange = calculateChange(currentData.flaggedBranches, previousData?.flaggedBranches || null);

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Trend Analysis - {currentPeriod}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Historical performance over {data.length} periods
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' } }}>
        {/* Trend Summary Cards */}
        <Box>
          <Box sx={{ p: 2, borderRight: { md: '1px solid' }, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Key Changes vs Previous Period
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">COGS Ratio</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendIcon value={cogsChange.percentage} threshold={1} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 11,
                      color: cogsChange.trend === 'up' ? 'error.main' : cogsChange.trend === 'down' ? 'success.main' : 'text.primary'
                    }}
                  >
                    {cogsChange.percentage > 0 ? '+' : ''}{cogsChange.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Usage Ratio</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendIcon value={usageChange.percentage} threshold={1} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 11,
                      color: usageChange.trend === 'up' ? 'error.main' : usageChange.trend === 'down' ? 'success.main' : 'text.primary'
                    }}
                  >
                    {usageChange.percentage > 0 ? '+' : ''}{usageChange.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Revenue</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendIcon value={revenueChange.percentage} threshold={0} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 11,
                      color: revenueChange.trend === 'up' ? 'success.main' : revenueChange.trend === 'down' ? 'error.main' : 'text.primary'
                    }}
                  >
                    {revenueChange.percentage > 0 ? '+' : ''}{revenueChange.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Flagged Branches</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendIcon value={flaggedChange.percentage} threshold={0} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 11,
                      color: flaggedChange.trend === 'up' ? 'error.main' : flaggedChange.trend === 'down' ? 'success.main' : 'text.primary'
                    }}
                  >
                    {flaggedChange.value > 0 ? '+' : ''}{flaggedChange.value}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Charts */}
        <Box>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      COGS Ratio Trend
                    </Typography>
                    <SimpleBarChart data={data} valueKey="avgCogsRatio" color="#f44336" />
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Usage Ratio Trend
                    </Typography>
                    <SimpleBarChart data={data} valueKey="avgUsageRatio" color="#ff9800" />
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Revenue Trend
                    </Typography>
                    <SimpleBarChart data={data} valueKey="totalRevenue" color="#2196f3" />
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Flagged Branches
                    </Typography>
                     <SimpleBarChart data={data} valueKey="flaggedBranches" color="#9c27b0" />
                   </CardContent>
                 </Card>
               </Box>
             </Box>
           </Box>
         </Box>
       </Box>

      {/* Insights */}
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Key Insights:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {cogsChange.trend === 'up' && (
            <Chip 
              size="small" 
              label={`COGS ratio increased by ${cogsChange.percentage.toFixed(1)}% - requires attention`} 
              color="error" 
              variant="outlined"
            />
          )}
          {usageChange.trend === 'up' && (
            <Chip 
              size="small" 
              label={`Usage ratio up ${usageChange.percentage.toFixed(1)}% - check waste/stock opname`} 
              color="warning" 
              variant="outlined"
            />
          )}
          {revenueChange.trend === 'down' && (
            <Chip 
              size="small" 
              label={`Revenue decreased by ${Math.abs(revenueChange.percentage).toFixed(1)}%`} 
              color="error" 
              variant="outlined"
            />
          )}
          {flaggedChange.value > 0 && flaggedChange.trend === 'up' && (
            <Chip 
              size="small" 
              label={`${flaggedChange.value} more flagged branches this period`} 
              color="error" 
              variant="outlined"
            />
          )}
          {cogsChange.trend === 'down' && usageChange.trend === 'down' && (
            <Chip 
              size="small" 
              label="Both COGS and usage ratios improving - good performance" 
              color="success" 
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}