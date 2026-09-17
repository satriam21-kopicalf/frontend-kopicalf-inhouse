'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { message } from 'antd';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  tooltip?: string;
}

interface NavDropdown {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  isActive?: boolean;
}

// SVG Icons
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  sales: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  clipboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  monitor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  package: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
      <path d="M3.11 7.45l7.78 3.47M20.89 7.45l-7.78 3.47" />
    </svg>
  ),
  tools: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  ),
  database: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  departments: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  checkCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  menu: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  chevronDown: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  chevronRight: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  chevronLeft: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  form: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
  data: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
};

// Navigation structure
const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/main-menu/dashboard', icon: Icons.dashboard, tooltip: 'Dashboard' },
  { label: 'Recap Sales', href: '/main-menu/recap-sales', icon: Icons.sales, tooltip: 'Recap Sales' },
];

const operationalSubItemsForm: NavItem[] = [
  { label: 'PIC Check In', href: '/operational/form/pic-check-in', icon: Icons.database, tooltip: 'Form PIC Check In' },
  { label: 'Monitoring Outlet', href: '/operational/form/monitoring-outlet', icon: Icons.database, tooltip: 'Form Monitoring Outlet' },
  { label: 'Monitoring Product', href: '/operational/form/monitoring-product', icon: Icons.database, tooltip: 'Form Monitoring Product' },
  { label: 'Tool & Heavy Tools', href: '/operational/form/tool-heavy-tools', icon: Icons.database, tooltip: 'Form Tool & Heavy Tools' },
  { label: 'Facility Request', href: '/operational/form/facility-request', icon: Icons.database, tooltip: 'Form Facility Request' },
];

const operationalSubItemsData: NavItem[] = [
  { label: 'PIC Check In', href: '/operational/data/pic-check-in', icon: Icons.database, tooltip: 'Data PIC Check In' },
  { label: 'Monitoring Outlet', href: '/operational/data/monitoring-outlet', icon: Icons.database, tooltip: 'Data Monitoring Outlet' },
  { label: 'Monitoring Product', href: '/operational/data/monitoring-product', icon: Icons.database, tooltip: 'Data Monitoring Product' },
  { label: 'Tool & Heavy Tools', href: '/operational/data/tool-heavy-tools', icon: Icons.database, tooltip: 'Data Tool & Heavy Tools' },
  { label: 'Facility Request', href: '/operational/data/facility-request', icon: Icons.database, tooltip: 'Data Facility Request' },
];

const managementNav: NavItem[] = [
  { label: 'User Management', href: '/management/users', icon: Icons.users, tooltip: 'Users' },
  { label: 'Departments', href: '/management/department', icon: Icons.departments, tooltip: 'Departments' },
  { label: 'Divisions', href: '/management/division', icon: Icons.departments, tooltip: 'Divisions' },
  { label: 'Approval Lines', href: '/management/approval-lines', icon: Icons.checkCircle, tooltip: 'Approval Lines' },
];

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 8px)',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '6px 10px',
          background: '#000000',
          color: '#FFFFFF',
          fontSize: 11,
          borderRadius: 4,
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.1s ease'
        }}>
          {content}
          <div style={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            border: '5px solid transparent',
            borderRightColor: '#000000'
          }} />
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-50%) translateX(-4px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }`}</style>
    </div>
  );
}

interface SidebarProps {
  children: React.ReactNode;
}

function NavDropdown({ title, icon, items, isActive, collapsed }: { title: string; icon: React.ReactNode; items: NavItem[]; isActive: (href: string) => boolean; collapsed: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveChild = items.some(item => isActive(item.href));

  if (collapsed) {
    return (
      <Tooltip content={title}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '9px',
            borderRadius: 6,
            cursor: 'pointer',
            background: hasActiveChild ? '#F5F5F5' : 'transparent',
            transition: 'background 0.1s ease',
            minHeight: 34,
          }}
        >
          <span style={{ flexShrink: 0 }}>{icon}</span>
        </div>
      </Tooltip>
    );
  }

  return (
    <div style={{ marginBottom: 1 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 10px',
          borderRadius: 6,
          cursor: 'pointer',
          background: hasActiveChild || expanded ? '#F5F5F5' : 'transparent',
          transition: 'background 0.1s ease',
          userSelect: 'none' as const,
        }}
        onMouseEnter={(e) => { if (!hasActiveChild && !expanded) e.currentTarget.style.background = '#F5F5F5'; }}
        onMouseLeave={(e) => { if (!hasActiveChild && !expanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, color: hasActiveChild ? '#000000' : '#666666', fontWeight: hasActiveChild ? 500 : 400 }}>
          {title}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#8A8A8A'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div style={{
          marginLeft: 16,
          borderLeft: '1px solid #E5E5E5',
          paddingLeft: 8,
          marginTop: 4,
          animation: 'slideDown 0.2s ease'
        }}>
          <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                color: isActive(item.href) ? '#000000' : '#666666',
                background: isActive(item.href) ? '#F5F5F5' : 'transparent',
                fontWeight: isActive(item.href) ? 500 : 400,
                fontSize: 13,
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.background = '#F5F5F5';
                  e.currentTarget.style.color = '#000000';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666666';
                }
              }}
            >
              <span style={{ fontSize: 11, color: '#8A8A8A', width: 16 }}>•</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: '#000000',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 5px',
                  borderRadius: 8,
                  flexShrink: 0
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavSection({ title, items, collapsed, isActive }: { title?: string; items: NavItem[]; collapsed: boolean; isActive: (href: string) => boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {!collapsed && title && (
        <div style={{
          color: '#8A8A8A',
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0 8px',
          marginBottom: 4,
          marginTop: 8
        }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item) => (
          <Tooltip key={item.href} content={item.tooltip || item.label}>
            <Link
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '9px' : '9px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                color: isActive(item.href) ? '#000000' : '#666666',
                background: isActive(item.href) ? '#F5F5F5' : 'transparent',
                fontWeight: isActive(item.href) ? 500 : 400,
                transition: 'all 0.1s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: 34,
                fontSize: 13
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.background = '#F5F5F5';
                  e.currentTarget.style.color = '#000000';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666666';
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: 8,
                      flexShrink: 0
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href;

  // User data (mock)
  const user = {
    name: 'Admin',
    email: 'admin@kopicalf.com',
    role: 'Administrator',
    initials: 'AD'
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
        setMobileOpen(false);
      } else {
        setIsCollapsed(false);
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push('/auth/logout');
  };

  const navWidth = isCollapsed ? 56 : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F7F7' }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: navWidth,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E5E5',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.15s ease, transform 0.2s ease',
        zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo Area - Logo Only */}
        <div style={{
          padding: isCollapsed ? '12px' : '12px 16px',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'center',
          minHeight: 52
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <Image
              src="/assets/calf-logo.png"
              alt="Kopi Calf"
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          <NavSection title="Main Menu" items={mainNav} collapsed={isCollapsed} isActive={isActive} />

          {/* Operational Section Header */}
          {!isCollapsed && (
            <div style={{
              color: '#8A8A8A',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '8px 8px 4px',
              marginTop: 8
            }}>
              Operational
            </div>
          )}

          {/* Form Dropdown */}
          <NavDropdown
            title="Form"
            icon={Icons.form}
            items={operationalSubItemsForm}
            isActive={isActive}
            collapsed={isCollapsed}
          />

          {/* Data Dropdown */}
          <NavDropdown
            title="Data"
            icon={Icons.data}
            items={operationalSubItemsData}
            isActive={isActive}
            collapsed={isCollapsed}
          />

          <NavSection title="Management" items={managementNav} collapsed={isCollapsed} isActive={isActive} />
        </nav>

        {/* Bottom - User Profile */}
        <div style={{ padding: '8px', borderTop: '1px solid #E5E5E5' }} ref={profileRef}>
          {isCollapsed ? (
            // Collapsed: Show avatar only with tooltip
            <Tooltip content={`${user.name} - ${user.role}`}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'background 0.1s ease'
              }}
              onClick={() => router.push('/account-profile')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 700
                }}>
                  {user.initials}
                </div>
              </div>
            </Tooltip>
          ) : (
            // Expanded: Show dropdown menu
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                  background: profileOpen ? '#F5F5F5' : 'transparent'
                }}
                onMouseEnter={(e) => { if (!profileOpen) e.currentTarget.style.background = '#F5F5F5'; }}
                onMouseLeave={(e) => { if (!profileOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {user.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ color: '#000000', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ color: '#8A8A8A', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.role}
                  </div>
                </div>
                <span style={{ color: '#8A8A8A', display: 'flex', alignItems: 'center' }}>
                  {Icons.chevronDown}
                </span>
              </div>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  borderRadius: 8,
                  border: '1px solid #E5E5E5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  marginBottom: 4,
                  overflow: 'hidden',
                  animation: 'slideUp 0.15s ease'
                }}>
                  <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                  {/* User Info */}
                  <div style={{ padding: '12px', borderBottom: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#000000' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: '#8A8A8A' }}>{user.email}</div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => { router.push('/account-profile'); setProfileOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#333333',
                      textAlign: 'left',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {Icons.user}
                    Account Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#DC2626',
                      textAlign: 'left',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {Icons.logout}
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            right: -12,
            top: 14,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5E5E5',
            color: '#666666',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            zIndex: 1
          }}
          className="collapse-toggle"
        >
          {isCollapsed ? Icons.chevronRight : Icons.chevronLeft}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: navWidth,
        transition: 'margin-left 0.15s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }} className="main-content">
        {/* Top Header Bar */}
        <header style={{
          height: 52,
          borderBottom: '1px solid #E5E5E5',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexShrink: 0
        }} className="header-bar">
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
              color: '#000000',
              padding: 0
            }}
            className="mobile-menu-btn"
          >
            {Icons.menu}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#8A8A8A', fontSize: 13 }}>Kopi Calf</span>
            <span style={{ color: '#E0E0E0' }}>/</span>
            <span style={{ color: '#000000', fontSize: 13, fontWeight: 500 }}>
              {pathname.split('/')[1] ? pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1) : 'Home'}
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666666'
            }}>
              {Icons.bell}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '16px', flex: 1, maxWidth: '100%', overflowX: 'hidden' }} className="page-content">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (min-width: 768px) {
          .collapse-toggle { display: flex !important; }
        }

        @media (max-width: 767px) {
          .main-content { margin-left: 0 !important; }
          .collapse-toggle { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }

        @media (max-width: 480px) {
          .page-content { padding: 10px !important; }
        }
      `}</style>
    </div>
  );
}
