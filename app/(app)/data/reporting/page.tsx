'use client';

import { Box, Typography } from '@mui/material';
import {
  ChevronRight as ChevronRightIcon, Insights as InsightsIcon,
  PointOfSale as PointOfSaleIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const REPORT_ITEMS = [
  {
    href: '/data/reporting/cogs-ratio',
    title: 'COGS Ratio',
    description: 'Gross margin ratio per branch — actual COGS vs revenue, target 65%. Supports COGS Ratio dan Usage Ratio calculation.',
    icon: InsightsIcon,
    accent: '#1565c0',
  },
  {
    href: '/data/reporting/sales',
    title: 'Sales',
    description: 'Sales data consumed from ERP ESB per branch and period. Used for COGS Ratio benchmark calculation.',
    icon: PointOfSaleIcon,
    accent: '#2e7d32',
  },
];

export default function ReportingPage() {
  return (
    <Box>
      <PageHeader
        title="Reporting"
        subtitle="ESB data reports — supporting calculations for COGS Ratio and Usage Ratio across all outlets"
        breadcrumbs={['Data', 'Reporting']}
      />

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {REPORT_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Box key={item.href}>
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: item.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      '& svg': { fontSize: 18, color: '#fff' },
                    }}
                  >
                    <Icon />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem' }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1.3, mt: 0.25 }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                </Box>
              </Link>
              {idx < REPORT_ITEMS.length - 1 && (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mx: 2 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
