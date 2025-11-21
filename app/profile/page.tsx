'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, Calendar, Shield, Edit, Sun, Moon, Monitor, Users, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/app/providers/ThemeProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientStats, setClientStats] = useState<any>(null);

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
            <User className="w-5 h-5 text-primary mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">User ID</p>
              <p className="text-xs sm:text-sm text-foreground font-mono break-all">{user.id}</p>
            </div>
          </div>

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
