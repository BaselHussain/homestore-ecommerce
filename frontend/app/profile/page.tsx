'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, Package, MapPin, User, Lock, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);

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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
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
              <div>
                <h2 className="text-lg font-semibold mb-4">Order History</h2>
                {loadingOrders ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">Order #{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                              {order.status}
                            </span>
                            <p className="text-sm font-semibold mt-1">${Number(order.total).toFixed(2)}</p>
                          </div>
                        </div>
                        {order.trackingNumber && (
                          <p className="text-xs text-muted-foreground">Tracking: <span className="font-mono text-foreground">{order.trackingNumber}</span></p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Saved Addresses</h2>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Plus className="w-4 h-4" /> Add address
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={addressForm.handleSubmit(onAddAddress)} className="bg-card border border-border rounded-xl p-5 mb-4 space-y-4">
                    <h3 className="text-sm font-semibold">New Address</h3>
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
                    <div className="flex gap-2">
                      <button type="submit" disabled={addressForm.formState.isSubmitting}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                        {addressForm.formState.isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />} Save
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-accent">Cancel</button>
                    </div>
                  </form>
                )}

                {loadingAddresses ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No saved addresses</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-card border border-border rounded-xl p-4 relative">
                        {addr.isDefault && <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>}
                        <p className="text-sm font-medium text-foreground">{addr.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.street}</p>
                        <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-xs text-muted-foreground">{addr.country}</p>
                        <button onClick={() => onDeleteAddress(addr.id)} className="mt-3 flex items-center gap-1 text-xs text-destructive hover:underline">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Account Details</h2>
                <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="bg-card border border-border rounded-xl p-6 space-y-4 max-w-md">
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
                  <button type="submit" disabled={profileForm.formState.isSubmitting}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                    {profileForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="bg-card border border-border rounded-xl p-6 space-y-4 max-w-md">
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
                  <button type="submit" disabled={passwordForm.formState.isSubmitting}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                    {passwordForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
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
