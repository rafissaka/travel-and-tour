'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Traveler {
  id: string;
  firstName: string;
  middleName: string | null;
  surname: string;
  sex: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  passportNumber: string;
  workTitle: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  paymentAmount: string | null;
  paymentDate: string | null;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  processStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

const PROCESS_STATUS_OPTIONS = [
  { value: 'INQUIRY', label: 'Inquiry', color: 'bg-gray-500' },
  { value: 'DOCUMENTS_PENDING', label: 'Documents Pending', color: 'bg-yellow-500' },
  { value: 'DOCUMENTS_RECEIVED', label: 'Documents Received', color: 'bg-blue-500' },
  { value: 'DOCUMENTS_VERIFIED', label: 'Documents Verified', color: 'bg-green-500' },
  { value: 'PAYMENT_PENDING', label: 'Payment Pending', color: 'bg-orange-500' },
  { value: 'PAYMENT_PARTIAL', label: 'Payment Partial', color: 'bg-amber-500' },
  { value: 'PAYMENT_COMPLETE', label: 'Payment Complete', color: 'bg-emerald-500' },
  { value: 'VISA_PROCESSING', label: 'Visa Processing', color: 'bg-purple-500' },
  { value: 'VISA_APPROVED', label: 'Visa Approved', color: 'bg-green-600' },
  { value: 'VISA_REJECTED', label: 'Visa Rejected', color: 'bg-red-600' },
  { value: 'TRAVEL_ARRANGED', label: 'Travel Arranged', color: 'bg-blue-600' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-500' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-red-500' },
];

export default function TravelersPage() {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [filteredTravelers, setFilteredTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processStatusFilter, setProcessStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [placeOfBirthFilter, setPlaceOfBirthFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTraveler, setDeletingTraveler] = useState<Traveler | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    surname: '',
    sex: 'MALE',
    nationality: '',
    dateOfBirth: '',
    placeOfBirth: '',
    passportNumber: '',
    workTitle: '',
    email: '',
    phone: '',
    address: '',
    paymentAmount: '',
    paymentDate: '',
    paymentStatus: 'PENDING',
    processStatus: 'INQUIRY',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTravelers();
  }, []);

  useEffect(() => {
    filterTravelers();
  }, [travelers, searchQuery, processStatusFilter, paymentStatusFilter, sexFilter, nationalityFilter, placeOfBirthFilter]);

  // Close dropdown when page changes
  useEffect(() => {
    handleCloseDropdown();
  }, [currentPage]);

  // Update dropdown position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (dropdownOpen) {
        const button = buttonRefs.current[dropdownOpen];
        if (button) {
          const rect = button.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.right - 192,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dropdownOpen]);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/travelers');
      if (response.ok) {
        const data = await response.json();
        setTravelers(data);
      }
    } catch (error) {
      console.error('Error fetching travelers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTravelers = () => {
    let filtered = [...travelers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.firstName.toLowerCase().includes(query) ||
          t.surname.toLowerCase().includes(query) ||
          t.middleName?.toLowerCase().includes(query) ||
          t.email?.toLowerCase().includes(query) ||
          t.passportNumber.toLowerCase().includes(query) ||
          t.nationality.toLowerCase().includes(query) ||
          t.workTitle?.toLowerCase().includes(query)
      );
    }

    // Status filters
    if (processStatusFilter) {
      filtered = filtered.filter((t) => t.processStatus === processStatusFilter);
    }

    if (paymentStatusFilter) {
      filtered = filtered.filter((t) => t.paymentStatus === paymentStatusFilter);
    }

    if (sexFilter) {
      filtered = filtered.filter((t) => t.sex === sexFilter);
    }

    if (nationalityFilter) {
      filtered = filtered.filter((t) => t.nationality.toLowerCase().includes(nationalityFilter.toLowerCase()));
    }

    if (placeOfBirthFilter) {
      console.log('Place of birth filter:', placeOfBirthFilter);
      console.log('Sample places of birth:', filtered.slice(0, 3).map(t => t.placeOfBirth));
      filtered = filtered.filter((t) => {
        const matches = t.placeOfBirth.toLowerCase().includes(placeOfBirthFilter.toLowerCase());
        if (matches) console.log('Match found:', t.placeOfBirth);
        return matches;
      });
      console.log('Filtered count:', filtered.length);
    }

    setFilteredTravelers(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setProcessStatusFilter('');
    setPaymentStatusFilter('');
    setSexFilter('');
    setNationalityFilter('');
    setPlaceOfBirthFilter('');
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTravelers = filteredTravelers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTravelers.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProcessStatusBadge = (status: string) => {
    const statusConfig = PROCESS_STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span
        className={`px-2 py-1 text-xs font-medium text-white rounded-full ${
          statusConfig?.color || 'bg-gray-500'
        }`}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = PAYMENT_STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span
        className={`px-2 py-1 text-xs font-medium text-white rounded-full ${
          statusConfig?.color || 'bg-gray-500'
        }`}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const handleDeleteClick = (traveler: Traveler) => {
    setDeletingTraveler(traveler);
    setShowDeleteDialog(true);
    setDeleteConfirmName('');
    handleCloseDropdown();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTraveler) return;

    const fullName = `${deletingTraveler.firstName} ${deletingTraveler.middleName || ''} ${deletingTraveler.surname}`.replace(/\s+/g, ' ').trim();

    if (deleteConfirmName.trim() !== fullName) {
      alert('The name you entered does not match. Please type the full name exactly as shown.');
      return;
    }

    try {
      const response = await fetch(`/api/travelers/${deletingTraveler.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeletingTraveler(null);
        setDeleteConfirmName('');
        fetchTravelers();
      } else {
        alert('Failed to delete traveler');
      }
    } catch (error) {
      console.error('Error deleting traveler:', error);
      alert('An error occurred while deleting the traveler');
    }
  };

  const handleOpenDropdown = (travelerId: string) => {
    const button = buttonRefs.current[travelerId];
    if (button) {
      const rect = button.getBoundingClientRect();
      const position = {
        top: rect.bottom + 4, // Use viewport-relative position, not absolute
        left: rect.right - 192, // 192px is the dropdown width (w-48)
      };
      console.log('Opening dropdown for:', travelerId, 'Position:', position, 'Button rect:', rect);
      setDropdownOpen(travelerId);
      setDropdownPosition(position);
    } else {
      console.error('Button ref not found for:', travelerId);
    }
  };

  const handleCloseDropdown = () => {
    setDropdownOpen(null);
    setDropdownPosition(null);
  };

  const handleView = (traveler: Traveler) => {
    setSelectedTraveler(traveler);
    setShowModal(true);
    handleCloseDropdown();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      surname: '',
      sex: 'MALE',
      nationality: '',
      dateOfBirth: '',
      placeOfBirth: '',
      passportNumber: '',
      workTitle: '',
      email: '',
      phone: '',
      address: '',
      paymentAmount: '',
      paymentDate: '',
      paymentStatus: 'PENDING',
      processStatus: 'INQUIRY',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/travelers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchTravelers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create traveler');
      }
    } catch (error) {
      console.error('Error creating traveler:', error);
      alert('An error occurred while creating the traveler');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (traveler: Traveler) => {
    setEditingTraveler(traveler);
    setFormData({
      firstName: traveler.firstName,
      middleName: traveler.middleName || '',
      surname: traveler.surname,
      sex: traveler.sex,
      nationality: traveler.nationality,
      dateOfBirth: traveler.dateOfBirth.split('T')[0],
      placeOfBirth: traveler.placeOfBirth,
      passportNumber: traveler.passportNumber,
      workTitle: traveler.workTitle || '',
      email: traveler.email || '',
      phone: traveler.phone || '',
      address: traveler.address || '',
      paymentAmount: traveler.paymentAmount || '',
      paymentDate: traveler.paymentDate ? traveler.paymentDate.split('T')[0] : '',
      paymentStatus: traveler.paymentStatus,
      processStatus: traveler.processStatus,
      notes: traveler.notes || '',
    });
    setShowEditModal(true);
    handleCloseDropdown();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraveler) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/travelers/${editingTraveler.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingTraveler(null);
        resetForm();
        fetchTravelers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update traveler');
      }
    } catch (error) {
      console.error('Error updating traveler:', error);
      alert('An error occurred while updating the traveler');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = filteredTravelers.map((traveler) => ({
      'First Name': traveler.firstName,
      'Middle Name': traveler.middleName || '',
      'Surname': traveler.surname,
      'Sex': traveler.sex,
      'Date of Birth': formatDate(traveler.dateOfBirth),
      'Place of Birth': traveler.placeOfBirth,
      'Nationality': traveler.nationality,
      'Passport Number': traveler.passportNumber,
      'Work Title': traveler.workTitle || '',
      'Email': traveler.email || '',
      'Phone': traveler.phone || '',
      'Address': traveler.address || '',
      'Payment Amount': traveler.paymentAmount || '',
      'Payment Date': traveler.paymentDate ? formatDate(traveler.paymentDate) : '',
      'Payment Status': traveler.paymentStatus,
      'Process Status': PROCESS_STATUS_OPTIONS.find(s => s.value === traveler.processStatus)?.label || traveler.processStatus,
      'Notes': traveler.notes || '',
      'Created By': `${traveler.createdBy.firstName || ''} ${traveler.createdBy.lastName || ''}`.trim(),
      'Created At': formatDate(traveler.createdAt),
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Middle Name
      { wch: 15 }, // Surname
      { wch: 10 }, // Sex
      { wch: 15 }, // Date of Birth
      { wch: 20 }, // Place of Birth
      { wch: 15 }, // Nationality
      { wch: 15 }, // Passport Number
      { wch: 20 }, // Work Title
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 15 }, // Payment Amount
      { wch: 15 }, // Payment Date
      { wch: 15 }, // Payment Status
      { wch: 20 }, // Process Status
      { wch: 30 }, // Notes
      { wch: 20 }, // Created By
      { wch: 15 }, // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Clients_Export_${date}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Clients Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track travelers who have contacted us
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportToExcel}
            disabled={filteredTravelers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, passport, work title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border"
          >
            {/* Process Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Process Status
              </label>
              <select
                value={processStatusFilter}
                onChange={(e) => setProcessStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                {PROCESS_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Payments</option>
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sex Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sex</label>
              <select
                value={sexFilter}
                onChange={(e) => setSexFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Nationality Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nationality</label>
              <input
                type="text"
                placeholder="Filter by nationality..."
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Place of Birth Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Place of Birth</label>
              <input
                type="text"
                placeholder="Filter by place of birth..."
                value={placeOfBirthFilter}
                onChange={(e) => setPlaceOfBirthFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Clear Filters */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">{travelers.length}</div>
          <div className="text-sm text-muted-foreground">Total Clients</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">
            {travelers.filter((t) => t.processStatus === 'COMPLETED').length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">
            {travelers.filter((t) => t.paymentStatus === 'PAID').length}
          </div>
          <div className="text-sm text-muted-foreground">Paid</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">
            {travelers.filter((t) => ['INQUIRY', 'DOCUMENTS_PENDING', 'PAYMENT_PENDING'].includes(t.processStatus)).length}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden relative">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">
                  Passport
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[150px]">
                  Work Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[150px]">
                  Process Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px] sticky right-0 bg-muted/50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : currentTravelers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No travelers found
                  </td>
                </tr>
              ) : (
                currentTravelers.map((traveler) => (
                  <tr key={traveler.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {traveler.firstName} {traveler.middleName || ''} {traveler.surname}
                      </div>
                      <div className="text-sm text-muted-foreground">{traveler.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      {traveler.passportNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      {traveler.workTitle || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getProcessStatusBadge(traveler.processStatus)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(traveler.paymentStatus)}
                        {traveler.paymentAmount && (
                          <div className="text-sm text-muted-foreground">
                            ${traveler.paymentAmount}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(traveler.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right sticky right-0 bg-card">
                      <button
                        ref={(el) => {
                          buttonRefs.current[traveler.id] = el;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dropdownOpen === traveler.id) {
                            handleCloseDropdown();
                          } else {
                            handleOpenDropdown(traveler.id);
                          }
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTravelers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card rounded-xl border border-border p-4 shadow-sm relative z-[60] mb-20">
          <div className="text-sm text-muted-foreground font-medium">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTravelers.length)} of {filteredTravelers.length} clients
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg transition-colors font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary text-white shadow-md'
                            : 'border-2 border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fixed position dropdown menu */}
      {dropdownOpen && dropdownPosition && (() => {
        const traveler = travelers.find(t => t.id === dropdownOpen);
        console.log('Rendering dropdown:', { dropdownOpen, dropdownPosition, traveler: traveler?.firstName });
        if (!traveler) {
          console.error('Traveler not found for dropdown:', dropdownOpen);
          return null;
        }

        return (
          <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div
              className="fixed inset-0 z-[999]"
              onClick={handleCloseDropdown}
            />
            {/* Dropdown menu */}
            <div
              className="fixed w-48 bg-card border border-border rounded-lg shadow-xl z-[1000]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <button
                onClick={() => handleView(traveler)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => handleEdit(traveler)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(traveler)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        );
      })()}

      {/* View Modal */}
      {showModal && selectedTraveler && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Client Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">First Name</label>
                    <p className="text-foreground font-medium">{selectedTraveler.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Middle Name</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.middleName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Surname</label>
                    <p className="text-foreground font-medium">{selectedTraveler.surname}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Sex</label>
                    <p className="text-foreground font-medium">{selectedTraveler.sex}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                    <p className="text-foreground font-medium">
                      {formatDate(selectedTraveler.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Place of Birth</label>
                    <p className="text-foreground font-medium">{selectedTraveler.placeOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Nationality</label>
                    <p className="text-foreground font-medium">{selectedTraveler.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Passport Number</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.passportNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Work Title</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.workTitle || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Address</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment & Process Status */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Payment & Process Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Process Status</label>
                    <div className="mt-1">{getProcessStatusBadge(selectedTraveler.processStatus)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Payment Status</label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedTraveler.paymentStatus)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Payment Amount</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.paymentAmount ? `$${selectedTraveler.paymentAmount}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Payment Date</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.paymentDate ? formatDate(selectedTraveler.paymentDate) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTraveler.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Notes</h3>
                  <p className="text-foreground whitespace-pre-wrap">{selectedTraveler.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Created By</label>
                    <p className="text-foreground font-medium">
                      {selectedTraveler.createdBy.firstName} {selectedTraveler.createdBy.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Created At</label>
                    <p className="text-foreground font-medium">
                      {formatDate(selectedTraveler.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedTraveler) {
                    setShowModal(false);
                    handleEdit(selectedTraveler);
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Edit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border max-w-4xl w-full my-8"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Add New Client</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Sex <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Place of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Passport Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Work Title
                      </label>
                      <input
                        type="text"
                        name="workTitle"
                        value={formData.workTitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment & Process Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Payment & Process Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Process Status
                      </label>
                      <select
                        name="processStatus"
                        value={formData.processStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {PROCESS_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Amount
                      </label>
                      <input
                        type="number"
                        name="paymentAmount"
                        value={formData.paymentAmount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Add any additional notes or comments..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingTraveler && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border max-w-4xl w-full my-8"
          >
            <form onSubmit={handleUpdate}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Edit Client</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTraveler(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content - Same as Add Modal */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Sex <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Place of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Passport Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Work Title
                      </label>
                      <input
                        type="text"
                        name="workTitle"
                        value={formData.workTitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment & Process Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Payment & Process Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Process Status
                      </label>
                      <select
                        name="processStatus"
                        value={formData.processStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {PROCESS_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Amount
                      </label>
                      <input
                        type="number"
                        name="paymentAmount"
                        value={formData.paymentAmount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Add any additional notes or comments..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTraveler(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Client'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingTraveler && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Delete Client
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete the client record.
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="text-sm text-muted-foreground mb-1">You are about to delete:</div>
              <div className="font-semibold text-foreground text-lg">
                {deletingTraveler.firstName} {deletingTraveler.middleName || ''} {deletingTraveler.surname}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Passport: {deletingTraveler.passportNumber}
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                To confirm, type the full name exactly as shown above:
              </label>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type full name here"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Expected: {deletingTraveler.firstName} {deletingTraveler.middleName || ''} {deletingTraveler.surname}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingTraveler(null);
                  setDeleteConfirmName('');
                }}
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmName.trim() !== `${deletingTraveler.firstName} ${deletingTraveler.middleName || ''} ${deletingTraveler.surname}`.replace(/\s+/g, ' ').trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
