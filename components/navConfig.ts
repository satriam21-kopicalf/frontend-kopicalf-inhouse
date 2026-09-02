export interface NavItem {
  label: string;
  href?: string;
  icon?: any;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  {
    label: 'Data',
    children: [
      {
        label: 'Master',
        href: '/data/master',
        children: [
          { label: 'Branch', href: '/data/master/branch' },
          { label: 'Product', href: '/data/master/produk' },
          { label: 'Category', href: '/data/master/kategori' },
          { label: 'Sub Category', href: '/data/master/sub-kategori' },
          { label: 'Unit', href: '/data/master/unit' },
          { label: 'Price List', href: '/data/master/pricelist' },
          { label: 'BOM', href: '/data/master/bom' },
          { label: 'UoM', href: '/data/master/uom' },
          { label: 'Calculator', href: '/data/master/calculator' },
          { label: 'Account Access', href: '/data/master/account-access' },
        ],
      },
      {
        label: 'Reporting',
        href: '/data/reporting',
        children: [
          { label: 'Sales', href: '/data/reporting/sales' },
        ],
      },
    ],
  },
  {
    label: 'Supply Chain & Cost Control',
    children: [
      { label: 'Overview', href: '/scc/overview' },
      { label: 'Reporting', href: '/scc/reporting' },
      { label: 'Stock System', href: '/scc/stock-system' },
      { label: 'Stock Opname', href: '/scc/stock-opname' },
      { label: 'Waste', href: '/scc/waste' },
    ],
  },
  { label: 'Operational', href: '/operational' },
  { label: 'Aggregator', href: '/aggregator' },
];

export const APP_NAME = 'Kopi Calf Internal';
