"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions";
import { getFilteredTeachers, getAllCampuses } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, Edit, MoreVertical, User, Mail, Phone, GraduationCap, MapPin, Calendar, Award } from 'lucide-react';

interface Teacher {
  id: number;
  full_name: string;
  employee_code: string;
  email: string;
  contact_number: string;
  current_subjects: string;
  current_classes_taught: string;
  shift: string;
  is_currently_active: boolean;
  is_class_teacher: boolean;
  campus_name: string;
  coordinator_names: string[];
  classroom_name: string;
  joining_date: string;
  total_experience_years: number;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  results: Teacher[];
}

export default function TeacherListPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    current_campus: "",
    shift: "",
    is_currently_active: "",
    is_class_teacher: "",
    current_subjects: "",
    ordering: "-joining_date"
  });
  
  // User role and campus info
  const [userRole, setUserRole] = useState<string>("");
  const [userCampus, setUserCampus] = useState<string>("");
  const [campuses, setCampuses] = useState<any[]>([]);
  
  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeUserData();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, pageSize, filters, searchQuery]);

  const initializeUserData = async () => {
    const role = getCurrentUserRole();
    setUserRole(role);
    
    // Get user campus info
          const user = getCurrentUser() as any;
          if (user?.campus?.campus_name) {
            setUserCampus(user.campus.campus_name);
    }
    
    // Fetch campuses for filter dropdown
    try {
      const campusesData = await getAllCampuses();
      setCampuses(Array.isArray(campusesData) ? campusesData : []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
        current_campus: filters.current_campus ? parseInt(filters.current_campus) : undefined,
        shift: filters.shift || undefined,
        is_currently_active: filters.is_currently_active ? filters.is_currently_active === 'true' : undefined,
        is_class_teacher: filters.is_class_teacher ? filters.is_class_teacher === 'true' : undefined,
        current_subjects: filters.current_subjects || undefined,
        ordering: filters.ordering
      };

      const response: PaginationInfo = await getFilteredTeachers(params);
      
      setTeachers(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
      
      } catch (err: any) {
      console.error("Error fetching teachers:", err);
      setError(err.message || "Failed to load teachers");
      } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      fetchTeachers();
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      current_campus: "",
      shift: "",
      is_currently_active: "",
      is_class_teacher: "",
      current_subjects: "",
      ordering: "-joining_date"
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading && teachers.length === 0) {
    return <LoadingSpinner message="Loading teachers..." fullScreen />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#274c77' }}>
          Teachers List
        </h1>
        <p className="text-gray-600">
          Showing {teachers.length} of {totalCount} teachers
        </p>
      </div>

       {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6" style={{ borderColor: '#a3cef1' }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2" style={{ color: '#274c77' }}>
            <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
              <span className="text-white text-xs font-bold">🔍</span>
            </div>
            <span>Search & Filters</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, code, email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
               />
             </div>
             
          {/* Campus Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
                 <select
              value={filters.current_campus}
              onChange={(e) => handleFilterChange('current_campus', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Campuses</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.campus_name || campus.name}
                </option>
              ))}
                 </select>
               </div>
               
          {/* Shift Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
                 <select
              value={filters.shift}
              onChange={(e) => handleFilterChange('shift', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
                 </select>
               </div>
               
          {/* Status Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
                 <select
              value={filters.is_currently_active}
              onChange={(e) => handleFilterChange('is_currently_active', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
                 </select>
               </div>
             </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Class Teacher Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.is_class_teacher}
              onChange={(e) => handleFilterChange('is_class_teacher', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Roles</option>
              <option value="true">Class Teacher</option>
              <option value="false">Subject Teacher</option>
            </select>
           </div>

          {/* Subjects Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects
            </label>
            <input
              type="text"
              placeholder="Filter by subjects..."
              value={filters.current_subjects}
              onChange={(e) => handleFilterChange('current_subjects', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            />
            </div>

          {/* Ordering */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="-joining_date">Joining Date (Newest)</option>
              <option value="joining_date">Joining Date (Oldest)</option>
              <option value="full_name">Name (A-Z)</option>
              <option value="-full_name">Name (Z-A)</option>
              <option value="-total_experience_years">Experience (High to Low)</option>
              <option value="total_experience_years">Experience (Low to High)</option>
            </select>
                             </div>
                           </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ borderColor: '#a3cef1' }}
          >
            <span className="mr-2">🔄</span>
            Clear Filters
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 bg-white shadow-sm"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ borderColor: '#a3cef1' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#274c77' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Teacher</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Employee Code</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Subjects/Classes</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Campus</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <MoreVertical className="h-4 w-4" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : ''}`} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#e7ecef' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{teacher.full_name}</span>
                            {teacher.is_class_teacher && (
                              <Award className="h-4 w-4 text-yellow-500" />
                            )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{teacher.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
                        <span className="text-xs font-bold text-white">
                          {teacher.employee_code ? teacher.employee_code.slice(-2) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.employee_code || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="capitalize">{teacher.shift}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">Subjects:</div>
                          <div className="text-gray-600 truncate max-w-xs">{teacher.current_subjects || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">Classes:</div>
                          <div className="text-gray-600 truncate max-w-xs">{teacher.current_classes_taught || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" style={{ color: '#6096ba' }} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.campus_name || 'N/A'}
                        </div>
                        {teacher.coordinator_names && teacher.coordinator_names.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Coord: {teacher.coordinator_names.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        teacher.is_currently_active 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          teacher.is_currently_active ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {teacher.is_currently_active ? 'Active' : 'Inactive'}
                      </span>
                      {teacher.is_class_teacher && (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          <Award className="h-3 w-3 mr-1" />
                          Class Teacher
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/teachers/profile?id=${teacher.id}`)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: '#6096ba' }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ borderColor: '#6096ba', color: '#274c77' }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
              </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{totalCount}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}