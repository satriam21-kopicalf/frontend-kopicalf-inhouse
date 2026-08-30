'use client';

import { Box, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function SccReportingPage() {
  return (
    <Box>
      <PageHeader
        title="Supply Chain Reporting"
        subtitle="COGS, Usage Ratio, and Shopping Estimation reports"
        breadcrumbs={['Supply Chain & Cost Control', 'Reporting']}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 500,
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          Under Development
        </Typography>
      </Box>
    </Box>
  );
}
