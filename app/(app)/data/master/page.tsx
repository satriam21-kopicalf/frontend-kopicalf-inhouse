'use client';

import { Box, Typography } from '@mui/material';
import {
  Store as StoreIcon, Coffee as CoffeeIcon, Category as CategoryIcon,
  Straighten as StraightenIcon, Schema as SchemaIcon, Calculate as CalculateIcon,
  People as PeopleIcon, ReceiptLong as ReceiptLongIcon, Apps as AppsIcon,
  SubdirectoryArrowRight as SubCatIcon, ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const MASTER_ITEMS = [
  { href: '/data/master/branch',        title: 'Branch',         icon: StoreIcon },
  { href: '/data/master/produk',       title: 'Product',        icon: CoffeeIcon },
  { href: '/data/master/kategori',     title: 'Category',       icon: CategoryIcon },
  { href: '/data/master/sub-kategori', title: 'Sub Category',   icon: SubCatIcon },
  { href: '/data/master/unit',         title: 'Unit',           icon: AppsIcon },
  { href: '/data/master/pricelist',    title: 'Price List',     icon: ReceiptLongIcon },
  { href: '/data/master/bom',          title: 'BOM',            icon: SchemaIcon },
  { href: '/data/master/uom',          title: 'UoM',            icon: StraightenIcon },
  { href: '/data/master/calculator',   title: 'Calculator',      icon: CalculateIcon },
  { href: '/data/master/account-access', title: 'Account Access', icon: PeopleIcon },
];

export default function MasterPage() {
  return (
    <Box>
      <PageHeader
        title="Master Data"
        subtitle="Core reference data — branches, products, categories, units, and account access"
        breadcrumbs={['Data', 'Master']}
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
        {MASTER_ITEMS.map((item, idx) => {
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
                    py: 1.25,
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'text.primary',
                      fontSize: '0.8125rem',
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </Box>
              </Link>
              {idx < MASTER_ITEMS.length - 1 && (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mx: 2 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
