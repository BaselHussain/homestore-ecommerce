'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { staggerContainer, staggerItem, modalVariants } from '@/lib/framerVariants';
import { Search, Loader2, Users, X, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isBanned: boolean;
  created_at: string;
  last_login_at: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banning, setBanning] = useState<string | null>(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (search) params.search = search;
      const data = await adminApi.getUsers(params);
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleBan = async (user: User, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBanning(user.id);
    try {
      await adminApi.banUser(user.id, !user.isBanned);
      toast.success(user.isBanned ? 'User unbanned' : 'User banned');
      setUsers(us => us.map(u => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(u => u ? { ...u, isBanned: !u.isBanned } : null);
      }
    } catch {
      toast.error('Failed to update user');
    } finally {
      setBanning(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{total} registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by email…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <Users className="w-8 h-8 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Last Login</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <motion.tbody initial="hidden" animate="visible" variants={staggerContainer}>
                {users.map((u, i) => (
                  <motion.tr key={u.id} custom={i} variants={staggerItem}
                    className="border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(u)}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{u.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">Banned</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        disabled={banning === u.id || u.role === 'admin'}
                        onClick={e => toggleBan(u, e)}
                        title={u.role === 'admin' ? 'Cannot ban admin users' : (u.isBanned ? 'Unban user' : 'Ban user')}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${u.isBanned ? 'hover:bg-green-100 text-green-600' : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'}`}>
                        {u.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* User details modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedUser.name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <p className="font-medium capitalize text-foreground">{selectedUser.role}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className={`font-medium ${selectedUser.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedUser.isBanned ? 'Banned' : 'Active'}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Joined</p>
                    <p className="font-medium text-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Last Login</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                {selectedUser.role !== 'admin' && (
                  <button
                    disabled={banning === selectedUser.id}
                    onClick={() => toggleBan(selectedUser)}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${selectedUser.isBanned
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    }`}>
                    {banning === selectedUser.id ? 'Updating…' : selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
