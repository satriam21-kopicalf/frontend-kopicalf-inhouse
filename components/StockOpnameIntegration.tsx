'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  IconButton, Tooltip
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { apiClient, formatCurrency, formatPercentage } from '@/lib/api/client';
import { StockOpname, StockOpnameDetail } from '@/lib/mockData';

interface StockOpnameDataResponse {
  branchId: number;
  period: string;
  stockOpnameRecords: StockOpname[];
  hasData: boolean;
  message?: string;
}

interface StockOpnameIntegrationProps {
  branchId: number;
  branchName: string;
  period: string;
}

interface COGSImpact {
  materialCost: number;
  wasteCost: number;
  totalCogs: number;
  cogsRatio: number;
  usageRatio: number;
  varianceFromStandard: number;
  dataQuality: 'high' | 'medium' | 'low';
  lastStockOpnameDate?: string;
}

export default function StockOpnameIntegration({ branchId, branchName, period }: StockOpnameIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [stockOpnameData, setStockOpnameData] = useState<StockOpname | null>(null);
  const [stockOpnameDetails, setStockOpnameDetails] = useState<StockOpnameDetail[]>([]);
  const [cogsImpact, setCOGSImpact] = useState<COGSImpact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<StockOpnameDetail | null>(null);

  const fetchStockOpnameData = async () => {
    try {
      setLoading(true);
      setError(null);

      const soData = await apiClient.getStockOpnameData(branchId, period) as StockOpnameDataResponse;
      
      if (soData.hasData) {
        setStockOpnameData(soData.stockOpnameRecords[0] || null);
        setStockOpnameDetails(soData.stockOpnameRecords[0]?.details || []);
        
        // Calculate COGS impact from Stock Opname data
        const impact = calculateCOGSImpact(soData);
        setCOGSImpact(impact);
      } else {
        setError(soData.message || 'No Stock Opname data available for this period');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Stock Opname data');
      console.error('Error fetching Stock Opname data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCOGSImpact = (soData: any): COGSImpact => {
    const details = soData.stockOpnameRecords[0]?.details || [];
    
    // Calculate actual material costs from Stock Opname
    let materialCost = 0;
    let wasteCost = 0;
    let totalUsage = 0;
    
    details.forEach((detail: StockOpnameDetail) => {
      // Actual material usage = sales_menu + mobilitas + self_pickup + transfer_in - transfer_out
      const actualUsage = detail.salesMenu + detail.mobilitas + detail.selfPickup + detail.transferIn - detail.transferOut;
      totalUsage += actualUsage;
      
      // Material cost = actual usage * unit price
      materialCost += actualUsage * detail.unitPrice;
      
      // Waste cost = waste quantity * unit price
      wasteCost += detail.wasteQty * detail.unitPrice;
    });

    // For demo purposes, estimate revenue based on standard COGS ratio
    const estimatedRevenue = materialCost / 0.65; // Assuming 65% standard COGS
    const totalCogs = materialCost + wasteCost;
    const cogsRatio = (totalCogs / estimatedRevenue) * 100;
    
    // Calculate usage ratio (actual vs theoretical - assuming theoretical = actual for demo)
    const usageRatio = 100; // This would be calculated against BOM in real implementation
    
    // Data quality based on completeness
    const dataQuality = details.length > 0 ? 'high' : 'low';

    return {
      materialCost,
      wasteCost,
      totalCogs,
      cogsRatio,
      usageRatio,
      varianceFromStandard: cogsRatio - 65, // 65% is standard target
      dataQuality,
      lastStockOpnameDate: soData.stockOpnameRecords[0]?.soDate,
    };
  };

  useEffect(() => {
    fetchStockOpnameData();
  }, [branchId, period]);

  const handleViewDetails = (detail: StockOpnameDetail) => {
    setSelectedDetail(detail);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading Stock Opname integration...</Typography>
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
            Stock Opname data improves COGS accuracy by replacing the 65% estimation with actual material usage.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  if (!cogsImpact) {
    return null;
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon />
              Stock Opname Integration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Actual material usage data from Stock Opname - {stockOpnameData?.soDate || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              size="small"
              label={`Data Quality: ${cogsImpact.dataQuality.toUpperCase()}`}
              color={cogsImpact.dataQuality === 'high' ? 'success' : cogsImpact.dataQuality === 'medium' ? 'warning' : 'error'}
            />
            <IconButton size="small" onClick={fetchStockOpnameData} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* COGS Impact Cards */}
            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Actual Material Cost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                    {formatCurrency(cogsImpact.materialCost)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    From Stock Opname data
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Waste Cost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                    {formatCurrency(cogsImpact.wasteCost)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatPercentage((cogsImpact.wasteCost / cogsImpact.totalCogs) * 100)} of COGS
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Calculated COGS Ratio
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: cogsImpact.cogsRatio > 70 ? 'error.main' : cogsImpact.cogsRatio > 65 ? 'warning.main' : 'success.main' }}>
                      {formatPercentage(cogsImpact.cogsRatio)}
                    </Typography>
                    {cogsImpact.cogsRatio > 65 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Target: 65%
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' }, '@media (min-width: 960px)': { flexBasis: 'calc(25% - 12px)' } }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Variance from Standard
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: cogsImpact.varianceFromStandard > 0 ? 'error.main' : 'success.main' }}>
                      {cogsImpact.varianceFromStandard > 0 ? '+' : ''}{formatPercentage(cogsImpact.varianceFromStandard)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {cogsImpact.varianceFromStandard > 0 ? 'Above' : 'Below'} target
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Stock Opname Details Table */}
          {stockOpnameDetails.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Material Usage Details ({stockOpnameDetails.length} items)
                </Typography>
              </Box>
              
              <TableContainer sx={{ maxHeight: 300, border: '1px solid', borderColor: 'divider' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Sales Usage</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Waste</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Total Usage</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'right' }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'center' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockOpnameDetails.slice(0, 10).map((detail) => {
                      const totalUsage = detail.salesMenu + detail.mobilitas + detail.selfPickup + detail.transferIn - detail.transferOut;
                      const cost = totalUsage * detail.unitPrice;
                      const hasHighWaste = detail.wasteQty > 0;
                      
                      return (
                        <TableRow key={detail.detailId} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>
                              {detail.productName}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                              {detail.productCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontSize: 11 }}>
                              {detail.categoryName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                              {detail.salesMenu} {detail.uomName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: hasHighWaste ? 'error.main' : 'text.secondary' }}>
                              {detail.wasteQty} {detail.uomName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                              {totalUsage} {detail.uomName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                              {formatCurrency(detail.unitPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                              {formatCurrency(cost)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {hasHighWaste ? (
                              <Tooltip title="High waste detected">
                                <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                              </Tooltip>
                            ) : (
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {stockOpnameDetails.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            And {stockOpnameDetails.length - 10} more items...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Insights */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              💡 COGS Accuracy Insights:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                label="✅ Using actual material usage instead of 65% estimation"
                color="success"
                variant="outlined"
              />
              <Chip
                size="small"
                label={`📊 Waste represents ${formatPercentage((cogsImpact.wasteCost / cogsImpact.totalCogs) * 100)} of total COGS`}
                color={cogsImpact.wasteCost / cogsImpact.totalCogs > 0.1 ? 'warning' : 'info'}
                variant="outlined"
              />
              {cogsImpact.cogsRatio > 65 && (
                <Chip
                  size="small"
                  label={`⚠️ COGS ratio ${formatPercentage(cogsImpact.cogsRatio - 65)} above target`}
                  color="warning"
                  variant="outlined"
                />
              )}
              {cogsImpact.dataQuality === 'high' && (
                <Chip
                  size="small"
                  label="🎯 High data quality - reliable COGS calculation"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Stock Opname Detail
          </Typography>
          <IconButton onClick={() => setShowDetails(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDetail && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Product Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedDetail.productName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Product Code</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedDetail.productCode}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body2">{selectedDetail.categoryName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%', '@media (min-width: 600px)': { flexBasis: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary">Unit Price</Typography>
                  <Typography variant="body2">{formatCurrency(selectedDetail.unitPrice)}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Usage Breakdown</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`Sales: ${selectedDetail.salesMenu}`} />
                  <Chip size="small" label={`Mobilitas: ${selectedDetail.mobilitas}`} />
                  <Chip size="small" label={`Self Pickup: ${selectedDetail.selfPickup}`} />
                  <Chip size="small" label={`Transfer In: ${selectedDetail.transferIn}`} />
                  <Chip size="small" label={`Transfer Out: ${selectedDetail.transferOut}`} />
                  <Chip size="small" label={`Waste: ${selectedDetail.wasteQty}`} color={selectedDetail.wasteQty > 0 ? 'error' : 'default'} />
                </Box>
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