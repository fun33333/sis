"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions";
import { getFilteredTeachers, getAllCampuses } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teachers List</h1>
        <p className="text-gray-600">
          Showing {teachers.length} of {totalCount} teachers
        </p>
      </div>

       {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                           </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects/Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.full_name}
                           </div>
                      <div className="text-sm text-gray-500">
                        {teacher.email}
                                 </div>
                               </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.employee_code || 'N/A'}
                           </div>
                    <div className="text-sm text-gray-500">
                      {teacher.shift}
                             </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">Subjects:</div>
                      <div className="text-gray-600">{teacher.current_subjects || 'N/A'}</div>
                             </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <div className="font-medium">Classes:</div>
                      <div>{teacher.current_classes_taught || 'N/A'}</div>
                           </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.campus_name || 'N/A'}
                             </div>
                    {teacher.coordinator_names && teacher.coordinator_names.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Coord: {teacher.coordinator_names.join(', ')}
                           </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.is_currently_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.is_currently_active ? 'Active' : 'Inactive'}
                      </span>
                      {teacher.is_class_teacher && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Class Teacher
                        </span>
                             )}
                           </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/teachers/profile?id=${teacher.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Profile
                    </button>
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