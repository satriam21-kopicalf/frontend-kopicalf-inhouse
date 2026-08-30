'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconButton, Box, Drawer, Typography,
  Avatar, Tooltip, Paper, BottomNavigation,
  BottomNavigationAction, LinearProgress, useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExpandMore,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  MoreHoriz as MoreIcon,
  MenuOpen as ToggleSidebarIcon,
  Settings as SettingsIcon,
  GroupWork as MasterIcon,
  ListAlt as DataIcon,
  PointOfSale as POSIcon,
  Storefront as StorefrontIcon,
  Inventory as InventoryIcon,
  LocalOffer as OfferIcon,
  Layers as LayersIcon,
  AccountTree as AccountTreeIcon,
  Calculate as CalculateIcon,
  Badge as BadgeIcon,
  Scale as ScaleIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory2 as Inventory2Icon,
  Delete as WasteIcon,
  Checklist as ChecklistIcon,
  Description as DescriptionIcon,
  ShowChart as ShowChartIcon,
  TrendingUp as TrendingUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { NAV_ITEMS } from '@/components/navConfig';
import { isLoggedIn, logout, getUserEmail } from '@/lib/auth';

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 56;
const HEADER_HEIGHT = 72;
const BOTTOM_NAV_HEIGHT = 56;
const BOTTOM_NAV_MORE = '__more__';

// ── Kopi Calf brand colors — dark blue, white & red ─────────────────────────
const C = {
  primary:      '#0D2B5E',  // Dark navy blue — primary actions
  primaryDark:  '#091C42',  // Deep navy — header bg
  primaryLight:  '#1A4080',  // Medium navy — hover states
  accent:        '#1E5799',  // Bright blue — accents / borders
  accentLight:   '#E8EEF6',  // Very light blue — subtle bg
  textActive:    '#FFFFFF',  // White text on active
  textPrimary:   '#0D2B5E',  // Dark navy text
  textSecondary: '#5A7BA6',  // Muted blue
  bg:            '#FFFFFF',  // White sidebar body
  bgHover:       '#F0F4FA',  // Very light blue hover
  bgActive:      '#0D2B5E',  // Dark navy active bg
  divider:       '#D6E0EF',  // Light blue divider
  danger:        '#C62828',  // Red — danger/delete
  dangerLight:   '#FFEBEE',  // Light red bg
};

const LABEL_MAP: Record<string, string> = {
  'Supply Chain & Cost Control': 'Supply Chain',
};

// ============================================================================
// NAV ITEM (3-level hierarchy — Enterprise Professional Style)
// ============================================================================
interface NavItemProps {
  item: typeof NAV_ITEMS[0];
  openGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  level?: number;
}

function NavItem({ item, openGroups, toggleGroup, pathname, collapsed = false, onNavigate, level = 0 }: NavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isGroupOpen = openGroups[item.label] ?? false;
  const Icon = item.icon;
  const displayLabel = LABEL_MAP[item.label] ?? item.label;

  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : hasChildren && item.children!.some(
        (c) => c.href && (pathname === c.href || pathname.startsWith(`${c.href}/`))
      );

  // ── Level 0: Top-level items ───────────────────────────────────────────
  if (level === 0) {
    if (collapsed) {
      return (
        <Tooltip title={displayLabel} placement="right">
          <Box
            component={hasChildren ? 'button' : Link}
            href={hasChildren ? '#' : (item.href || '/dashboard')}
            onClick={hasChildren ? (e: React.MouseEvent) => { e.preventDefault(); toggleGroup(item.label); } : onNavigate}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, mx: 'auto', mb: 0.5,
              borderRadius: 1.5, cursor: 'pointer', textDecoration: 'none', border: 'none',
              bgcolor: isActive ? C.bgActive : 'transparent',
              color: isActive ? C.textActive : C.textSecondary,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: isActive ? C.primaryLight : C.bgHover, color: isActive ? C.textActive : C.primary },
            }}
          >
            {Icon && <Icon sx={{ fontSize: 18 }} />}
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box sx={{ mb: 0.25, px: 1.5 }}>
        <Box
          component={hasChildren ? 'button' : Link}
          href={hasChildren ? '#' : (item.href || '/dashboard')}
          onClick={hasChildren ? (e: React.MouseEvent) => { e.preventDefault(); toggleGroup(item.label); } : onNavigate}
          sx={{
            display: 'flex', alignItems: 'center',
            width: '100%', minHeight: 38, px: 1.5, py: 0.5,
            cursor: 'pointer', textDecoration: 'none', border: 'none',
            bgcolor: isActive ? C.bgActive : 'transparent',
            color: isActive ? C.textActive : C.textSecondary,
            transition: 'all 0.15s ease',
            gap: 1, borderRadius: 1.5,
            position: 'relative', overflow: 'hidden',
            boxShadow: isActive ? '0 2px 8px rgba(111, 78, 55, 0.35)' : 'none',
            '&:hover': { bgcolor: isActive ? C.primaryLight : C.bgHover, color: isActive ? C.textActive : C.primary },
          }}
        >
          {Icon && (
            <Box sx={{ display: 'flex', flexShrink: 0, color: 'inherit' }}>
              <Icon sx={{ fontSize: 16 }} />
            </Box>
          )}
          <Typography component="span" sx={{
            fontSize: 13.5, fontWeight: isActive ? 600 : 500,
            color: 'inherit', flex: 1, textAlign: 'left', lineHeight: 1.3,
            fontFamily: 'inherit',
          }}>
            {displayLabel}
          </Typography>
          {hasChildren && (
            <Box sx={{ display: 'flex', flexShrink: 0, color: 'inherit', opacity: 0.6, transition: 'transform 0.2s ease', transform: isGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ExpandMore sx={{ fontSize: 14 }} />
            </Box>
          )}
        </Box>

        {/* Level 1 children */}
        {hasChildren && (
          <Collapse in={isGroupOpen} timeout={200}>
            <Box sx={{ pl: 0, pt: 0.25, pb: 0.25 }}>
              {item.children!.map((child) => (
                <NavItem
                  key={child.label}
                  item={child}
                  openGroups={openGroups}
                  toggleGroup={toggleGroup}
                  pathname={pathname}
                  collapsed={false}
                  onNavigate={onNavigate}
                  level={1}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  // ── Level 1: Children under groups ───────────────────────────────────
  if (level === 1) {
    const hasSubChildren = item.children && item.children.length > 0;

    if (collapsed) {
      return (
        <Tooltip title={displayLabel} placement="right">
          <Box
            component={hasSubChildren ? 'button' : Link}
            href={hasSubChildren ? '#' : (item.href || '/dashboard')}
            onClick={hasSubChildren ? (e: React.MouseEvent) => { e.preventDefault(); toggleGroup(item.label); } : onNavigate}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 34, mx: 'auto', mb: 0.1,
              borderRadius: 1.5, cursor: 'pointer', textDecoration: 'none', border: 'none',
              bgcolor: isActive ? C.accentLight : 'transparent',
              color: isActive ? C.primary : C.textSecondary,
              '&:hover': { bgcolor: C.bgHover, color: C.primary },
            }}
          >
            {Icon && <Icon sx={{ fontSize: 15 }} />}
          </Box>
        </Tooltip>
      );
    }

    if (!hasSubChildren) {
      // Direct leaf (Supply Chain children)
      return (
        <Box
          component={Link}
          href={item.href || '/dashboard'}
          onClick={onNavigate}
          sx={{
            display: 'flex', alignItems: 'center',
            width: '100%', minHeight: 30, px: 1.5, py: 0.35, mb: 0.05,
            borderRadius: 1.5, textDecoration: 'none',
            bgcolor: isActive ? `${C.bgActive}18` : 'transparent',
            color: isActive ? C.primary : C.textSecondary,
            gap: 0.75, transition: 'all 0.15s ease',
            pl: 3.5,
            '&:hover': { bgcolor: isActive ? `${C.bgActive}18` : C.bgHover, color: C.primary },
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isActive ? C.primary : C.accent, flexShrink: 0 }} />
          {Icon && (
            <Box sx={{ display: 'flex', flexShrink: 0, opacity: isActive ? 1 : 0.55 }}>
              <Icon sx={{ fontSize: 13, color: 'inherit' }} />
            </Box>
          )}
          <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: 'inherit', flex: 1, fontFamily: 'inherit' }}>
            {displayLabel}
          </Typography>
        </Box>
      );
    }

    // Level 1 with sub-children (Master → children)
    return (
      <Box sx={{ mb: 0.25, px: 1.5 }}>
        <Box
          component="button"
          onClick={(e: React.MouseEvent) => { e.preventDefault(); toggleGroup(item.label); }}
          sx={{
            display: 'flex', alignItems: 'center',
            width: '100%', minHeight: 30, px: 1.5, py: 0.35, mb: 0.05,
            borderRadius: 1.5, cursor: 'pointer', textDecoration: 'none', border: 'none',
            bgcolor: isActive ? `${C.bgActive}18` : 'transparent',
            color: isActive ? C.primary : C.textSecondary,
            gap: 0.75, transition: 'all 0.15s ease',
            '&:hover': { bgcolor: isActive ? `${C.bgActive}18` : C.bgHover, color: C.primary },
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isActive ? C.primary : C.accent, flexShrink: 0 }} />
          {Icon && (
            <Box sx={{ display: 'flex', flexShrink: 0, opacity: isActive ? 1 : 0.55 }}>
              <Icon sx={{ fontSize: 13, color: 'inherit' }} />
            </Box>
          )}
          <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: 'inherit', flex: 1, textAlign: 'left', fontFamily: 'inherit' }}>
            {displayLabel}
          </Typography>
          <Box sx={{ display: 'flex', flexShrink: 0, color: 'inherit', opacity: 0.6, transition: 'transform 0.2s ease', transform: isGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ExpandMore sx={{ fontSize: 13 }} />
          </Box>
        </Box>

        {/* Level 2 — Grandchildren */}
        {hasSubChildren && (
          <Collapse in={isGroupOpen} timeout={200}>
            <Box sx={{ pt: 0.25, pb: 0.25 }}>
              {item.children!.map((gc) => {
                const gcActive = gc.href && (pathname === gc.href || pathname.startsWith(`${gc.href}/`));
                const GCIcon = gc.icon;
                const gcLabel = LABEL_MAP[gc.label] ?? gc.label;
                return (
                  <Box
                    key={gc.label}
                    component={Link}
                    href={gc.href || '/dashboard'}
                    onClick={onNavigate}
                    sx={{
                      display: 'flex', alignItems: 'center',
                      width: '100%', minHeight: 28, px: 1.5, py: 0.3, mb: 0.05,
                      borderRadius: 1.5, textDecoration: 'none',
                      bgcolor: gcActive ? C.bgActive : 'transparent',
                      color: gcActive ? C.textActive : C.textSecondary,
                      gap: 0.75, transition: 'all 0.15s ease',
                      pl: 5,
                      boxShadow: gcActive ? '0 1px 4px rgba(111, 78, 55, 0.3)' : 'none',
                      '&:hover': { bgcolor: gcActive ? C.primaryLight : C.bgHover, color: gcActive ? C.textActive : C.primary },
                    }}
                  >
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: gcActive ? C.textActive : C.accent, flexShrink: 0 }} />
                    {GCIcon && (
                      <Box sx={{ display: 'flex', flexShrink: 0 }}>
                        <GCIcon sx={{ fontSize: 12, color: 'inherit' }} />
                      </Box>
                    )}
                    <Typography sx={{ fontSize: 12, fontWeight: gcActive ? 600 : 400, color: 'inherit', flex: 1, fontFamily: 'inherit' }}>
                      {gcLabel}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  return null;
}

// ============================================================================
// SIDEBAR (Desktop) — Enterprise Professional Dark Header
// ============================================================================
function DesktopSidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    Data: pathname.startsWith('/data'),
    Master: pathname.startsWith('/data/master/') || pathname.startsWith('/data/branch') || pathname.startsWith('/data/produk') || pathname.startsWith('/data/kategori') || pathname.startsWith('/data/sub-kategori') || pathname.startsWith('/data/unit') || pathname.startsWith('/data/pricelist') || pathname.startsWith('/data/bom') || pathname.startsWith('/data/uom') || pathname.startsWith('/data/calculator') || pathname.startsWith('/data/master/staff'),
    Reporting: pathname.startsWith('/data/reporting'),
    'Supply Chain & Cost Control': pathname.startsWith('/scc'),
  }));

  useEffect(() => {
    setOpenGroups((prev) => ({
      ...prev,
      Data: pathname.startsWith('/data'),
      Master: pathname.startsWith('/data/master/') || pathname.startsWith('/data/branch') || pathname.startsWith('/data/produk') || pathname.startsWith('/data/kategori') || pathname.startsWith('/data/sub-kategori') || pathname.startsWith('/data/unit') || pathname.startsWith('/data/pricelist') || pathname.startsWith('/data/bom') || pathname.startsWith('/data/uom') || pathname.startsWith('/data/calculator') || pathname.startsWith('/data/master/staff'),
      Reporting: pathname.startsWith('/data/reporting'),
      'Supply Chain & Cost Control': pathname.startsWith('/scc'),
    }));
  }, [pathname]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{
      width: sidebarWidth, minWidth: sidebarWidth,
      height: '100vh', display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      bgcolor: C.bg,
      borderRight: `1px solid ${C.divider}`,
    }}>
      {/* ── Header (white + logo top, text below) ── */}
      <Box sx={{
        height: HEADER_HEIGHT, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        px: 2, flexShrink: 0,
        bgcolor: C.bg,
        borderBottom: `1px solid ${C.divider}`,
        position: 'relative',
      }}>
        {/* Logo */}
        <Box
          component="img"
          src="/calf-logo.png"
          alt="Kopi Calf"
          sx={{
            width: collapsed ? 28 : 32, height: 'auto',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            objectFit: 'contain', mb: 0.5,
          }}
        />
        {!collapsed && (
          <Typography sx={{
            fontSize: 11, fontWeight: 700, color: C.primary,
            lineHeight: 1.2, letterSpacing: '0.5px',
            fontFamily: 'inherit', textAlign: 'center',
          }}>
            Group Internal Sistem
          </Typography>
        )}
      </Box>

      {/* ── Toggle on right edge ── */}
      <Box
        onClick={onToggleCollapse}
        sx={{
          position: 'absolute',
          top: HEADER_HEIGHT + 12,
          right: 0,
          width: 20,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: C.textSecondary,
          bgcolor: C.accentLight,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          border: `1px solid ${C.divider}`,
          borderRight: 'none',
          zIndex: 10,
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: C.accent,
            color: '#ffffff',
          },
        }}
      >
        <Box sx={{
          display: 'flex',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
        }}>
          {collapsed ? (
            <ChevronRightIcon sx={{ fontSize: 14 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 14 }} />
          )}
        </Box>
      </Box>

      {/* ── Divider label: MAIN NAVIGATION ── */}
      {!collapsed && (
        <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
          <Typography sx={{
            fontSize: 9.5, fontWeight: 700, color: C.textSecondary,
            letterSpacing: '1px', textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}>
            Main Navigation
          </Typography>
        </Box>
      )}

      {/* ── Navigation ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: collapsed ? 1 : 0.5 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
            level={0}
          />
        ))}
      </Box>

      {/* ── Bottom ── */}
      <Box sx={{
        flexShrink: 0,
        borderTop: `1px solid ${C.divider}`,
        bgcolor: C.accentLight,
      }}>
        {/* User profile */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 1.25,
          borderRadius: 1.5, mx: 1, mb: 1,
          bgcolor: C.accentLight,
          transition: 'background 0.15s ease',
          '&:hover': { bgcolor: C.divider },
        }}>
          <Avatar sx={{
            width: 30, height: 30, fontSize: 12, fontWeight: 700,
            bgcolor: C.primary, color: C.textActive, flexShrink: 0,
            border: `2px solid ${C.accent}`,
          }}>
            {(getUserEmail() ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          {!collapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: 12.5, fontWeight: 600, color: C.textPrimary,
                  lineHeight: 1.2, fontFamily: 'inherit',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {getUserEmail()?.split('@')[0] ?? 'User'}
                </Typography>
                <Typography sx={{
                  fontSize: 10.5, color: C.textSecondary, lineHeight: 1.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {getUserEmail() ?? ''}
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <IconButton
                  size="small"
                  onClick={onNavigate}
                  sx={{
                    color: C.textSecondary, p: 0.5,
                    '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' },
                    flexShrink: 0,
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ============================================================================
// SIDEBAR (Mobile) — clean white
// ============================================================================
function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    Data: pathname.startsWith('/data'),
    Master: pathname.startsWith('/data/master/') || pathname.startsWith('/data/branch') || pathname.startsWith('/data/produk') || pathname.startsWith('/data/kategori') || pathname.startsWith('/data/sub-kategori') || pathname.startsWith('/data/unit') || pathname.startsWith('/data/pricelist') || pathname.startsWith('/data/bom') || pathname.startsWith('/data/uom') || pathname.startsWith('/data/calculator') || pathname.startsWith('/data/master/staff'),
    Reporting: pathname.startsWith('/data/reporting'),
    'Supply Chain & Cost Control': pathname.startsWith('/scc'),
  }));

  useEffect(() => {
    setOpenGroups((prev) => ({
      ...prev,
      Data: pathname.startsWith('/data'),
      Master: pathname.startsWith('/data/master/') || pathname.startsWith('/data/branch') || pathname.startsWith('/data/produk') || pathname.startsWith('/data/kategori') || pathname.startsWith('/data/sub-kategori') || pathname.startsWith('/data/unit') || pathname.startsWith('/data/pricelist') || pathname.startsWith('/data/bom') || pathname.startsWith('/data/uom') || pathname.startsWith('/data/calculator') || pathname.startsWith('/data/master/staff'),
      Reporting: pathname.startsWith('/data/reporting'),
      'Supply Chain & Cost Control': pathname.startsWith('/scc'),
    }));
  }, [pathname]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <Box sx={{
      width: DRAWER_WIDTH, minWidth: DRAWER_WIDTH, height: '100%',
      display: 'flex', flexDirection: 'column',
      bgcolor: C.bg,
      borderRight: `1px solid ${C.divider}`,
    }}>
      {/* Header — white with logo top, text below */}
      <Box sx={{
        height: HEADER_HEIGHT, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        px: 2, flexShrink: 0,
        bgcolor: C.bg,
        borderBottom: `1px solid ${C.divider}`,
      }}>
        <Box component="img" src="/calf-logo.png" alt="Kopi Calf"
          sx={{ width: 32, height: 'auto', objectFit: 'contain', mb: 0.5 }} />
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: C.primary,
          lineHeight: 1.2, letterSpacing: '0.5px', textAlign: 'center',
        }}>
          Group Internal Sistem
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} openGroups={openGroups} toggleGroup={toggleGroup} pathname={pathname} collapsed={false} onNavigate={onNavigate} level={0} />
        ))}
      </Box>

      {/* Account */}
      <Box sx={{
        borderTop: `1px solid ${C.divider}`, px: 1.5, py: 1.25,
        flexShrink: 0, bgcolor: C.accentLight,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{
            width: 30, height: 30, fontSize: 12, fontWeight: 700,
            bgcolor: C.primary, color: C.textActive, flexShrink: 0,
            border: `2px solid ${C.accent}`,
          }}>
            {(getUserEmail() ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              fontSize: 12.5, fontWeight: 600, color: C.textPrimary,
              lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {getUserEmail()?.split('@')[0] ?? 'User'}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: C.textSecondary, lineHeight: 1.2 }}>
              {getUserEmail() ?? ''}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={onNavigate} sx={{
              color: C.textSecondary, p: 0.5,
              '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' },
            }}>
              <LogoutIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

// ============================================================================
// APP SHELL
// ============================================================================
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:899px)');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); }
    else { setReady(true); }
  }, [router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  const bottomNavValue = (() => {
    if (pathname.startsWith('/scc/overview')) return '/scc/overview';
    if (pathname.startsWith('/scc/reporting')) return '/scc/reporting';
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    return BOTTOM_NAV_MORE;
  })();

  if (!ready) {
    return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;
  }

  const sidebarWidth = desktopCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, width: sidebarWidth,
          height: '100vh', zIndex: 1200,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <DesktopSidebar collapsed={desktopCollapsed} onToggleCollapse={() => setDesktopCollapsed((c) => !c)} />
        </Box>
      )}

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, boxSizing: 'border-box', top: 0, height: '100%',
            border: 'none', boxShadow: '4px 0 32px rgba(0,0,0,0.08)',
          },
        }}
      >
        <MobileSidebar onNavigate={() => { handleLogout(); setMobileOpen(false); }} />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100dvh',
          ml: { xs: 0, md: `${sidebarWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          transition: 'ml 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Mobile top bar — white with coffee accent */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center', px: 2, height: HEADER_HEIGHT,
          bgcolor: C.bg,
          position: 'sticky', top: 0, zIndex: 10, flexShrink: 0, gap: 1.5,
          borderBottom: `1px solid ${C.divider}`,
        }}>
          <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{
            color: C.primary, border: `1px solid ${C.divider}`, borderRadius: 1.5,
          }}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box component="img" src="/calf-logo.png" alt="Kopi Calf"
            sx={{ width: 28, height: 'auto', borderRadius: 1, flexShrink: 0, objectFit: 'contain' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: '-0.3px' }}>
            Group Internal Sistem
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar sx={{
            width: 28, height: 28, fontSize: 12, fontWeight: 700,
            bgcolor: C.primary, color: C.textActive,
          }}>
            {(getUserEmail() ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        {/* Page content */}
        <Box sx={{
          flexGrow: 1, p: { xs: 2, sm: 3 },
          bgcolor: 'background.default', overflowX: 'hidden',
          pb: { xs: `${BOTTOM_NAV_HEIGHT + 16}px`, md: 3 },
        }}>
          {children}
        </Box>
      </Box>

      {/* Mobile bottom nav — coffee palette */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: { xs: 'flex', md: 'none' },
          pb: 'env(safe-area-inset-bottom)', zIndex: 1200,
          height: BOTTOM_NAV_HEIGHT,
          bgcolor: C.bg,
          borderTop: `1px solid ${C.divider}`,
          boxShadow: `0 -2px 12px rgba(111, 78, 55, 0.06)`,
        }}
      >
        <BottomNavigation
          showLabels
          value={bottomNavValue}
          sx={{
            width: '100%', height: '100%',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0, color: C.textSecondary, fontSize: 10.5,
              fontFamily: 'inherit', fontWeight: 500,
              transition: 'all 0.15s ease',
              '&.Mui-selected': { color: C.primary, fontWeight: 600 },
            },
          }}
          onChange={(_event, value: string) => {
            if (value === BOTTOM_NAV_MORE) setMobileOpen(true);
            else router.push(value);
          }}
        >
          <BottomNavigationAction label="Dashboard" value="/dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Overview" value="/scc/overview" icon={<InsightsIcon />} />
          <BottomNavigationAction label="Reports" value="/scc/reporting" icon={<AssessmentIcon />} />
          <BottomNavigationAction label="Menu" value={BOTTOM_NAV_MORE} icon={<MoreIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
