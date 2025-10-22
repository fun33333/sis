"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions";
import { getFilteredStudents, getAllCampuses } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, Edit, MoreVertical, User, Mail, GraduationCap, MapPin, Calendar, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  
  // Edit functionality
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Edit handlers
  const handleEdit = async (student: Student) => {
    try {
      setEditingStudent(student);
      
      // Fetch full student data
      const response = await fetch(`http://127.0.0.1:8000/api/students/${student.id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sis_access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const studentData = await response.json();
        setEditFormData({
          name: studentData.name || '',
          gender: studentData.gender || '',
          dob: studentData.dob || '',
          place_of_birth: studentData.place_of_birth || '',
          religion: studentData.religion || '',
          mother_tongue: studentData.mother_tongue || '',
          emergency_contact: studentData.emergency_contact || '',
          father_name: studentData.father_name || '',
          father_cnic: studentData.father_cnic || '',
          father_contact: studentData.father_contact || '',
          father_profession: studentData.father_profession || '',
          guardian_name: studentData.guardian_name || '',
          guardian_cnic: studentData.guardian_cnic || '',
          guardian_contact: studentData.guardian_contact || '',
          guardian_relation: studentData.guardian_relation || '',
          current_grade: studentData.current_grade || '',
          section: studentData.section || '',
          last_class_passed: studentData.last_class_passed || '',
          last_school_name: studentData.last_school_name || '',
          last_class_result: studentData.last_class_result || '',
          from_year: studentData.from_year || '',
          to_year: studentData.to_year || '',
          siblings_count: studentData.siblings_count || '',
          father_status: studentData.father_status || '',
          sibling_in_alkhair: studentData.sibling_in_alkhair || '',
          gr_no: studentData.gr_no || '',
          enrollment_year: studentData.enrollment_year || '',
          shift: studentData.shift || '',
          is_draft: studentData.is_draft ? 'true' : 'false'
        });
        setShowEditDialog(true);
      } else {
        console.error('Error fetching student data:', response.statusText);
        alert('Error loading student data');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      alert('Error loading student data');
    }
  };

  const handleEditClose = () => {
    setEditingStudent(null);
    setShowEditDialog(false);
    setEditFormData({});
  };

  const handleEditSubmit = async () => {
    if (!editingStudent) return;
    
    setIsSubmitting(true);
    try {
      // Prepare update data - only send fields that have values
      const updateData: any = {};
      
      // Add all fields that have values
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== '' && editFormData[key] !== null && editFormData[key] !== undefined) {
          updateData[key] = editFormData[key];
        }
      });
      
      // Convert specific fields
      if (updateData.from_year) {
        updateData.from_year = parseInt(updateData.from_year);
      }
      if (updateData.to_year) {
        updateData.to_year = parseInt(updateData.to_year);
      }
      if (updateData.enrollment_year) {
        updateData.enrollment_year = parseInt(updateData.enrollment_year);
      }
      if (updateData.siblings_count) {
        updateData.siblings_count = parseInt(updateData.siblings_count);
      }
      if (updateData.is_draft) {
        updateData.is_draft = updateData.is_draft === 'true';
      }

      console.log('Updating student with data:', updateData);

      const response = await fetch(`http://127.0.0.1:8000/api/students/${editingStudent.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sis_access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert(`✅ Success! Student ${editFormData.name || editingStudent.name} has been updated successfully!`);
        setShowEditDialog(false);
        setEditingStudent(null);
        setEditFormData({});
        // Refresh the students list
        fetchStudents();
      } else {
        const errorData = await response.text();
        console.error('Error updating student:', response.status, errorData);
        alert(`Error updating student: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && students.length === 0) {
    return <LoadingSpinner message="Loading students..." fullScreen />;
  }

  return (
    <div className="p-2 sm:p-3 w-full max-w-full overflow-hidden">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#274c77' }}>
          Students List
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Showing {students.length} of {totalCount} students
        </p>
      </div>

       {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-3 mb-3 w-full" style={{ borderColor: '#a3cef1' }}>
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center space-x-2" style={{ color: '#274c77' }}>
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
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
               
          {/* Shift Filter */}
               <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
                 <select
              value={filters.shift}
              onChange={(e) => handleFilterChange('shift', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#a3cef1' }}
            >
              <option value="">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
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
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
            <thead style={{ backgroundColor: '#274c77' }}>
              <tr>
                <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px] sm:min-w-[150px]">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Student</span>
                  </div>
                </th>
                <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Grade/Section</span>
                    <span className="sm:hidden">Grade</span>
                  </div>
                </th>
                <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Campus</span>
                  </div>
                </th>
                <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : ''}`} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#e7ecef' }}>
                  <td className="px-2 sm:px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center space-x-2">
                          <span className="truncate">{student.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[100px] sm:max-w-[150px]">
                            {student.student_id || student.student_code || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#6096ba' }} />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Grade:</span>
                        <span className="text-xs sm:text-sm text-gray-600">{student.current_grade || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#6096ba' }} />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Section:</span>
                        <span className="text-xs sm:text-sm text-gray-600">{student.section || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#6096ba' }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {student.campus_name || 'N/A'}
                        </div>
                        {student.coordinator_names && student.coordinator_names.length > 0 && (
                          <div className="text-xs text-gray-600 truncate">
                            Coord: {student.coordinator_names[0]}
                            {student.coordinator_names.length > 1 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-3 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => router.push(`/admin/students/profile?id=${student.id}`)}
                        className="inline-flex items-center px-1.5 sm:px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: '#6096ba' }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      {/* Edit button - available for all roles including principal */}
                      <button
                        onClick={() => handleEdit(student)}
                        className="inline-flex items-center px-1.5 sm:px-2 py-1 border text-xs font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ borderColor: '#6096ba', color: '#274c77' }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
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

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: '#274c77' }}>
              Edit Student - {editingStudent?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#274c77' }}>Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={editFormData.gender || ''} onValueChange={(value) => setEditFormData({...editFormData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="place_of_birth">Place of Birth</Label>
                  <Input
                    id="place_of_birth"
                    value={editFormData.place_of_birth || ''}
                    onChange={(e) => setEditFormData({...editFormData, place_of_birth: e.target.value})}
                    placeholder="Enter place of birth"
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={editFormData.religion || ''}
                    onChange={(e) => setEditFormData({...editFormData, religion: e.target.value})}
                    placeholder="Enter religion"
                  />
                </div>
                <div>
                  <Label htmlFor="mother_tongue">Mother Tongue</Label>
                  <Input
                    id="mother_tongue"
                    value={editFormData.mother_tongue || ''}
                    onChange={(e) => setEditFormData({...editFormData, mother_tongue: e.target.value})}
                    placeholder="Enter mother tongue"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={editFormData.emergency_contact || ''}
                    onChange={(e) => setEditFormData({...editFormData, emergency_contact: e.target.value})}
                    placeholder="Enter emergency contact"
                  />
                </div>
              </div>
            </div>

            {/* Father Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#274c77' }}>Father Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="father_name">Father Name</Label>
                  <Input
                    id="father_name"
                    value={editFormData.father_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, father_name: e.target.value})}
                    placeholder="Enter father name"
                  />
                </div>
                <div>
                  <Label htmlFor="father_cnic">Father CNIC</Label>
                  <Input
                    id="father_cnic"
                    value={editFormData.father_cnic || ''}
                    onChange={(e) => setEditFormData({...editFormData, father_cnic: e.target.value})}
                    placeholder="Enter father CNIC"
                  />
                </div>
                <div>
                  <Label htmlFor="father_contact">Father Contact</Label>
                  <Input
                    id="father_contact"
                    value={editFormData.father_contact || ''}
                    onChange={(e) => setEditFormData({...editFormData, father_contact: e.target.value})}
                    placeholder="Enter father contact"
                  />
                </div>
                <div>
                  <Label htmlFor="father_profession">Father Profession</Label>
                  <Input
                    id="father_profession"
                    value={editFormData.father_profession || ''}
                    onChange={(e) => setEditFormData({...editFormData, father_profession: e.target.value})}
                    placeholder="Enter father profession"
                  />
                </div>
                <div>
                  <Label htmlFor="father_status">Father Status</Label>
                  <Select value={editFormData.father_status || ''} onValueChange={(value) => setEditFormData({...editFormData, father_status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select father status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alive">Alive</SelectItem>
                      <SelectItem value="dead">Dead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#274c77' }}>Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    value={editFormData.guardian_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, guardian_name: e.target.value})}
                    placeholder="Enter guardian name"
                  />
                </div>
                <div>
                  <Label htmlFor="guardian_cnic">Guardian CNIC</Label>
                  <Input
                    id="guardian_cnic"
                    value={editFormData.guardian_cnic || ''}
                    onChange={(e) => setEditFormData({...editFormData, guardian_cnic: e.target.value})}
                    placeholder="Enter guardian CNIC"
                  />
                </div>
                <div>
                  <Label htmlFor="guardian_contact">Guardian Contact</Label>
                  <Input
                    id="guardian_contact"
                    value={editFormData.guardian_contact || ''}
                    onChange={(e) => setEditFormData({...editFormData, guardian_contact: e.target.value})}
                    placeholder="Enter guardian contact"
                  />
                </div>
                <div>
                  <Label htmlFor="guardian_relation">Guardian Relation</Label>
                  <Input
                    id="guardian_relation"
                    value={editFormData.guardian_relation || ''}
                    onChange={(e) => setEditFormData({...editFormData, guardian_relation: e.target.value})}
                    placeholder="Enter guardian relation"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#274c77' }}>Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_grade">Current Grade</Label>
                  <Input
                    id="current_grade"
                    value={editFormData.current_grade || ''}
                    onChange={(e) => setEditFormData({...editFormData, current_grade: e.target.value})}
                    placeholder="Enter current grade"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={editFormData.section || ''}
                    onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                    placeholder="Enter section"
                  />
                </div>
                <div>
                  <Label htmlFor="last_class_passed">Last Class Passed</Label>
                  <Input
                    id="last_class_passed"
                    value={editFormData.last_class_passed || ''}
                    onChange={(e) => setEditFormData({...editFormData, last_class_passed: e.target.value})}
                    placeholder="Enter last class passed"
                  />
                </div>
                <div>
                  <Label htmlFor="last_school_name">Last School Name</Label>
                  <Input
                    id="last_school_name"
                    value={editFormData.last_school_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, last_school_name: e.target.value})}
                    placeholder="Enter last school name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_class_result">Last Class Result</Label>
                  <Input
                    id="last_class_result"
                    value={editFormData.last_class_result || ''}
                    onChange={(e) => setEditFormData({...editFormData, last_class_result: e.target.value})}
                    placeholder="Enter last class result"
                  />
                </div>
                <div>
                  <Label htmlFor="gr_no">GR Number</Label>
                  <Input
                    id="gr_no"
                    value={editFormData.gr_no || ''}
                    onChange={(e) => setEditFormData({...editFormData, gr_no: e.target.value})}
                    placeholder="Enter GR number"
                  />
                </div>
                <div>
                  <Label htmlFor="enrollment_year">Enrollment Year</Label>
                  <Input
                    id="enrollment_year"
                    type="number"
                    value={editFormData.enrollment_year || ''}
                    onChange={(e) => setEditFormData({...editFormData, enrollment_year: e.target.value})}
                    placeholder="Enter enrollment year"
                  />
                </div>
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={editFormData.shift || ''} onValueChange={(value) => setEditFormData({...editFormData, shift: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="is_draft">Is Draft</Label>
                  <Select value={editFormData.is_draft || ''} onValueChange={(value) => setEditFormData({...editFormData, is_draft: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#274c77' }}>Family Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siblings_count">Siblings Count</Label>
                  <Input
                    id="siblings_count"
                    type="number"
                    value={editFormData.siblings_count || ''}
                    onChange={(e) => setEditFormData({...editFormData, siblings_count: e.target.value})}
                    placeholder="Enter siblings count"
                  />
                </div>
                <div>
                  <Label htmlFor="sibling_in_alkhair">Sibling in Alkhair</Label>
                  <Select value={editFormData.sibling_in_alkhair || ''} onValueChange={(value) => setEditFormData({...editFormData, sibling_in_alkhair: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="from_year">From Year</Label>
                  <Input
                    id="from_year"
                    type="number"
                    value={editFormData.from_year || ''}
                    onChange={(e) => setEditFormData({...editFormData, from_year: e.target.value})}
                    placeholder="Enter from year"
                  />
                </div>
                <div>
                  <Label htmlFor="to_year">To Year</Label>
                  <Input
                    id="to_year"
                    type="number"
                    value={editFormData.to_year || ''}
                    onChange={(e) => setEditFormData({...editFormData, to_year: e.target.value})}
                    placeholder="Enter to year"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={handleEditClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isSubmitting}
              className="px-6"
              style={{ backgroundColor: '#6096ba' }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Student'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}