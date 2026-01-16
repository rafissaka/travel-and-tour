'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Clock, Settings, Bell, Shield, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    CartesianGrid,
} from 'recharts';
import { Users, FileText, TrendingUp, Calendar as CalendarIcon, DollarSign } from 'lucide-react'; // Renamed local imports to avoid conflict if any, though Calendar is already imported as Lucide icon. Actually Calendar is already imported from lucide-react. I will reuse it.


interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock data for charts
    const activityData = [
        { name: 'Mon', visits: 4 },
        { name: 'Tue', visits: 3 },
        { name: 'Wed', visits: 7 },
        { name: 'Thu', visits: 2 },
        { name: 'Fri', visits: 6 },
        { name: 'Sat', visits: 8 },
        { name: 'Sun', visits: 5 },
    ];

    const bookingStatusData = [
        { name: 'Upcoming', value: 2, color: '#f59e0b' }, // amber-500
        { name: 'Completed', value: 5, color: '#10b981' }, // emerald-500
        { name: 'Cancelled', value: 1, color: '#ef4444' }, // red-500
    ];

    const [adminStats, setAdminStats] = useState<{
        stats: {
            totalUsers: number;
            totalApplications: number;
            activeEvents: number;
            totalGalleryImages: number;
        };
        charts: {
            userGrowth: { name: string; users: number }[];
            applicationTrends: { name: string; apps: number }[];
        };
    } | null>(null);


    // Mock data for Admin charts removed - using adminStats state

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);

                    // If Admin, fetch admin stats
                    if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
                        fetchAdminStats();
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAdminStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setAdminStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch admin stats", e);
            }
        };

        fetchUser();
    }, []);


    if (loading) {
        return <PageLoader text="Loading dashboard..." />;
    }

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const dashboardCards = [
        {
            title: 'My Profile',
            description: 'View and edit your personal information',
            icon: User,
            href: '/profile/settings',
            color: 'bg-blue-500',
        },
        {
            title: 'My Bookings',
            description: 'Manage your travel and event bookings',
            icon: BookOpen,
            href: '/profile/bookings',
            color: 'bg-green-500',
        },
        {
            title: 'Activity History',
            description: 'View your past interactions and logs',
            icon: Clock,
            href: '/profile/history',
            color: 'bg-orange-500',
        },
        {
            title: 'Notifications',
            description: 'Check your latest updates and alerts',
            icon: Bell,
            href: '/profile/notifications',
            color: 'bg-purple-500',
        },
    ];

    // Add Admin specific cards
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        dashboardCards.push({
            title: 'Event Management',
            description: 'Create and manage events',
            icon: Calendar,
            href: '/profile/events',
            color: 'bg-pink-500',
        });

        if (user?.role === 'SUPER_ADMIN') {
            dashboardCards.push({
                title: 'Admin Management',
                description: 'Manage system administrators',
                icon: Shield,
                href: '/profile/admins',
                color: 'bg-red-500',
            });
        }
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-card border border-border rounded-2xl p-8 shadow-sm"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {getTimeGreeting()}, {user?.firstName || 'User'}!
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Welcome to your personal dashboard. Here's an overview of your account.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                        <Shield className="w-4 h-4" />
                        {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Administrator' : 'Standard User'}
                    </div>
                </div>
            </motion.div>

            {/* Admin Dashboard Section */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && adminStats && (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-blue-500/10"><User className="w-6 h-6 text-blue-500" /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{adminStats.stats.totalUsers}</h3>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-purple-500/10"><FileText className="w-6 h-6 text-purple-500" /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{adminStats.stats.totalApplications}</h3>
                            <p className="text-sm text-muted-foreground">Total Applications</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-pink-500/10"><Calendar className="w-6 h-6 text-pink-500" /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{adminStats.stats.activeEvents}</h3>
                            <p className="text-sm text-muted-foreground">Active Events</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-green-500/10"><Activity className="w-6 h-6 text-green-500" /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{adminStats.stats.totalGalleryImages}</h3>
                            <p className="text-sm text-muted-foreground">Gallery Images</p>
                        </motion.div>
                    </div>

                    {/* Admin Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Growth Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card border border-border rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">User Growth</h3>
                                    <p className="text-sm text-muted-foreground">New user registrations (Last 6 Months)</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={adminStats.charts.userGrowth}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Application Trends Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card border border-border rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Application Trends</h3>
                                    <p className="text-sm text-muted-foreground">Daily application submissions (Last 7 Days)</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adminStats.charts.applicationTrends}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                        />
                                        <Bar dataKey="apps" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Analytics Section - Only for Standard Users */}
            {
                user?.role === 'USER' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Activity Chart */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Weekly Activity</h3>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activityData}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                        />
                                        <Bar
                                            dataKey="visits"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Booking Status Chart */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-green-500" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Booking Status</h3>
                            </div>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {bookingStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Custom Legend */}
                                <div className="ml-8 space-y-2">
                                    {bookingStatusData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {dashboardCards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link
                            href={card.href}
                            className="block h-full group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-10 rounded-bl-full transform group-hover:scale-110 transition-transform duration-500`} />

                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {card.description}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div >
    );
}
