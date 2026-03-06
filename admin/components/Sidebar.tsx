'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  FileText, ChevronLeft, ChevronRight, LogOut, Settings, Tag, Ticket, Sun, Moon, X,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { sidebarVariants } from '@/lib/framerVariants';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/coupons', label: 'Coupons', icon: Ticket },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const { theme, setTheme } = useTheme();

  // Mobile sidebar is never collapsed — always full width
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <motion.aside
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={isMobile ? undefined : sidebarVariants}
      className={cn(
        'relative flex flex-col h-full bg-card border-r border-border shrink-0',
        isMobile && 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-sm text-foreground whitespace-nowrap flex-1"
          >
            Homestore Admin
          </motion.span>
        )}
        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      {user && (
        <div className="border-t border-border p-3">
          {!isCollapsed && (
            <div className="mb-2 px-2">
              <p className="text-xs font-semibold text-foreground truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mb-1"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      )}

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 translate-x-1/2 top-6 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors z-20"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      )}
    </motion.aside>
  );
}
