'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, UserX, UserCheck, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
}

interface AdminsTableProps {
  admins: Admin[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AdminsTable({ admins, isLoading, onRefresh }: AdminsTableProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [selectedAdmins, setSelectedAdmins] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusColor = (lastLogin: string | null) => {
    if (!lastLogin) return 'bg-gray-500';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / 3600000;

    if (diffHours < 1) return 'bg-green-500';
    if (diffHours < 24) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const handleToggleActive = async (adminId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${adminId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        onRefresh();
      } else {
        toast.error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Admin deleted successfully');
        onRefresh();
      } else {
        toast.error('Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('An error occurred');
    }
  };

  const handleOpenDropdown = (adminId: string) => {
    const button = buttonRefs.current[adminId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right + window.scrollX,
      });
      setSelectedAdmin(adminId);
    }
  };

  const handleCloseDropdown = () => {
    setSelectedAdmin(null);
    setDropdownPosition(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdmins(new Set(admins.map(admin => admin.id)));
    } else {
      setSelectedAdmins(new Set());
    }
  };

  const handleSelectAdmin = (adminId: string, checked: boolean) => {
    const newSelected = new Set(selectedAdmins);
    if (checked) {
      newSelected.add(adminId);
    } else {
      newSelected.delete(adminId);
    }
    setSelectedAdmins(newSelected);
  };

  const handleBulkActivate = async () => {
    try {
      const promises = Array.from(selectedAdmins).map(adminId =>
        fetch(`/api/admin/users/${adminId}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedAdmins.size} admin(s) activated successfully`);
      setSelectedAdmins(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error bulk activating:', error);
      toast.error('An error occurred');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const promises = Array.from(selectedAdmins).map(adminId =>
        fetch(`/api/admin/users/${adminId}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedAdmins.size} admin(s) deactivated successfully`);
      setSelectedAdmins(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error bulk deactivating:', error);
      toast.error('An error occurred');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedAdmins.size} admin(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const promises = Array.from(selectedAdmins).map(adminId =>
        fetch(`/api/admin/users/${adminId}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(promises);
      toast.success(`${selectedAdmins.size} admin(s) deleted successfully`);
      setSelectedAdmins(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('An error occurred');
    }
  };

  const isAllSelected = admins.length > 0 && selectedAdmins.size === admins.length;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading admins...</p>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <p className="text-muted-foreground">No admins found</p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedAdmins.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {selectedAdmins.size} admin(s) selected
            </span>
            <button
              onClick={() => setSelectedAdmins(new Set())}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              <UserCheck className="w-4 h-4 inline mr-1" />
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4 inline mr-1" />
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border relative">
        <div className="overflow-x-auto overflow-y-visible scrollbar-hide">
          <table className="w-full min-w-max relative">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Last Login
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Logins
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Joined
              </th>
              <th className="px-4 sm:px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-muted/30 transition-colors relative">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={selectedAdmins.has(admin.id)}
                    onChange={(e) => handleSelectAdmin(admin.id, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                      {admin.firstName[0]}{admin.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {admin.firstName} {admin.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      admin.role === 'SUPER_ADMIN'
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      admin.isActive
                        ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        admin.isActive ? getStatusColor(admin.lastLoginAt) : 'bg-red-500'
                      }`}
                    ></div>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{formatRelativeTime(admin.lastLoginAt)}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {admin.loginCount}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(admin.createdAt)}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    ref={(el) => {
                      buttonRefs.current[admin.id] = el;
                    }}
                    onClick={() => handleOpenDropdown(admin.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fixed position dropdown menu */}
      {selectedAdmin && dropdownPosition && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={handleCloseDropdown}
          ></div>
          {/* Dropdown menu */}
          <div
            className="fixed w-48 bg-card border border-border rounded-lg shadow-xl z-[1000]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
          >
            <button
              onClick={() => {
                const admin = admins.find(a => a.id === selectedAdmin);
                if (admin) {
                  handleToggleActive(admin.id, admin.isActive);
                }
                handleCloseDropdown();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
            >
              {admins.find(a => a.id === selectedAdmin)?.isActive ? (
                <>
                  <UserX className="w-4 h-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Activate
                </>
              )}
            </button>
            <button
              onClick={() => {
                handleDelete(selectedAdmin);
                handleCloseDropdown();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors rounded-b-lg"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
}
