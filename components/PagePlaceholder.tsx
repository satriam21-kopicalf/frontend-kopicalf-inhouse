'use client';

import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';

interface PagePlaceholderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  description?: string;
}

export default function PagePlaceholder({ title, subtitle, breadcrumbs, description }: PagePlaceholderProps) {
  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
      <Card>
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <ConstructionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Module Under Development
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', mb: 3 }}>
            {description ?? 'This module is being built. Menu structure, routing, and layout are ready.'}
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 480, mx: 'auto', textAlign: 'left' }}>
            Data integration will follow once the API is available.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
