'use client';

import { Box, Typography, Breadcrumbs } from '@mui/material';
import type { ReactNode } from 'react';
import { NavigateNext as NavNext } from '@mui/icons-material';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 2 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavNext fontSize="small" />}
          sx={{ mb: 1 }}
        >
          <Typography
            variant="caption"
            component={Link}
            href="/"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer',
              fontSize: { xs: 11, sm: 12 },
            }}
          >
            Home
          </Typography>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography
                key={crumb}
                variant="caption"
                color="text.primary"
                sx={{ fontWeight: 500, fontSize: { xs: 11, sm: 12 } }}
              >
                {crumb}
              </Typography>
            ) : (
              <Typography
                key={crumb}
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: 11, sm: 12 } }}
              >
                {crumb}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            }}
            gutterBottom={!!subtitle}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
