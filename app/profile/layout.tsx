'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Settings,
  BookOpen,
  Heart,
  History,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Image,
  Calendar,
  CalendarCheck,
  Briefcase,
  Shield,
  Star,
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/profile', icon: LayoutDashboard, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Gallery', href: '/profile/gallery', icon: Image, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Events', href: '/profile/events', icon: Calendar, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Appointments', href: '/profile/appointments', icon: CalendarCheck, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Services', href: '/profile/services', icon: Briefcase, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Admins', href: '/profile/admins', icon: Shield, roles: ['SUPER_ADMIN'] },
  { name: 'Testimonials', href: '/profile/testimonials', icon: Star, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'My Bookings', href: '/profile/bookings', icon: BookOpen, roles: ['USER'] },
  { name: 'Wishlist', href: '/profile/wishlist', icon: Heart, roles: ['USER'] },
  { name: 'Activity History', href: '/profile/history', icon: History, roles: ['USER'] },
  { name: 'Settings', href: '/profile/settings', icon: Settings, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('USER');
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoadingRole(false);
      }
    };

    fetchUserRole();
  }, []);

  // Filter sidebar links based on user role
  const filteredLinks = sidebarLinks.filter(link => link.roles.includes(userRole));

  // Show loading state while fetching role to prevent flash of wrong sidebar
  if (isLoadingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="h-24 flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Dashboard</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
              <Home className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-28 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'text-foreground hover:bg-muted'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? link.name : ''}
              >
                <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} shrink-0`} />
                {!isCollapsed && <span className="font-medium">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to Home Link */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <Home className="w-5 h-5 shrink-0" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        )}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Home Link */}
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 lg:pt-6 min-h-screen ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
