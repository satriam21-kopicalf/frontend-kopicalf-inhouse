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
  Inventory2 as InventoryIcon,
  Category as CategoryIcon,
  PointOfSale as POSIcon,
  LocalOffer as OfferIcon,
  AccountTree as AccountTreeIcon,
  Calculate as CalculateIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as Inventory2Icon,
  DeleteOutlined as WasteIcon,
  Checklist as ChecklistIcon,
  Settings as SettingsIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import { NAV_ITEMS } from '@/components/navConfig';
import { isLoggedIn, logout, getUserEmail } from '@/lib/auth';

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 56;
const HEADER_HEIGHT = 52;
const BOTTOM_NAV_HEIGHT = 56;
const BOTTOM_NAV_MORE = '__more__';

const LABEL_MAP: Record<string, string> = {
  'Supply Chain & Cost Control': 'Supply Chain',
};

// ============================================================================
// NAV ITEM (3-level hierarchy — glassmorphism modern style)
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
              borderRadius: 2, cursor: 'pointer', textDecoration: 'none', border: 'none',
              bgcolor: isActive ? 'rgba(79, 70, 229, 0.12)' : 'transparent',
              color: isActive ? '#4f46e5' : '#94a3b8',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5' },
            }}
          >
            {Icon && <Icon sx={{ fontSize: 18 }} />}
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box sx={{ mb: 0.25, px: 1 }}>
        <Box
          component={hasChildren ? 'button' : Link}
          href={hasChildren ? '#' : (item.href || '/dashboard')}
          onClick={hasChildren ? (e: React.MouseEvent) => { e.preventDefault(); toggleGroup(item.label); } : onNavigate}
          sx={{
            display: 'flex', alignItems: 'center',
            width: '100%', minHeight: 38, px: 1.5, py: 0.5,
            cursor: 'pointer', textDecoration: 'none', border: 'none',
            bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'transparent',
            color: isActive ? '#1e1b4b' : '#64748b',
            transition: 'all 0.15s ease',
            gap: 1, borderRadius: 2,
            position: 'relative', overflow: 'hidden',
            '&::before': isActive ? {
              content: '""', position: 'absolute', left: 0, top: '20%', bottom: '20%',
              width: 3, borderRadius: '0 2px 2px 0',
              bgcolor: '#4f46e5',
            } : {},
            '&:hover': { bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'rgba(0,0,0,0.03)' },
          }}
        >
          {Icon && (
            <Box sx={{ display: 'flex', flexShrink: 0, color: 'inherit', opacity: isActive ? 1 : 0.55 }}>
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
            <Box sx={{ display: 'flex', flexShrink: 0, color: '#94a3b8', transition: 'transform 0.2s ease', transform: isGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
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
              bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'transparent',
              color: isActive ? '#4f46e5' : '#94a3b8',
              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.06)', color: '#4f46e5' },
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
            bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'transparent',
            color: isActive ? '#1e1b4b' : '#64748b',
            gap: 0.75, transition: 'all 0.15s ease',
            pl: 3.5,
            '&:hover': { bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'rgba(0,0,0,0.03)', color: '#1e1b4b' },
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isActive ? '#4f46e5' : '#cbd5e1', flexShrink: 0 }} />
          {Icon && (
            <Box sx={{ display: 'flex', flexShrink: 0, opacity: isActive ? 0.9 : 0.45 }}>
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
      <Box sx={{ mb: 0.25, px: 1 }}>
        <Box
          component="button"
          onClick={(e: React.MouseEvent) => { e.preventDefault(); toggleGroup(item.label); }}
          sx={{
            display: 'flex', alignItems: 'center',
            width: '100%', minHeight: 30, px: 1.5, py: 0.35, mb: 0.05,
            borderRadius: 1.5, cursor: 'pointer', textDecoration: 'none', border: 'none',
            bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'transparent',
            color: isActive ? '#1e1b4b' : '#64748b',
            gap: 0.75, transition: 'all 0.15s ease',
            '&:hover': { bgcolor: isActive ? 'rgba(79, 70, 229, 0.10)' : 'rgba(0,0,0,0.03)' },
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isActive ? '#4f46e5' : '#cbd5e1', flexShrink: 0 }} />
          {Icon && (
            <Box sx={{ display: 'flex', flexShrink: 0, opacity: isActive ? 0.9 : 0.45 }}>
              <Icon sx={{ fontSize: 13, color: 'inherit' }} />
            </Box>
          )}
          <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: 'inherit', flex: 1, textAlign: 'left', fontFamily: 'inherit' }}>
            {displayLabel}
          </Typography>
          <Box sx={{ display: 'flex', flexShrink: 0, color: '#94a3b8', transition: 'transform 0.2s ease', transform: isGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
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
                      bgcolor: gcActive ? '#4f46e5' : 'transparent',
                      color: gcActive ? '#ffffff' : '#64748b',
                      gap: 0.75, transition: 'all 0.15s ease',
                      pl: 5,
                      '&:hover': { bgcolor: gcActive ? '#4338ca' : 'rgba(79, 70, 229, 0.05)', color: gcActive ? '#ffffff' : '#1e1b4b' },
                    }}
                  >
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: gcActive ? '#a5b4fc' : '#d1d5db', flexShrink: 0 }} />
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
// SIDEBAR (Desktop) — glassmorphism floating design
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
      bgcolor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)',
    }}>
      {/* ── Header ── */}
      <Box sx={{
        height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
        px: 2, flexShrink: 0,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}>
        <Box
          component="img"
          src="/calf-logo.png"
          alt="Kopi Calf"
          sx={{
            width: collapsed ? 28 : 38, height: 'auto', borderRadius: 2,
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* ── Navigation ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5 }}>
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
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        bgcolor: 'rgba(250, 250, 250, 0.5)',
      }}>
        {/* Collapse toggle */}
        <Box
          onClick={onToggleCollapse}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            width: '100%', minHeight: 36, px: 2, py: 0.75,
            cursor: 'pointer', color: '#94a3b8',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)', color: '#475569' },
          }}
        >
          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <ToggleSidebarIcon sx={{
              fontSize: 15,
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: collapsed ? 'rotate(180deg)' : 'none',
            }} />
          </Box>
          {!collapsed && (
            <Typography sx={{ fontSize: 12.5, color: 'inherit', fontFamily: 'inherit' }}>
              Collapse sidebar
            </Typography>
          )}
        </Box>

        {/* User profile */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 2, py: 1,
          borderRadius: 1.5, mx: 1, mb: 1,
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.05)' },
          transition: 'background 0.15s ease',
        }}>
          <Avatar sx={{
            width: 28, height: 28, fontSize: 12, fontWeight: 700,
            bgcolor: '#4f46e5', color: '#ffffff', flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
          }}>
            {(getUserEmail() ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          {!collapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: 12.5, fontWeight: 600, color: '#1e293b',
                  lineHeight: 1.2, fontFamily: 'inherit',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {getUserEmail()?.split('@')[0] ?? 'User'}
                </Typography>
                <Typography sx={{
                  fontSize: 10.5, color: '#94a3b8', lineHeight: 1.2,
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
                    color: '#cbd5e1', p: 0.5,
                    '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' },
                    flexShrink: 0,
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 13 }} />
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
// SIDEBAR (Mobile) — glassmorphism
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
      bgcolor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Header */}
      <Box sx={{
        height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
        px: 2, flexShrink: 0, borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}>
        <Box component="img" src="/calf-logo.png" alt="Kopi Calf" sx={{ width: 38, height: 'auto', borderRadius: 2, objectFit: 'contain' }} />
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} openGroups={openGroups} toggleGroup={toggleGroup} pathname={pathname} collapsed={false} onNavigate={onNavigate} level={0} />
        ))}
      </Box>

      {/* Account */}
      <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)', px: 2, py: 1.5, flexShrink: 0, bgcolor: 'rgba(250, 250, 250, 0.5)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: '#4f46e5', color: '#ffffff', flexShrink: 0, boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)' }}>
            {(getUserEmail() ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getUserEmail()?.split('@')[0] ?? 'User'}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.2 }}>
              {getUserEmail() ?? ''}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={onNavigate} sx={{ color: '#cbd5e1', p: 0.5, '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}>
              <LogoutIcon sx={{ fontSize: 13 }} />
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
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: '#f8fafc' }}>
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
        {/* Mobile top bar */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center', px: 2, height: HEADER_HEIGHT,
          bgcolor: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky', top: 0, zIndex: 10, flexShrink: 0, gap: 1.5,
        }}>
          <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1.5 }}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box component="img" src="/calf-logo.png" alt="Kopi Calf" sx={{ width: 26, height: 'auto', borderRadius: 1.5, flexShrink: 0, objectFit: 'contain' }} />
          <Box sx={{ flexGrow: 1 }} />
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: '#4f46e5', boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)' }}>
            {(getUserEmail() ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        {/* Page content */}
        <Box sx={{
          flexGrow: 1, p: { xs: 2, sm: 3 },
          bgcolor: '#f8fafc', overflowX: 'hidden',
          pb: { xs: `${BOTTOM_NAV_HEIGHT + 16}px`, md: 3 },
        }}>
          {children}
        </Box>
      </Box>

      {/* Mobile bottom nav — glassmorphism */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: { xs: 'flex', md: 'none' },
          pb: 'env(safe-area-inset-bottom)', zIndex: 1200,
          height: BOTTOM_NAV_HEIGHT,
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.04)',
        }}
      >
        <BottomNavigation
          showLabels
          value={bottomNavValue}
          sx={{
            width: '100%', height: '100%',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0, color: '#94a3b8', fontSize: 10.5,
              fontFamily: 'inherit', fontWeight: 500,
              transition: 'all 0.15s ease',
              '&.Mui-selected': { color: '#4f46e5', fontWeight: 600 },
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
