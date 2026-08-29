'use client';

import { memo } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  warning?: boolean;
  onClick?: () => void;
}

const StatCard = memo(function StatCard({ label, value, icon, color, subtext, warning, onClick }: StatCardProps) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? { boxShadow: 4 } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }} color={warning ? 'error.main' : 'text.primary'} noWrap>
              {value}
            </Typography>
            {subtext && (
              <Typography variant="caption" color={warning ? 'error.main' : 'text.secondary'} noWrap sx={{ display: 'block' }}>
                {subtext}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
              flexShrink: 0,
              ml: 1,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export default StatCard;
