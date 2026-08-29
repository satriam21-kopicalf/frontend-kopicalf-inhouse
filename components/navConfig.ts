import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DataObjectIcon from '@mui/icons-material/DataObject';
import HubIcon from '@mui/icons-material/Hub';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CoffeeIcon from '@mui/icons-material/Coffee';
import CategoryIcon from '@mui/icons-material/Category';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import SchemaIcon from '@mui/icons-material/Schema';
import StraightenIcon from '@mui/icons-material/Straighten';
import CalculateIcon from '@mui/icons-material/Calculate';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AppsIcon from '@mui/icons-material/Apps';
import PeopleIcon from '@mui/icons-material/People';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import TuneIcon from '@mui/icons-material/Tune';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

export interface NavItem {
  label: string;
  href?: string;
  icon?: ComponentType<SvgIconProps>;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  {
    label: 'Data',
    icon: DataObjectIcon,
    children: [
      {
        label: 'Master',
        href: '/data/master',
        icon: SettingsSuggestIcon,
        children: [
          { label: 'Branch', href: '/data/master/branch', icon: StoreIcon },
          { label: 'Product', href: '/data/master/produk', icon: CoffeeIcon },
          { label: 'Category', href: '/data/master/kategori', icon: CategoryIcon },
          { label: 'Sub Category', href: '/data/master/sub-kategori', icon: SubdirectoryArrowRightIcon },
          { label: 'Unit', href: '/data/master/unit', icon: AppsIcon },
          { label: 'Price List', href: '/data/master/pricelist', icon: ReceiptLongIcon },
          { label: 'BOM', href: '/data/master/bom', icon: SchemaIcon },
          { label: 'UoM', href: '/data/master/uom', icon: StraightenIcon },
          { label: 'Calculator', href: '/data/master/calculator', icon: CalculateIcon },
          { label: 'Staff', href: '/data/master/staff', icon: PeopleIcon },
        ],
      },
      {
        label: 'Reporting',
        href: '/data/reporting',
        icon: BarChartIcon,
        children: [
          { label: 'COGS Ratio', href: '/data/reporting/cogs-ratio', icon: ShowChartIcon },
          { label: 'Sales', href: '/data/reporting/sales', icon: BarChartIcon },
        ],
      },
    ],
  },
  {
    label: 'Supply Chain & Cost Control',
    icon: InventoryIcon,
    children: [
      { label: 'Overview', href: '/scc/overview', icon: HubIcon },
      { label: 'Reporting', href: '/scc/reporting', icon: BarChartIcon },
      { label: 'Stock System', href: '/scc/stock-system', icon: TuneIcon },
      { label: 'Stock Opname', href: '/scc/stock-opname', icon: ChecklistIcon },
      { label: 'Waste', href: '/scc/waste', icon: DeleteSweepIcon },
    ],
  },
  { label: 'Operational', href: '/operational', icon: PointOfSaleIcon },
  { label: 'Aggregator', href: '/aggregator', icon: SyncAltIcon },
];

export const APP_NAME = 'Kopi Calf Internal';
