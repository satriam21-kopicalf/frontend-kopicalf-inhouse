'use client';

import { Box, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function SccOverviewPage() {
  return (
    <Box>
      <PageHeader
        title="Supply Chain Overview"
        subtitle="Cost control summary for all outlets"
        breadcrumbs={['Supply Chain & Cost Control', 'Overview']}
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
