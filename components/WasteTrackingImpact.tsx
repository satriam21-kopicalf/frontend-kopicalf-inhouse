'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  IconButton, Tooltip
} from '@mui/material';
import {
  DeleteSweep as WasteIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';
import { apiClient, formatCurrency, formatPercentage } from '@/lib/api/client';
import { WasteRecord, WasteDetail, WasteReason } from '@/lib/mockData';

interface WasteTrackingImpactProps {
  branchId: number;
  branchName: string;
  period: string;
  totalCogs?: number;
  totalRevenue?: number;
}

interface WasteTrackingDataResponse {
  branchId: number;
  period: string;
  wasteRecords: WasteRecord[];
  hasData: boolean;
  message?: string;
}

interface WasteImpact {
  totalWasteCost: number;
  wasteCount: number;
  topWasteProducts: Array<{
    productCode: string;
    productName: string;
    categoryName: string;
    totalWasteCost: number;
    totalWasteQty: number;
    wasteReasons: Record<WasteReason, number>;
  }>;
  wasteByReason: Record<WasteReason, { count: number; totalCost: number; totalQty: number }>;
  wasteTrend: Array<{ period: string; wasteCost: number; wasteQty: number }>;
  cogsImpact: {
    wastePercentageOfCOGS: number;
    revenueLoss: number;
    profitImpact: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const REASON_CONFIG: Record<WasteReason, { label: string; color: string; icon: string; severity: 'low' | 'medium' | 'high' }> = {
  expired: { label: 'Expired', color: 'warning', icon: '🕐', severity: 'medium' },
  damaged: { label: 'Damaged', color: 'error', icon: '💔', severity: 'high' },
  spill: { label: 'Spill', color: 'info', icon: '💧', severity: 'low' },
  other: { label: 'Other', color: 'default', icon: '❓', severity: 'low' },
};

const RISK_CONFIG = {
  low: { color: 'success', label: 'Low Risk', threshold: 0.02 },
  medium: { color: 'warning', label: 'Medium Risk', threshold: 0.05 },
  high: { color: 'error', label: 'High Risk', threshold: 0.10 },
  critical: { color: 'error', label: 'Critical Risk', threshold: Infinity },
};

export default function WasteTrackingImpact({ branchId, branchName, period, totalCogs, totalRevenue }: WasteTrackingImpactProps) {
  const [loading, setLoading] = useState(false);
  const [wasteData, setWasteData] = useState<WasteRecord[]>([]);
  const [wasteImpact, setWasteImpact] = useState<WasteImpact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<WasteRecord | null>(null);

  const fetchWasteData = async () => {
    try {
      setLoading(true);
      setError(null);

      const wasteResponse = await apiClient.getWasteTrackingData(branchId, period) as WasteTrackingDataResponse;
      
      if (wasteResponse.hasData) {
        setWasteData(wasteResponse.wasteRecords);
        
        // Calculate waste impact
        const impact = calculateWasteImpact(wasteResponse, totalCogs, totalRevenue);
        setWasteImpact(impact);
      } else {
        setError(wasteResponse.message || 'No waste tracking data available for this period');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch waste tracking data');
      console.error('Error fetching waste data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateWasteImpact = (wasteResponse: any, cogs?: number, revenue?: number): WasteImpact => {
    const wasteRecords = wasteResponse.wasteRecords || [];
    const allDetails: WasteDetail[] = wasteRecords.flatMap((record: WasteRecord) => record.details || []);

    // Calculate total waste cost and quantity
    let totalWasteCost = 0;
    let totalWasteQty = 0;
    
    const productWasteMap = new Map<string, any>();
    const reasonStats: Record<WasteReason, { count: number; totalCost: number; totalQty: number }> = {
      expired: { count: 0, totalCost: 0, totalQty: 0 },
      damaged: { count: 0, totalCost: 0, totalQty: 0 },
      spill: { count: 0, totalCost: 0, totalQty: 0 },
      other: { count: 0, totalCost: 0, totalQty: 0 },
    };

    allDetails.forEach((detail: WasteDetail) => {
      totalWasteCost += detail.totalValue;
      totalWasteQty += detail.qty;

      // Track by product
      if (!productWasteMap.has(detail.productCode)) {
        productWasteMap.set(detail.productCode, {
          productCode: detail.productCode,
          productName: detail.productName,
          categoryName: detail.categoryName,
          totalWasteCost: 0,
          totalWasteQty: 0,
          wasteReasons: { expired: 0, damaged: 0, spill: 0, other: 0 },
        });
      }

      const productData = productWasteMap.get(detail.productCode);
      productData.totalWasteCost += detail.totalValue;
      productData.totalWasteQty += detail.qty;
      productData.wasteReasons[detail.reason] += detail.totalValue;

      // Track by reason
      reasonStats[detail.reason].count++;
      reasonStats[detail.reason].totalCost += detail.totalValue;
      reasonStats[detail.reason].totalQty += detail.qty;
    });

    // Sort products by waste cost
    const topWasteProducts = Array.from(productWasteMap.values())
      .sort((a, b) => b.totalWasteCost - a.totalWasteCost)
      .slice(0, 10);

    // Calculate COGS impact
    const wastePercentageOfCOGS = cogs ? (totalWasteCost / cogs) * 100 : 0;
    const revenueLoss = totalWasteCost * 1.5; // Assuming 1.5x markup
    const profitImpact = revenueLoss - totalWasteCost;

    // Determine risk level
    const wasteRatio = cogs ? totalWasteCost / cogs : 0;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (wasteRatio >= RISK_CONFIG.critical.threshold) riskLevel = 'critical';
    else if (wasteRatio >= RISK_CONFIG.high.threshold) riskLevel = 'high';
    else if (wasteRatio >= RISK_CONFIG.medium.threshold) riskLevel = 'medium';

    // Generate recommendations
    const recommendations: string[] = [];
    if (reasonStats.expired.totalCost > reasonStats.damaged.totalCost && 
        reasonStats.expired.totalCost > reasonStats.spill.totalCost) {
      recommendations.push('📅 Review inventory rotation procedures - expired items are the main waste driver');
    }
    if (reasonStats.damaged.totalCost > totalWasteCost * 0.3) {
      recommendations.push('🔧 Investigate handling procedures - high damage rate detected');
    }
    if (reasonStats.spill.totalQty > totalWasteQty * 0.4) {
      recommendations.push('☕ Review barista training and equipment maintenance - spillage is significant');
    }
    if (topWasteProducts.length > 0 && topWasteProducts[0].totalWasteCost > totalWasteCost * 0.2) {
      recommendations.push(`🎯 Focus waste reduction efforts on ${topWasteProducts[0].productName} - highest waste contributor`);
    }
    if (wastePercentageOfCOGS > 5) {
      recommendations.push('🚨 Waste represents significant portion of COGS - immediate action required');
    }
    if (recommendations.length === 0) {
      recommendations.push('✅ Waste levels are within acceptable ranges - maintain current procedures');
    }

    return {
      totalWasteCost,
      wasteCount: wasteRecords.length,
      topWasteProducts,
      wasteByReason: reasonStats,
      wasteTrend: [], // Would be populated with historical data
      cogsImpact: {
        wastePercentageOfCOGS,
        revenueLoss,
        profitImpact,
      },
      recommendations,
      riskLevel,
    };
  };

  useEffect(() => {
    fetchWasteData();
  }, [branchId, period, totalCogs, totalRevenue]);

  const handleViewDetails = (waste: WasteRecord) => {
    setSelectedWaste(waste);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading waste tracking impact...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">{error}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Waste tracking data helps identify COGS reduction opportunities and operational improvements.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  if (!wasteImpact) {
    return null;
  }

  const riskConfig = RISK_CONFIG[wasteImpact.riskLevel];

  return (
    <Box>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: `${riskConfig.color}.lighter`, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WasteIcon sx={{ fontSize: 24, color: `${riskConfig.color}.main` }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Waste Tracking Impact Analysis
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {wasteImpact.wasteCount} waste records • {riskConfig.label}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              size="small"
              label={riskConfig.label}
              color={riskConfig.color as any}
              icon={wasteImpact.riskLevel === 'critical' ? <PriorityHighIcon /> : <WarningIcon />}
            />
            <IconButton size="small" onClick={fetchWasteData} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {wasteImpact.riskLevel === 'critical' && (
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              🚨 Critical waste level detected! Immediate action required to prevent significant profit loss.
            </Typography>
          </Alert>
        )}

        <Box sx={{ p: 2 }}>
          {/* Impact Overview */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%', borderColor: `${riskConfig.color}.main` }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total Waste Cost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: `${riskConfig.color}.main`, mt: 0.5 }}>
                    {formatCurrency(wasteImpact.totalWasteCost)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {wasteImpact.cogsImpact.wastePercentageOfCOGS.toFixed(1)}% of COGS
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Revenue Loss
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                    {formatCurrency(wasteImpact.cogsImpact.revenueLoss)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Est. sales value lost
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Profit Impact
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                    {formatCurrency(wasteImpact.cogsImpact.profitImpact)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Direct profit reduction
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total Waste Quantity
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                    {wasteImpact.topWasteProducts.reduce((sum, p) => sum + p.totalWasteQty, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across {wasteImpact.topWasteProducts.length} products
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Waste by Reason */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon fontSize="small" />
              Waste Breakdown by Reason
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(wasteImpact.wasteByReason).map(([reason, stats]) => {
                const config = REASON_CONFIG[reason as WasteReason];
                const percentage = wasteImpact.totalWasteCost > 0
                  ? (stats.totalCost / wasteImpact.totalWasteCost) * 100
                  : 0;

                return (
                  <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }} key={reason}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {config.icon} {config.label}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={`${percentage.toFixed(1)}%`} 
                            color={config.color as any}
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {formatCurrency(stats.totalCost)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.count} incidents • {stats.totalQty} units
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          color={config.color as any}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Top Waste Products */}
          {wasteImpact.topWasteProducts.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriorityHighIcon fontSize="small" />
                Top Waste Products
              </Typography>
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', maxHeight: 250 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Waste Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Waste Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'center' }}>Primary Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wasteImpact.topWasteProducts.map((product) => {
                      const topReason = Object.entries(product.wasteReasons)
                        .sort((a, b) => b[1] - a[1])[0] as [WasteReason, number];
                      const percentageOfTotal = (product.totalWasteCost / wasteImpact.totalWasteCost) * 100;
                      
                      return (
                        <TableRow key={product.productCode} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>
                              {product.productName}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                              {product.productCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontSize: 11 }}>
                              {product.categoryName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: 'error.main' }}>
                              {formatCurrency(product.totalWasteCost)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                              {product.totalWasteQty}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={`${REASON_CONFIG[topReason[0]].icon} ${REASON_CONFIG[topReason[0]].label}`}
                              color={REASON_CONFIG[topReason[0]].color as any}
                              variant="outlined"
                              sx={{ fontSize: 10, height: 20 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                              {percentageOfTotal.toFixed(1)}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Recommendations */}
          <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LightbulbIcon fontSize="small" />
              Recommendations for Waste Reduction:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {wasteImpact.recommendations.map((rec, index) => (
                <Typography key={index} variant="caption" sx={{ pl: 2 }}>
                  {rec}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Waste Record Details
          </Typography>
          <IconButton onClick={() => setShowDetails(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedWaste && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body2">{selectedWaste.wasteDate}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Submitted By</Typography>
                  <Typography variant="body2">{selectedWaste.submittedBy}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Total Value</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {formatCurrency(selectedWaste.totalValue)}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip size="small" label={selectedWaste.status} color={selectedWaste.status === 'approved' ? 'success' : 'default'} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Notes</Typography>
                <Typography variant="body2">{selectedWaste.notes || 'No notes provided'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}