'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, Calendar, Shield, Edit, Sun, Moon, Monitor, Users, DollarSign, CheckCircle, Clock, CalendarDays, Image, Briefcase, FileText, Plane, BookOpen, ArrowRight, Plus, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/app/providers/ThemeProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientStats, setClientStats] = useState<any>(null);
  const [contentStats, setContentStats] = useState<any>(null);
  const [adminDashboard, setAdminDashboard] = useState<any>(null);
  const [userDashboard, setUserDashboard] = useState<any>(null);

  // Debug theme
  useEffect(() => {
    console.log('Current theme state:', { theme, resolvedTheme });
    console.log('HTML classList:', document.documentElement.classList.toString());
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          router.push('/auth/login');
          return;
        }

        const data = await response.json();
        setUser(data.user);

        // Fetch client stats for admins
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          fetchClientStats();
          fetchContentStats();
          fetchAdminDashboard();
        } else {
          // Fetch dashboard data for regular users
          fetchUserDashboard();
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const fetchClientStats = async () => {
    try {
      const response = await fetch('/api/travelers');
      if (response.ok) {
        const travelers = await response.json();

        // Basic stats
        const total = travelers.length;
        const completed = travelers.filter((t: any) => t.processStatus === 'COMPLETED').length;
        const paid = travelers.filter((t: any) => t.paymentStatus === 'PAID').length;
        const pending = travelers.filter((t: any) => ['INQUIRY', 'DOCUMENTS_PENDING', 'PAYMENT_PENDING'].includes(t.processStatus)).length;

        // Process status breakdown
        const processStatusData = [
          { name: 'Inquiry', value: travelers.filter((t: any) => t.processStatus === 'INQUIRY').length },
          { name: 'Documents Pending', value: travelers.filter((t: any) => t.processStatus === 'DOCUMENTS_PENDING').length },
          { name: 'Processing', value: travelers.filter((t: any) => ['DOCUMENTS_RECEIVED', 'DOCUMENTS_VERIFIED', 'VISA_PROCESSING'].includes(t.processStatus)).length },
          { name: 'Payment Stage', value: travelers.filter((t: any) => ['PAYMENT_PENDING', 'PAYMENT_PARTIAL', 'PAYMENT_COMPLETE'].includes(t.processStatus)).length },
          { name: 'Completed', value: completed },
          { name: 'Cancelled', value: travelers.filter((t: any) => t.processStatus === 'CANCELLED').length },
        ].filter(item => item.value > 0);

        // Payment status data
        const paymentStatusData = [
          { name: 'Pending', value: travelers.filter((t: any) => t.paymentStatus === 'PENDING').length },
          { name: 'Paid', value: paid },
          { name: 'Refunded', value: travelers.filter((t: any) => t.paymentStatus === 'REFUNDED').length },
        ].filter(item => item.value > 0);

        // Sex distribution
        const sexData = [
          { name: 'Male', value: travelers.filter((t: any) => t.sex === 'MALE').length },
          { name: 'Female', value: travelers.filter((t: any) => t.sex === 'FEMALE').length },
          { name: 'Other', value: travelers.filter((t: any) => t.sex === 'OTHER').length },
        ].filter(item => item.value > 0);

        setClientStats({
          total,
          completed,
          paid,
          pending,
          processStatusData,
          paymentStatusData,
          sexData,
        });
      }
    } catch (error) {
      console.error('Error fetching client stats:', error);
    }
  };

  const fetchContentStats = async () => {
    try {
      const [eventsRes, galleryRes, servicesRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/gallery'),
        fetch('/api/services'),
      ]);

      const events = eventsRes.ok ? await eventsRes.json() : [];
      const gallery = galleryRes.ok ? await galleryRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];

      setContentStats({
        events: {
          total: events.length,
          active: events.filter((e: any) => e.isActive).length,
          upcoming: events.filter((e: any) => e.status === 'UPCOMING').length,
          featured: events.filter((e: any) => e.isFeatured).length,
        },
        gallery: {
          total: gallery.length,
          active: gallery.filter((g: any) => g.isActive).length,
        },
        services: {
          total: services.length,
          active: services.filter((s: any) => s.isActive).length,
        },
      });
    } catch (error) {
      console.error('Error fetching content stats:', error);
    }
  };

  const fetchAdminDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setAdminDashboard(data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    }
  };

  const fetchUserDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserDashboard(data);
      }
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/');
        router.refresh();
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    console.log('Cycling theme:', { current: theme, next: nextTheme, currentIndex });
    setTheme(nextTheme);

    // Force update DOM immediately
    const root = document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else if (nextTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    toast.success(`Theme changed to ${nextTheme}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header with Theme Toggle */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Manage your account and access your features</p>
        </div>
        <button
          onClick={cycleTheme}
          className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-foreground shadow-sm w-full sm:w-auto"
          title={`Current theme: ${theme}`}
        >
          {getThemeIcon()}
          <span className="capitalize">{theme}</span>
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 border border-border"
      >
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0 shadow-lg">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground uppercase font-medium">{user.role}</span>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-foreground w-full sm:w-auto justify-center">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
            <Mail className="w-5 h-5 text-primary mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Email</p>
              <p className="text-sm sm:text-base text-foreground font-medium break-all">{user.email}</p>
              {user.email_confirmed_at && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 mt-1">
                  Verified
                </span>
              )}
            </div>
          </div>

          {user.phone && (
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
              <Phone className="w-5 h-5 text-primary mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Phone</p>
                <p className="text-sm sm:text-base text-foreground font-medium">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
            <Calendar className="w-5 h-5 text-primary mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm sm:text-base text-foreground font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin Appointments Overview */}
      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && adminDashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Appointments & Bookings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Applications Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/appointments')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Program Applications</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{adminDashboard.applications.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{adminDashboard.applications.stats.submitted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Under Review:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{adminDashboard.applications.stats.underReview}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.applications.stats.approved}</span>
                </div>
              </div>
            </div>

            {/* Reservations Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Plane className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/appointments')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Reservations</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{adminDashboard.reservations.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{adminDashboard.reservations.stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.reservations.stats.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{adminDashboard.reservations.stats.completed}</span>
                </div>
              </div>
            </div>

            {/* Bookings Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/appointments')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Service Bookings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{adminDashboard.bookings.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{adminDashboard.bookings.stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.bookings.stats.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{adminDashboard.bookings.stats.completed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Chart */}
            {adminDashboard.applications.statusData.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Application Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={adminDashboard.applications.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {adminDashboard.applications.statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Reservation Status Chart */}
            {adminDashboard.reservations.statusData.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Reservation Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adminDashboard.reservations.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#a855f7" name="Reservations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Booking Status Chart */}
            {adminDashboard.bookings.statusData.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adminDashboard.bookings.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Reservation Type Chart */}
            {adminDashboard.reservations.typeData.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Reservation Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={adminDashboard.reservations.typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {adminDashboard.reservations.typeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#a855f7', '#06b6d4'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Admin System Overview - NEW SECTION */}
      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && adminDashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">System Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Users Stats */}
            {adminDashboard.users && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <button
                    onClick={() => router.push('/profile/admins')}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Manage →
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">System Users</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold text-foreground">{adminDashboard.users.stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regular Users:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{adminDashboard.users.stats.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admins:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{adminDashboard.users.stats.admins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.users.stats.verified}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Travelers Stats */}
            {adminDashboard.travelers && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <button
                    onClick={() => router.push('/profile/clients')}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    View →
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Travelers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold text-foreground">{adminDashboard.travelers.stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{adminDashboard.travelers.stats.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.travelers.stats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{adminDashboard.travelers.stats.paid}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chats Stats */}
            {adminDashboard.chats && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <button
                    onClick={() => router.push('/profile/chats')}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    View →
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Chat Support</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Chats:</span>
                    <span className="font-semibold text-foreground">{adminDashboard.chats.stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.chats.stats.open}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unread:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{adminDashboard.chats.stats.unreadMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{adminDashboard.chats.stats.totalMessages}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Testimonials Stats */}
            {adminDashboard.testimonials && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <Star className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <button
                    onClick={() => router.push('/admin/testimonials')}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Manage →
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Testimonials</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold text-foreground">{adminDashboard.testimonials.stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">{adminDashboard.testimonials.stats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{adminDashboard.testimonials.stats.approved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rejected:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{adminDashboard.testimonials.stats.rejected}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Summary - Last 30 Days */}
          {adminDashboard.recentActivity && (
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Activity in Last 30 Days
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{adminDashboard.recentActivity.newApplications}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{adminDashboard.recentActivity.newReservations}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Reservations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{adminDashboard.recentActivity.newBookings}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{adminDashboard.recentActivity.newUsers}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{adminDashboard.recentActivity.newTravelers}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Travelers</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Admin Content Overview */}
      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && contentStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Content Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Events Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/events')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Events</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{contentStats.events.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{contentStats.events.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upcoming:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{contentStats.events.upcoming}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Featured:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{contentStats.events.featured}</span>
                </div>
              </div>
            </div>

            {/* Gallery Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Image className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/gallery')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Gallery</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Images:</span>
                  <span className="font-semibold text-foreground">{contentStats.gallery.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{contentStats.gallery.active}</span>
                </div>
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/services')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Services</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{contentStats.services.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{contentStats.services.active}</span>
                </div>
              </div>
            </div>

            {/* Testimonials Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <button
                  onClick={() => router.push('/admin/testimonials')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Manage →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Testimonials</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">View & moderate</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">→</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Admin Client Stats Overview */}
      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && clientStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Clients Overview</h2>
            <button
              onClick={() => router.push('/profile/clients')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              View All Clients
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{clientStats.total}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{clientStats.completed}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Paid</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{clientStats.paid}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{clientStats.pending}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Process Status Chart */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Process Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientStats.processStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientStats.processStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#22c55e', '#ef4444'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Status Chart */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientStats.paymentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Clients" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sex Distribution Chart */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientStats.sexData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientStats.sexData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#ec4899', '#8b5cf6'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* User Dashboard - Quick Actions */}
      {user.role === 'USER' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/profile/applications/new')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Plus className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold mb-1">New Application</h3>
              <p className="text-sm text-blue-100">Apply for study programs</p>
            </button>

            <button
              onClick={() => router.push('/profile/reservations')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Plane className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Book Flight/Hotel</h3>
              <p className="text-sm text-purple-100">Make new reservation</p>
            </button>

            <button
              onClick={() => router.push('/profile/bookings')}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Book Service</h3>
              <p className="text-sm text-emerald-100">Book tours & services</p>
            </button>
          </div>
        </motion.div>
      )}

      {/* User Dashboard - Stats Overview */}
      {user.role === 'USER' && userDashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Your Overview</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Applications Stats */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/applications')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View All →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Applications</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{userDashboard.applications.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draft:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{userDashboard.applications.stats.draft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{userDashboard.applications.stats.submitted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{userDashboard.applications.stats.approved}</span>
                </div>
              </div>
            </div>

            {/* Reservations Stats */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Plane className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/reservations')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View All →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Reservations</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{userDashboard.reservations.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{userDashboard.reservations.stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{userDashboard.reservations.stats.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{userDashboard.reservations.stats.completed}</span>
                </div>
              </div>
            </div>

            {/* Bookings Stats */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <button
                  onClick={() => router.push('/profile/bookings')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View All →
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Bookings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">{userDashboard.bookings.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{userDashboard.bookings.stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{userDashboard.bookings.stats.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{userDashboard.bookings.stats.completed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <button
                onClick={() => router.push('/profile/history')}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Recent Applications */}
              {userDashboard.applications.recent.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Recent Applications</h4>
                  {userDashboard.applications.recent.slice(0, 3).map((app: any) => (
                    <div
                      key={app.id}
                      onClick={() => router.push(`/profile/applications/${app.id}`)}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.programName}</p>
                          <p className="text-xs text-muted-foreground">{app.programCountry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          app.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          app.status === 'SUBMITTED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          app.status === 'DRAFT' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                        }`}>
                          {app.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Reservations */}
              {userDashboard.reservations.recent.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Recent Reservations</h4>
                  {userDashboard.reservations.recent.slice(0, 3).map((res: any) => (
                    <div
                      key={res.id}
                      onClick={() => router.push('/profile/reservations')}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Plane className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {res.reservationType === 'FLIGHT' && `${res.departureCity} → ${res.arrivalCity}`}
                            {res.reservationType === 'HOTEL' && `Hotel in ${res.hotelCity}`}
                            {res.reservationType === 'BOTH' && `Trip to ${res.arrivalCity || res.hotelCity}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {res.departureDate && new Date(res.departureDate).toLocaleDateString()}
                            {res.checkInDate && new Date(res.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        res.status === 'CONFIRMED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        res.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Bookings */}
              {userDashboard.bookings.recent.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Recent Bookings</h4>
                  {userDashboard.bookings.recent.slice(0, 3).map((booking: any) => (
                    <div
                      key={booking.id}
                      onClick={() => router.push('/profile/bookings')}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {booking.service?.title || booking.event?.title || 'Booking'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {userDashboard.applications.recent.length === 0 && 
               userDashboard.reservations.recent.length === 0 && 
               userDashboard.bookings.recent.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No recent activity yet</p>
                  <p className="text-sm">Start by creating an application or making a reservation!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
