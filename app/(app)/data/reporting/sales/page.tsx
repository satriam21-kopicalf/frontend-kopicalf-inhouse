'use client';

import { Box, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function SalesReportPage() {
  return (
    <Box>
      <PageHeader
        title="Sales Report"
        subtitle="Sales data consumed from ERP ESB — source for COGS Ratio benchmark calculations"
        breadcrumbs={['Data', 'Reporting', 'Sales']}
      />
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Sales report module — ESB data integration coming soon.
        </Typography>
      </Box>
    </Box>
  );
}
