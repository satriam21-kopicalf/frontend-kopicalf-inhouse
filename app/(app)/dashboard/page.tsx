'use client';

import { Box, Card, CardContent, Typography, Button, Grid, Divider } from '@mui/material';
import Link from 'next/link';
import {
  Construction as ConstructionIcon,
  FactCheck as FactCheckIcon,
  DeleteOutlined as WasteIcon,
  Schema as BomIcon,
  Straighten as UomIcon,
  Insights as OverviewIcon,
  Assessment as ReportingIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const PRIORITY_MODULES = [
  { label: 'Stock Opname', href: '/scc/stock-opname', icon: FactCheckIcon, desc: 'Physical stock recording & variance' },
  { label: 'Waste', href: '/scc/waste', icon: WasteIcon, desc: 'Material waste recording' },
  { label: 'BOM', href: '/data/master/bom', icon: BomIcon, desc: 'Bill of Material products' },
  { label: 'UoM', href: '/data/master/uom', icon: UomIcon, desc: 'Unit of Measure master' },
  { label: 'SCC Overview', href: '/scc/overview', icon: OverviewIcon, desc: 'Cost control summary' },
  { label: 'SCC Reporting', href: '/scc/reporting', icon: ReportingIcon, desc: 'COGS & usage reports' },
];

export default function DashboardPage() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Kopi Calf Operations Summary
      </Typography>

      <Card>
        <CardContent sx={{ py: 5, px: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <ConstructionIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Under Development
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', mb: 3 }}>
            The dashboard will be built after priority modules are completed.
            Current development is focused on the following modules:
          </Typography>

          <Grid container spacing={2} sx={{ maxWidth: 720, mx: 'auto', textAlign: 'left', mb: 3 }}>
            {PRIORITY_MODULES.map((m) => (
              <Grid size={{ xs: 12, sm: 6 }} key={m.href}>
                <Button
                  fullWidth
                  component={Link}
                  href={m.href}
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    textAlign: 'left',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.lighter',
                    },
                  }}
                  endIcon={<ArrowForwardIcon sx={{ ml: 'auto', mr: 0 }} />}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, width: '100%' }}>
                    <m.icon sx={{ fontSize: 22, color: 'primary.main', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {m.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {m.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Use the sidebar menu to navigate between modules.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
