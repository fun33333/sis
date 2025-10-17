"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions";
import { getFilteredStudents, getAllCampuses } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, Edit, MoreVertical, User, Mail, GraduationCap, MapPin, Calendar, Award } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  student_id: string;
  student_code: string;
  gr_no: string;
  current_grade: string;
  section: string;
  current_state: string;
  gender: string;
  campus_name: string;
  classroom_name: string;
  father_name: string;
  contact_number: string;
  email: string;
  coordinator_names: string[];
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}

export default function StudentListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
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
    campus: "",
    current_grade: "",
    section: "",
    current_state: "",
    gender: "",
    shift: "",
    ordering: "-created_at"
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
    fetchStudents();
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

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
        campus: filters.campus ? parseInt(filters.campus) : undefined,
        current_grade: filters.current_grade || undefined,
        section: filters.section || undefined,
        current_state: filters.current_state || undefined,
        gender: filters.gender || undefined,
        shift: filters.shift || undefined,
        ordering: filters.ordering
      };

      const response: PaginationInfo = await getFilteredStudents(params);
      
      setStudents(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
      
      } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.message || "Failed to load students");
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
      fetchStudents();
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      campus: "",
      current_grade: "",
      section: "",
      current_state: "",
      gender: "",
      shift: "",
      ordering: "-created_at"
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

  if (loading && students.length === 0) {
    return <LoadingSpinner message="Loading students..." fullScreen />;
  }

  return (
    <div className="p-3 w-full max-w-full overflow-hidden">
      <div className="mb-3">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#274c77' }}>
          Students List
        </h1>
        <p className="text-gray-600">
          Showing {students.length} of {totalCount} students
        </p>
      </div>

       {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-3 mb-3 w-full" style={{ borderColor: '#a3cef1' }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2" style={{ color: '#274c77' }}>
            <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
              <span className="text-white text-xs font-bold">🔍</span>
            </div>
            <span>Search & Filters</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, code, GR number..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
               />
             </div>
             
          {/* Campus Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
                 <select
              value={filters.campus}
              onChange={(e) => handleFilterChange('campus', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2"
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
               
          {/* Grade Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
                 <select
              value={filters.current_grade}
              onChange={(e) => handleFilterChange('current_grade', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Grades</option>
              <option value="Grade-1">Grade-1</option>
              <option value="Grade-2">Grade-2</option>
              <option value="Grade-3">Grade-3</option>
              <option value="Grade-4">Grade-4</option>
              <option value="Grade-5">Grade-5</option>
              <option value="Grade-6">Grade-6</option>
              <option value="Grade-7">Grade-7</option>
              <option value="Grade-8">Grade-8</option>
              <option value="Grade-9">Grade-9</option>
              <option value="Grade-10">Grade-10</option>
              <option value="KG-I">KG-I</option>
              <option value="KG-II">KG-II</option>
              <option value="Nursery">Nursery</option>
                 </select>
               </div>
               
          {/* Status Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
                 <select
              value={filters.current_state}
              onChange={(e) => handleFilterChange('current_state', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
                 </select>
               </div>
             </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ backgroundColor: '#6096ba' }}
          >
            <span className="mr-1">🔄</span>
            Clear Filters
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white shadow-sm"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
                           </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden w-full" style={{ borderColor: '#a3cef1' }}>
        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-gray-200 table-fixed">
            <thead style={{ backgroundColor: '#274c77' }}>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Student</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Grade/Section</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Campus</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-1/12">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                  <div className="flex items-center space-x-2">
                    <MoreVertical className="h-4 w-4" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : ''}`} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#e7ecef' }}>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{student.name}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">
                            {student.student_id || student.student_code || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <span className="text-sm font-medium text-gray-900">Grade:</span>
                        <span className="text-sm text-gray-600">{student.current_grade || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <span className="text-sm font-medium text-gray-900">Section:</span>
                        <span className="text-sm text-gray-600">{student.section || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" style={{ color: '#6096ba' }} />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {student.campus_name || 'N/A'}
                        </div>
                        {student.coordinator_names && student.coordinator_names.length > 0 && (
                          <div className="text-sm text-gray-600">
                            Coord: {student.coordinator_names[0]}
                            {student.coordinator_names.length > 1 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                      student.current_state === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : student.current_state === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        student.current_state === 'active' ? 'bg-green-500' : 
                        student.current_state === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      {student.current_state}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/students/profile?id=${student.id}`)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: '#6096ba' }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ borderColor: '#6096ba', color: '#274c77' }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
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