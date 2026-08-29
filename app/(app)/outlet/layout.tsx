'use client';

import { Box, Typography, Grid as MuiGrid, Card, CardContent } from '@mui/material';
import { Inventory as InventoryIcon, DeleteOutlined as WasteIcon } from '@mui/icons-material';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const MODULES = [
  {
    href: '/outlet/stock-opname',
    title: 'Stock Opname',
    description: 'Daily, weekly, and monthly stock opname entry forms for all products.',
    icon: <InventoryIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    color: 'primary' as const,
  },
  {
    href: '/outlet/waste',
    title: 'Waste Form',
    description: 'Record daily waste per product with reasons and loss value.',
    icon: <WasteIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
    color: 'warning' as const,
  },
];

export default function OutletLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <PageHeader
        title="Outlet Forms"
        subtitle="Entry forms for Barista & PIC Outlet — simple and focused for daily use"
        breadcrumbs={['Outlet Forms']}
      />

      <MuiGrid container spacing={2}>
        {MODULES.map((mod) => (
          <MuiGrid key={mod.href} size={{ xs: 12, sm: 6 }}>
            <Card
              component={Link}
              href={mod.href}
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                borderTop: `3px solid`,
                borderColor: `${mod.color}.main`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                <Box sx={{ width: { xs: 60, sm: 72 }, height: { xs: 60, sm: 72 }, borderRadius: 3, bgcolor: `${mod.color}.lighter`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  {mod.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {mod.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {mod.description}
                </Typography>
              </CardContent>
            </Card>
          </MuiGrid>
        ))}
      </MuiGrid>

      <Box sx={{ mt: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
