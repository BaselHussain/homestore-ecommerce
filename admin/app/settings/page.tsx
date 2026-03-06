'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/framerVariants';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Sun, Moon, Monitor, User, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAdminAuth();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your admin preferences</p>
        </motion.div>

        {/* Account info */}
        <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Account</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-border/60">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{user?.name || '—'}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-border/60">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Role</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium text-purple-600 capitalize">{user?.role ?? 'admin'}</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  theme === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Backend info */}
        <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">System</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Admin Panel</span>
              <span className="font-medium text-foreground">Next.js 16</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground">Backend API</span>
              <span className="font-medium text-foreground">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
