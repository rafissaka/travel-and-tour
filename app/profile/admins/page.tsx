'use client';

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Search, Filter, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import CreateAdminModal from './CreateAdminModal';
import AdminsTable from './AdminsTable';

export default function AdminsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.users);
      } else {
        toast.error('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('An error occurred while fetching admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdminCreated = () => {
    fetchAdmins();
    setIsCreateModalOpen(false);
  };

  const filteredAdmins = admins.filter((admin: any) => {
    const matchesSearch =
      admin.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || admin.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Management</h1>
            <p className="text-sm text-muted-foreground">Manage admin users and permissions</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          <span>Create Admin</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAdmins}
            disabled={isLoading}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-visible min-h-[400px]">
        <AdminsTable admins={filteredAdmins} isLoading={isLoading} onRefresh={fetchAdmins} />
      </div>

      {/* Create Admin Modal */}
      {isCreateModalOpen && (
        <CreateAdminModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleAdminCreated}
        />
      )}
    </div>
  );
}
