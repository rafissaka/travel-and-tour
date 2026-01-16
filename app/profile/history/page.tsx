'use client';

import { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Filter,
  Search,
  BookOpen,
  FileText,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Activity as ActivityIcon,
  Plane,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '@/app/components/PageLoader';

interface Activity {
  id: string;
  type: 'booking' | 'application' | 'account' | 'reservation';
  action: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface Stats {
  total: number;
  bookings: number;
  applications: number;
  reservations: number;
  account: number;
}

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, bookings: 0, applications: 0, reservations: 0, account: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [filterType]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const url = filterType === 'all' 
        ? '/api/activities' 
        : `/api/activities?type=${filterType}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setStats(data.stats);
      } else {
        toast.error('Failed to load activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return BookOpen;
      case 'application':
        return FileText;
      case 'reservation':
        return Plane;
      case 'account':
        return User;
      default:
        return ActivityIcon;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'cancelled':
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'from-blue-500 to-cyan-500';
      case 'application':
        return 'from-purple-500 to-pink-500';
      case 'reservation':
        return 'from-orange-500 to-red-500';
      case 'account':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const groupActivitiesByDate = (activities: Activity[]) => {
    const groups: { [key: string]: Activity[] } = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let label: string;
      if (date.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: ActivityIcon },
    { value: 'booking', label: 'Bookings', icon: BookOpen },
    { value: 'application', label: 'Applications', icon: FileText },
    { value: 'reservation', label: 'Reservations', icon: Plane },
    { value: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-white" />
          </div>
          Activity History
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Track all your account activities and interactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary to-accent text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.total}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Activities</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border-2 border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-3xl font-bold text-foreground">{stats.bookings}</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Bookings</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-2 border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span className="text-3xl font-bold text-foreground">{stats.applications}</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Applications</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border-2 border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Plane className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <span className="text-3xl font-bold text-foreground">{stats.reservations}</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Reservations</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border-2 border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <User className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="text-3xl font-bold text-foreground">{stats.account}</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Account Events</h3>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === option.value
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-background border-2 border-border text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Timeline
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <PageLoader text="Loading activity history..." />
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Activities Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Your activities will appear here once you start using the platform'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    {date}
                  </h3>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {dateActivities.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type);
                        const StatusIcon = getStatusIcon(activity.status);

                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-3 sm:gap-4 group"
                          >
                            {/* Timeline Line */}
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${getTypeColor(activity.type)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              {index < dateActivities.length - 1 && (
                                <div className="w-0.5 h-full bg-border mt-2" />
                              )}
                            </div>

                            {/* Activity Card */}
                            <div className="flex-1 pb-4 min-w-0">
                              <div className="bg-background border-2 border-border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all group-hover:border-primary">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground text-base sm:text-lg">
                                      {activity.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                      {activity.description}
                                    </p>
                                  </div>
                                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start ${getStatusColor(activity.status)}`}>
                                    <StatusIcon className="w-3 h-3 flex-shrink-0" />
                                    <span>{activity.status}</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1 whitespace-nowrap">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    <span>{new Date(activity.timestamp).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}</span>
                                  </div>
                                  <div className="flex items-center gap-1 whitespace-nowrap">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span>{new Date(activity.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}</span>
                                  </div>
                                  <div className="px-2 py-0.5 bg-muted rounded text-foreground font-medium capitalize whitespace-nowrap">
                                    {activity.type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
