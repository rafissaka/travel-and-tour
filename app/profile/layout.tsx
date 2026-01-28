'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Settings,
  BookOpen,
  History,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Image,
  Calendar,
  Briefcase,
  Shield,
  Star,
  Users,
  FileText,
  GraduationCap,
  Plane,
  MessageSquare,
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import NotificationToastListener from '../components/NotificationToastListener';
import NotificationListener from '../components/NotificationListener';
import PageLoader from '../components/PageLoader';

const sidebarLinks = [
  { name: 'Dashboard', href: '/profile', icon: Home, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Gallery', href: '/profile/gallery', icon: Image, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Events', href: '/profile/events', icon: Calendar, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Bookings', href: '/profile/bookings', icon: BookOpen, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Chats', href: '/profile/chats', icon: MessageSquare, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Services', href: '/profile/services', icon: Briefcase, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Programs', href: '/profile/programs', icon: GraduationCap, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Clients', href: '/profile/clients', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Admins', href: '/profile/admins', icon: Shield, roles: ['SUPER_ADMIN'] },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'My Bookings', href: '/profile/bookings', icon: BookOpen, roles: ['USER'] },
  { name: 'Applications', href: '/profile/applications', icon: FileText, roles: ['USER'] },
  { name: 'Reservations', href: '/profile/reservations', icon: Plane, roles: ['USER'] },
  { name: 'Testimonials', href: '/profile/testimonials', icon: Star, roles: ['USER'] },
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
    return <PageLoader text="Loading profile..." fullScreen />;
  }

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-background">
      {/* Notification Toast Listener - Admin Only */}
      <NotificationListener />
      {isAdmin && <NotificationToastListener />}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Home</h1>
          <div className="flex items-center gap-2">
            {isAdmin && <NotificationBell />}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Toggle */}
          <div className="h-24 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-foreground">Home</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/" className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto hover:opacity-80 transition-opacity">
                <Home className="w-6 h-6 text-white" />
              </Link>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-28 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm z-10"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4 border-t border-border flex-shrink-0 bg-card">
            <button
              onClick={async () => {
                const response = await fetch('/api/auth/logout', { method: 'POST' });
                if (response.ok) {
                  window.location.href = '/';
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Home</span>
            </Link>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4 border-t border-border flex-shrink-0 bg-card">
            <button
              onClick={async () => {
                const response = await fetch('/api/auth/logout', { method: 'POST' });
                if (response.ok) {
                  window.location.href = '/';
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Header - Admin Only */}
      {isAdmin && (
        <div className={`hidden lg:block fixed top-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border transition-all duration-300 ${
          isCollapsed ? 'left-20' : 'left-64'
        }`}>
          <div className="flex items-center justify-end px-6 py-4">
            <NotificationBell />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 ${isAdmin ? 'lg:pt-20' : 'lg:pt-6'} min-h-screen ${
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
