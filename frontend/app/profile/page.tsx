'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, Package, MapPin, User, Lock, Plus, Trash2, ChevronDown, CheckCircle, Truck, Clock, Circle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const addressSchema = z.object({
  label: z.string().default('Home'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().default('US'),
});

type Tab = 'orders' | 'addresses' | 'account' | 'security';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    bg: 'bg-muted',           text: 'text-muted-foreground',                     icon: Circle },
  processing: { label: 'Processing', bg: 'bg-amber-500/10',    text: 'text-amber-600 dark:text-amber-400',        icon: Clock },
  confirmed:  { label: 'Confirmed',  bg: 'bg-blue-500/10',     text: 'text-blue-600 dark:text-blue-400',          icon: Clock },
  shipped:    { label: 'Shipped',    bg: 'bg-blue-500/10',     text: 'text-blue-600 dark:text-blue-400',          icon: Truck },
  delivered:  { label: 'Delivered',  bg: 'bg-emerald-500/10',  text: 'text-emerald-600 dark:text-emerald-400',    icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-500/10',      text: 'text-red-600 dark:text-red-400',            icon: XCircle },
};

const TRACKING_STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const getStepIndex = (status: string) => {
  switch (status) {
    case 'pending': return 0;
    case 'processing': case 'confirmed': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    default: return -1;
  }
};

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '', email: user?.email || '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });
  const addressForm = useForm({ resolver: zodResolver(addressSchema), defaultValues: { label: 'Home', country: 'US' } });

  useEffect(() => {
    userApi.getOrders()
      .then((d) => setOrders(d.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoadingOrders(false));

    userApi.getProfile()
      .then((d) => {
        setAddresses(d.user.addresses);
        profileForm.reset({ name: d.user.name, email: d.user.email });
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, []);

  const onProfileSave = async (data: any) => {
    try {
      const result = await userApi.updateProfile(data);
      updateUser({ name: result.user.name, email: result.user.email });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const onPasswordSave = async (data: any) => {
    try {
      await userApi.updatePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  const onAddAddress = async (data: any) => {
    try {
      const result = await userApi.addAddress(data);
      setAddresses((prev) => [...prev, result.address]);
      toast.success('Address added');
      setShowAddAddress(false);
      addressForm.reset({ label: 'Home', country: 'US' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    }
  };

  const onDeleteAddress = async (id: string) => {
    try {
      await userApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove address');
    }
  };

  const tabs = [
    { id: 'orders' as Tab, label: 'My Orders', icon: Package },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'account' as Tab, label: 'Account', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">My Account</h1>
          <p className="text-muted-foreground mt-1">{user?.email}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                    activeTab === id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-base font-semibold text-foreground">Order History</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {loadingOrders ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="p-6">
                {loadingOrders ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const rawStatus = (order.status || '').toLowerCase();
                      const cfg = STATUS_CONFIG[rawStatus] ?? STATUS_CONFIG['pending'];
                      const StatusIcon = cfg.icon;
                      const stepIndex = getStepIndex(rawStatus);
                      const isExpanded = expandedOrderId === order.id;
                      const items: Array<{ name: string; price: number; quantity: number }> = Array.isArray(order.items) ? order.items : [];
                      const addr = order.shippingAddress as { street?: string; city?: string; state?: string; zipCode?: string; country?: string } | null;

                      return (
                        <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                          {/* Summary row — always visible */}
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/40 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">#{order.id.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                              <span className="text-sm font-bold text-foreground">${Number(order.total).toFixed(2)}</span>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Expanded detail */}
                          <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden">
                              <div className={`border-t border-border px-5 pb-5 pt-4 space-y-4 transition-opacity duration-[400ms] delay-150 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                {/* Progress tracker (not for cancelled) */}
                                {rawStatus !== 'cancelled' && stepIndex >= 0 && (
                                  <div className="relative flex justify-between">
                                    {/* Background line — vertically centered on the 20px circles */}
                                    <div className="absolute top-[10px] left-2.5 right-2.5 h-0.5 bg-border" />
                                    {/* Progress line */}
                                    <div
                                      className="absolute top-[10px] left-2.5 h-0.5 bg-primary transition-all duration-500"
                                      style={{ width: `calc(${(stepIndex / (TRACKING_STEPS.length - 1)) * 100}% - 20px)` }}
                                    />
                                    {TRACKING_STEPS.map((step, i) => {
                                      const filled = i <= stepIndex;
                                      return (
                                        <div key={step} className="flex flex-col items-center gap-1 relative z-10">
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${filled ? 'border-primary bg-primary' : 'border-border bg-background'}`}>
                                            {filled && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                                          </div>
                                          <span className={`text-[10px] font-medium ${filled ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Order items */}
                                {items.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</p>
                                    <div className="space-y-2">
                                      {items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                          <span className="text-foreground">{item.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                                          <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Shipping address */}
                                {addr && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Shipping Address</p>
                                    <p className="text-sm text-foreground">{addr.street}</p>
                                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode} · {addr.country}</p>
                                  </div>
                                )}

                                {/* Tracking number */}
                                {order.trackingNumber && (
                                  <div className="flex items-center gap-2 text-xs bg-secondary rounded-lg px-3 py-2">
                                    <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="text-muted-foreground">Tracking: <span className="font-mono font-medium text-foreground">{order.trackingNumber}</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Saved Addresses</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage your delivery addresses</p>
                  </div>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add address
                  </button>
                </div>

                {/* Add address form */}
                <div className={`grid transition-all duration-300 ease-in-out ${showAddAddress ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <form onSubmit={addressForm.handleSubmit(onAddAddress)} className="border-b border-border">
                      <div className="px-6 pt-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: 'label', label: 'Label (e.g. Home, Work)', placeholder: 'Home' },
                          { name: 'street', label: 'Street', placeholder: '123 Main St' },
                          { name: 'city', label: 'City', placeholder: 'New York' },
                          { name: 'state', label: 'State', placeholder: 'NY' },
                          { name: 'zipCode', label: 'Zip Code', placeholder: '10001' },
                          { name: 'country', label: 'Country', placeholder: 'US' },
                        ].map(({ name, label, placeholder }) => (
                          <div key={name}>
                            <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
                            <input {...addressForm.register(name as any)} placeholder={placeholder}
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            {addressForm.formState.errors[name as keyof typeof addressForm.formState.errors] && (
                              <p className="text-xs text-destructive mt-1">{(addressForm.formState.errors[name as keyof typeof addressForm.formState.errors] as any)?.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="px-6 py-3 bg-secondary/40 border-t border-border flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowAddAddress(false)}
                          className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-accent cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" disabled={addressForm.formState.isSubmitting}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                          {addressForm.formState.isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />} Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="p-6">
                  {loadingAddresses ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-8"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No saved addresses yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="border border-border rounded-xl p-4 relative">
                          {addr.isDefault && <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>}
                          <p className="text-sm font-medium text-foreground">{addr.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{addr.street}</p>
                          <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-xs text-muted-foreground">{addr.country}</p>
                          <button onClick={() => onDeleteAddress(addr.id)} className="mt-3 flex items-center gap-1 text-xs text-destructive hover:underline cursor-pointer">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="max-w-md mx-auto">
                <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-foreground">Account Details</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Update your name and email address</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { name: 'name', label: 'Full name', type: 'text' },
                      { name: 'email', label: 'Email address', type: 'email' },
                    ].map(({ name, label, type }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                        <input {...profileForm.register(name as any)} type={type}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        {profileForm.formState.errors[name as keyof typeof profileForm.formState.errors] && (
                          <p className="text-xs text-destructive mt-1">{(profileForm.formState.errors[name as keyof typeof profileForm.formState.errors] as any)?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-border bg-secondary/40 flex justify-end">
                    <button type="submit" disabled={profileForm.formState.isSubmitting}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      {profileForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="max-w-md mx-auto">
                <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-foreground">Change Password</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Use a strong password with at least 8 characters</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { name: 'currentPassword', label: 'Current password' },
                      { name: 'newPassword', label: 'New password' },
                      { name: 'confirmPassword', label: 'Confirm new password' },
                    ].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                        <input {...passwordForm.register(name as any)} type="password"
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        {passwordForm.formState.errors[name as keyof typeof passwordForm.formState.errors] && (
                          <p className="text-xs text-destructive mt-1">{(passwordForm.formState.errors[name as keyof typeof passwordForm.formState.errors] as any)?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-border bg-secondary/40 flex justify-end">
                    <button type="submit" disabled={passwordForm.formState.isSubmitting}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      {passwordForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
