'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, User, GraduationCap, FileText, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createTransferRequest, previewIDChange, getAllCampuses, getAllStudents, getAllTeachers } from '@/lib/api';

interface Campus {
  id: number;
  campus_name: string;
  code?: string;
  campus_code?: string;
}

interface Student {
  id: number;
  name: string;
  student_id: string;
  current_campus: number;
  shift: 'M' | 'A';
}

interface Teacher {
  id: number;
  full_name: string;
  employee_code: string;
  current_campus: number;
  shift: 'M' | 'A';
  role: string;
}

interface IDPreview {
  old_id: string;
  new_id: string;
  changes: {
    campus_code: string;
    shift: string;
    year: string;
    role?: string;
    suffix: string;
  };
}

export default function CreateTransferRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    request_type: 'student' as 'student' | 'teacher',
    transfer_type: 'campus' as 'campus' | 'shift', // New field for transfer type
    from_campus: '',
    from_shift: 'M' as 'M' | 'A' | 'B',
    to_campus: '',
    to_shift: 'M' as 'M' | 'A' | 'B',
    entity_id: '',
    reason: '',
    requested_date: '',
    notes: ''
  });
  
  // Data lists
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [searchResults, setSearchResults] = useState<(Student | Teacher)[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Student | Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ID Preview
  const [idPreview, setIdPreview] = useState<IDPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Load preview when form changes
  useEffect(() => {
    if (selectedEntity && formData.to_campus && formData.to_shift) {
      loadIDPreview();
    }
  }, [selectedEntity, formData.to_campus, formData.to_shift]);

  // Debug form data changes
  useEffect(() => {
    console.log('=== FORM DATA DEBUG ===');
    console.log('Form data changed:', formData);
    console.log('to_shift value:', formData.to_shift);
    console.log('to_shift type:', typeof formData.to_shift);
    console.log('=== END FORM DEBUG ===');
  }, [formData]);
  
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Use the getAllCampuses function directly (it has better error handling)
      console.log('Loading campuses using getAllCampuses...');
      const campusesData = await getAllCampuses();
      console.log('Campuses data received:', campusesData);
      
      // Ensure campuses is always an array
      if (Array.isArray(campusesData) && campusesData.length > 0) {
        console.log('Setting campuses from API:', campusesData);
        console.log('First campus structure:', campusesData[0]);
        setCampuses(campusesData);
        toast.success(`Loaded ${campusesData.length} campuses from database`);
      } else {
        // If no campuses from API, use sample data for testing
        console.log('No campuses from API, using sample data for testing...');
        setCampuses([
          { id: 1, campus_name: 'Main Campus Karachi', code: 'MC001' },
          { id: 2, campus_name: 'Branch Campus Lahore', code: 'BC002' },
          { id: 3, campus_name: 'North Campus Islamabad', code: 'NC003' },
          { id: 4, campus_name: 'South Campus Multan', code: 'SC004' },
          { id: 5, campus_name: 'East Campus Faisalabad', code: 'EC005' }
        ]);
        toast.info('Using sample campus data for testing');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load campus data, using sample data');
      
      // Fallback to sample data
      setCampuses([
        { id: 1, campus_name: 'Main Campus Karachi', code: 'MC001' },
        { id: 2, campus_name: 'Branch Campus Lahore', code: 'BC002' },
        { id: 3, campus_name: 'North Campus Islamabad', code: 'NC003' },
        { id: 4, campus_name: 'South Campus Multan', code: 'SC004' },
        { id: 5, campus_name: 'East Campus Faisalabad', code: 'EC005' }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const searchEntity = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      toast.error('Please enter at least 2 characters to search');
      return;
    }
    
    try {
      setSearching(true);
      
      if (formData.request_type === 'student') {
        const studentsData = await getAllStudents();
        // Filter by search query
        const filtered = studentsData.filter((student: Student) => 
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        if (filtered.length === 0) {
          toast.info('No students found matching your search');
        }
      } else {
        const teachersData = await getAllTeachers();
        // Filter by search query
        const filtered = teachersData.filter((teacher: Teacher) => 
          teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.employee_code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        if (filtered.length === 0) {
          toast.info('No teachers found matching your search');
        }
      }
    } catch (error) {
      console.error('Error searching entities:', error);
      toast.error('Failed to search entities');
    } finally {
      setSearching(false);
    }
  };
  
  const selectEntity = (entity: Student | Teacher) => {
    console.log('=== SELECTED ENTITY DEBUG ===');
    console.log('Selected entity:', entity);
    console.log('Entity keys:', Object.keys(entity));
    console.log('Entity current_campus:', entity.current_campus);
    console.log('Entity campus:', (entity as any).campus);
    console.log('Entity current_campus_id:', (entity as any).current_campus_id);
    console.log('Available campuses:', campuses);
    console.log('=== END ENTITY DEBUG ===');
    setSelectedEntity(entity);
    setFormData(prev => ({ ...prev, entity_id: entity.id.toString() }));
    setSearchResults([]);
    setSearchQuery('');
    toast.success(`${'name' in entity ? 'Student' : 'Teacher'} selected successfully`);
  };
  
  const loadIDPreview = async () => {
    if (!selectedEntity) return;
    
    try {
      setPreviewLoading(true);
      const oldId = 'student_id' in selectedEntity ? selectedEntity.student_id : selectedEntity.employee_code;
      
      // Debug the selectedEntity structure
      console.log('Selected entity structure:', {
        keys: Object.keys(selectedEntity),
        student_id: 'student_id' in selectedEntity ? selectedEntity.student_id : 'not found',
        employee_code: 'employee_code' in selectedEntity ? selectedEntity.employee_code : 'not found',
        id: selectedEntity.id,
        name: 'name' in selectedEntity ? selectedEntity.name : 'not found',
        full_name: 'full_name' in selectedEntity ? selectedEntity.full_name : 'not found'
      });
      const toCampus = campuses.find(c => c.id.toString() === formData.to_campus);
      
      console.log('ID Preview Debug:', {
        selectedEntity,
        oldId,
        toCampus,
        to_shift: formData.to_shift
      });
      
      if (!toCampus) {
        console.log('No destination campus found');
        return;
      }
      
      if (!oldId) {
        console.log('No old ID found, using mock ID for preview');
        // Use a mock ID for preview if real ID is not available
        const mockId = formData.request_type === 'student' 
          ? `STU${selectedEntity.id.toString().padStart(3, '0')}` 
          : `TCH${selectedEntity.id.toString().padStart(3, '0')}`;
        
        // Convert shift values for preview
        const shiftMapping: { [key: string]: "M" | "A" } = {
          'morning': 'M',
          'afternoon': 'A',
          'M': 'M',
          'A': 'A'
        };

        // Convert shift properly
        let convertedShift: "M" | "A" = 'M';
        if (formData.to_shift) {
          const lowerShift = formData.to_shift.toLowerCase();
        if (lowerShift === 'm' || lowerShift === 'morning') {
          convertedShift = 'M';
        } else if (lowerShift === 'a' || lowerShift === 'afternoon') {
          convertedShift = 'A';
        } else if (shiftMapping[formData.to_shift]) {
          convertedShift = shiftMapping[formData.to_shift];
        }
        }

        const preview = await previewIDChange({
          old_id: mockId,
          new_campus_code: toCampus.code || toCampus.campus_code || 'MC001',
          new_shift: convertedShift,
          new_role: 'employee_code' in selectedEntity ? selectedEntity.role : undefined
        });
        
        setIdPreview(preview as IDPreview);
        return;
      }
      
        // Convert shift values for preview
        const shiftMapping: { [key: string]: "M" | "A" } = {
          'morning': 'M',
          'afternoon': 'A',
          'M': 'M',
          'A': 'A'
        };

      // Convert shift properly
      let convertedShift: "M" | "A" = 'M';
      if (formData.to_shift) {
        const lowerShift = formData.to_shift.toLowerCase();
        if (lowerShift === 'm' || lowerShift === 'morning') {
          convertedShift = 'M';
        } else if (lowerShift === 'a' || lowerShift === 'afternoon') {
          convertedShift = 'A';
        } else if (shiftMapping[formData.to_shift]) {
          convertedShift = shiftMapping[formData.to_shift];
        }
      }
      
      const preview = await previewIDChange({
        old_id: oldId,
        new_campus_code: toCampus.code || toCampus.campus_code || 'MC001',
        new_shift: convertedShift,
        new_role: 'employee_code' in selectedEntity ? selectedEntity.role : undefined
      });
      
      setIdPreview(preview as IDPreview);
    } catch (error: any) {
      console.error('Error loading ID preview:', error);
      
      // Better error handling for ID preview
      if (error.message?.includes('KeyError')) {
        toast.error('Missing required data for ID preview. Please check entity selection.');
      } else if (error.message?.includes('not a valid choice')) {
        toast.error('Invalid shift selection for ID preview.');
      } else {
        toast.error('Failed to load ID preview. Please try again.');
      }
    } finally {
      setPreviewLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntity) {
      toast.error('Please select a student or teacher');
      return;
    }
    
    // Check required fields based on transfer type
    if (formData.transfer_type === 'campus' && !formData.to_campus) {
      toast.error('Please select destination campus for campus transfer');
      return;
    }
    
    if (formData.transfer_type === 'shift' && !formData.to_shift) {
      toast.error('Please select destination shift for shift transfer');
      return;
    }
    
    if (!formData.reason || !formData.requested_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Transfer Data Debug:', {
        selectedEntity,
        formData,
        current_campus: selectedEntity.current_campus,
        shift: selectedEntity.shift
      });
      
      // Get the first available campus as default if current_campus is not available
      const defaultCampus = campuses.length > 0 ? campuses[0].id : 1;
      
      // Convert shift values to backend format
      const shiftMapping: { [key: string]: "M" | "A" } = {
        'morning': 'M',
        'afternoon': 'A',
        'M': 'M',
        'A': 'A'
      };

      // Ensure to_shift is properly converted
      let convertedToShift: "M" | "A" = 'M';
      console.log('Raw formData.to_shift:', formData.to_shift);
      
      if (formData.to_shift) {
        const lowerShift = formData.to_shift.toLowerCase();
        console.log('Lower shift:', lowerShift);
        
        if (lowerShift === 'm' || lowerShift === 'morning') {
          convertedToShift = 'M';
          console.log('Converted to M');
        } else if (lowerShift === 'a' || lowerShift === 'afternoon') {
          convertedToShift = 'A';
          console.log('Converted to A');
        } else if (shiftMapping[formData.to_shift]) {
          convertedToShift = shiftMapping[formData.to_shift];
          console.log('Converted via mapping:', convertedToShift);
        } else {
          console.log('No conversion found, using default M');
        }
      }
      
      console.log('Final converted shift:', convertedToShift);

      // Convert from_shift as well
      let convertedFromShift: "M" | "A" = 'M';
      if (selectedEntity.shift) {
        const lowerShift = selectedEntity.shift.toLowerCase();
        if (lowerShift === 'm' || lowerShift === 'morning') {
          convertedFromShift = 'M';
        } else if (lowerShift === 'a' || lowerShift === 'afternoon') {
          convertedFromShift = 'A';
        } else if (selectedEntity.shift === 'M' || selectedEntity.shift === 'A') {
          convertedFromShift = selectedEntity.shift;
        }
      }
      
      console.log('Selected entity shift:', selectedEntity.shift);
      console.log('Converted from_shift:', convertedFromShift);

      const transferData = {
        request_type: formData.request_type,
        from_campus: selectedEntity.current_campus || defaultCampus, // Use first available campus
        from_shift: convertedFromShift, // Use converted shift
        to_campus: formData.transfer_type === 'campus' 
          ? parseInt(formData.to_campus) 
          : selectedEntity.current_campus || defaultCampus, // For shift transfer, use same campus
        to_shift: convertedToShift,
        reason: formData.reason,
        requested_date: formData.requested_date,
        notes: formData.notes,
        transfer_type: formData.transfer_type, // Add transfer type
        ...(formData.request_type === 'student' 
          ? { student: selectedEntity.id }
          : { teacher: selectedEntity.id }
        )
      };
      
      console.log('=== TRANSFER DEBUG ===');
      console.log('Form data to_shift:', formData.to_shift);
      console.log('Shift mapping:', shiftMapping);
      console.log('Shift mapping result:', shiftMapping[formData.to_shift]);
      console.log('Converted to_shift:', convertedToShift);
      console.log('Final transfer data:', JSON.stringify(transferData, null, 2));
      console.log('Transfer data to_shift:', transferData.to_shift);
      console.log('Transfer data from_shift:', transferData.from_shift);
      console.log('=== END DEBUG ===');
      
      await createTransferRequest(transferData);
      toast.success('Transfer request created successfully!');
      router.push('/admin/principal/transfers');
    } catch (error: any) {
      console.error('Error creating transfer request:', error);
      
      // Better error handling with specific messages
      if (error.message?.includes('not a valid choice')) {
        toast.error('Invalid shift selection. Please choose Morning or Afternoon.');
      } else if (error.message?.includes('Only principals can create')) {
        toast.error('You do not have permission to create transfer requests.');
      } else if (error.message?.includes('Invalid pk')) {
        toast.error('Invalid campus selection. Please try again.');
      } else if (error.message?.includes('KeyError')) {
        toast.error('Data validation error. Please check all fields and try again.');
      } else {
        toast.error(`Failed to create transfer request: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      request_type: 'student',
      transfer_type: 'campus',
      from_campus: '',
      from_shift: 'M',
      to_campus: '',
      to_shift: 'M',
      entity_id: '',
      reason: '',
      requested_date: '',
      notes: ''
    });
    setSelectedEntity(null);
    setSearchResults([]);
    setSearchQuery('');
    setIdPreview(null);
    setShowPreview(false);
    toast.success('Form reset successfully');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
              Create Transfer Request
            </h1>
            <p className="text-gray-600 mt-1">Transfer students or teachers between campuses</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                Transfer Information
              </h2>
              <p className="text-blue-100 mt-1">Fill in the details below to create a transfer request</p>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Transfer Type Selection */}
                  <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-700">Transfer Type</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={formData.request_type === 'student' ? 'default' : 'outline'}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, request_type: 'student' }));
                          setSelectedEntity(null);
                          setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
                      formData.request_type === 'student' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                        : 'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                        Student Transfer
                      </Button>
                      <Button
                        type="button"
                        variant={formData.request_type === 'teacher' ? 'default' : 'outline'}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, request_type: 'teacher' }));
                          setSelectedEntity(null);
                          setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
                      formData.request_type === 'teacher' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                        : 'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                        Teacher Transfer
                      </Button>
                    </div>
                  </div>

              {/* Transfer Category Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-700">Transfer Category</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.transfer_type === 'campus' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, transfer_type: 'campus' }))}
                    className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
                      formData.transfer_type === 'campus' 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                        : 'border-2 border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                    Campus Transfer
                  </Button>
                  <Button
                    type="button"
                    variant={formData.transfer_type === 'shift' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, transfer_type: 'shift' }))}
                    className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
                      formData.transfer_type === 'shift' 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                        : 'border-2 border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                    Shift Transfer
                  </Button>
                </div>
              </div>

              {/* Entity Search Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-700">
                    Select {formData.request_type === 'student' ? 'Student' : 'Teacher'}
                </Label>
                
                {/* Search Input with Button */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                      placeholder={`Search ${formData.request_type}s by name or ID...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchEntity();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={searchEntity}
                    disabled={searching || !searchQuery.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Searching...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search
                      </div>
                    )}
                  </Button>
                    </div>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Found {searchResults.length} {formData.request_type}(s):
                    </p>
                        {searchResults.map((entity) => (
                          <div
                            key={entity.id}
                            onClick={() => selectEntity(entity)}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 bg-white"
                          >
                            <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {formData.request_type === 'student' ? (
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              ) : (
                                <User className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                              <div>
                              <p className="font-semibold text-gray-900">
                                {'name' in entity ? entity.name : entity.full_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                  {'student_id' in entity ? entity.student_id : entity.employee_code}
                                </p>
                              </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {formData.request_type === 'student' ? 'Student' : 'Teacher'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Selected Entity */}
                    {selectedEntity && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          {formData.request_type === 'student' ? (
                            <GraduationCap className="h-6 w-6 text-green-600" />
                          ) : (
                            <User className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">
                            {'name' in selectedEntity ? selectedEntity.name : selectedEntity.full_name}
                          </p>
                          <p className="text-sm text-green-700">
                            {'student_id' in selectedEntity ? selectedEntity.student_id : selectedEntity.employee_code}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEntity(null);
                          setFormData(prev => ({ ...prev, entity_id: '' }));
                        }}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Column Layout: Old Data vs New Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Current/Old Data */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">O</span>
                      </div>
                      Current Information
                    </h3>
                    
                    {selectedEntity ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Label className="text-sm font-medium text-gray-600">Name</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {'name' in selectedEntity ? selectedEntity.name : selectedEntity.full_name}
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Label className="text-sm font-medium text-gray-600">ID</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {'student_id' in selectedEntity ? selectedEntity.student_id : selectedEntity.employee_code}
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Label className="text-sm font-medium text-gray-600">Current Campus</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {(() => {
                              console.log('Current campus debug:', {
                                selectedEntity,
                                current_campus: selectedEntity.current_campus,
                                campus: (selectedEntity as any).campus,
                                current_campus_id: (selectedEntity as any).current_campus_id,
                                campuses: campuses.length,
                                campusIds: campuses.map(c => c.id)
                              });
                              
                              // Try different possible field names for campus
                              const campusId = selectedEntity.current_campus || 
                                             (selectedEntity as any).campus || 
                                             (selectedEntity as any).current_campus_id ||
                                             (selectedEntity as any).campus_id;
                              
                              if (!campusId) return 'Not Available';
                              const campus = campuses.find(c => c.id === campusId);
                              if (campus) {
                                return `${campus.campus_name} (${campus.code || campus.campus_code || 'N/A'})`;
                              } else {
                                // Fallback to show campus ID if campus not found in list
                                return `Campus ID: ${campusId}`;
                              }
                            })()}
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Label className="text-sm font-medium text-gray-600">Current Shift</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {selectedEntity.shift === 'M' ? 'Morning' : selectedEntity.shift === 'A' ? 'Afternoon' : selectedEntity.shift || 'Not Available'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>Please select a {formData.request_type} to view current information</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - New/Transfer Data */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">N</span>
                      </div>
                      Transfer Information
                    </h3>
                    
                  <div className="space-y-4">
                      {/* Dynamic Form Based on Transfer Type */}
                      {formData.transfer_type === 'campus' && (
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <Label className="text-sm font-medium text-blue-600">Destination Campus</Label>
                      <Select
                        value={formData.to_campus}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, to_campus: value }))}
                      >
                            <SelectTrigger className="py-3 text-base border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mt-2">
                          <SelectValue placeholder="Select destination campus" />
                        </SelectTrigger>
                        <SelectContent>
                              {loading ? (
                                <SelectItem value="loading" disabled>Loading campuses...</SelectItem>
                              ) : Array.isArray(campuses) && campuses.length > 0 ? (
                                campuses.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id.toString()}>
                                    {campus.campus_name} ({campus.code || campus.campus_code || 'N/A'})
                            </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-campuses" disabled>No campuses available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {formData.transfer_type === 'shift' && (
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <Label className="text-sm font-medium text-blue-600">Destination Shift</Label>
                          <Select
                            value={formData.to_shift}
                            onValueChange={(value: 'M' | 'A' | 'B') => {
                              console.log('Select value changed to:', value);
                              setFormData(prev => ({ ...prev, to_shift: value }));
                            }}
                          >
                            <SelectTrigger className="py-3 text-base border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mt-2">
                              <SelectValue placeholder="Select destination shift" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Morning</SelectItem>
                              <SelectItem value="A">Afternoon</SelectItem>
                              <SelectItem value="B">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                      )}
                      
                      {/* Both campus and shift for campus transfer */}
                      {formData.transfer_type === 'campus' && (
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <Label className="text-sm font-medium text-blue-600">Destination Shift</Label>
                      <Select
                        value={formData.to_shift}
                            onValueChange={(value: 'M' | 'A') => {
                              console.log('Select value changed to:', value);
                              setFormData(prev => ({ ...prev, to_shift: value }));
                            }}
                      >
                            <SelectTrigger className="py-3 text-base border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mt-2">
                              <SelectValue placeholder="Select destination shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Morning</SelectItem>
                              <SelectItem value="A">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Preview */}
              {selectedEntity && formData.to_campus && formData.to_shift && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-700">ID Preview</Label>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    {previewLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading preview...</p>
                      </div>
                    ) : idPreview ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Current ID</p>
                            <p className="font-mono font-bold text-lg text-gray-900">{idPreview.old_id}</p>
                          </div>
                          <ArrowRightLeft className="h-6 w-6 text-blue-500" />
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">New ID</p>
                            <p className="font-mono font-bold text-lg text-blue-600">{idPreview.new_id}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-2 bg-white rounded">
                            <p className="text-gray-600">Campus</p>
                            <p className="font-semibold">{idPreview.changes.campus_code}</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <p className="text-gray-600">Shift</p>
                            <p className="font-semibold">{idPreview.changes.shift}</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <p className="text-gray-600">Year</p>
                            <p className="font-semibold">{idPreview.changes.year}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">Select destination to preview ID change</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Request Details */}
              <div className="space-y-6">
                <Label className="text-lg font-semibold text-gray-700">Request Details</Label>
                
                  <div className="space-y-4">
                    <div>
                    <Label htmlFor="reason" className="text-base font-medium text-gray-700">
                      Reason for Transfer <span className="text-red-500">*</span>
                    </Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter reason for transfer..."
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={4}
                      className="mt-2 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                      />
                    </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="requested_date" className="text-base font-medium text-gray-700">
                        Requested Transfer Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="requested_date"
                        type="date"
                        value={formData.requested_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, requested_date: e.target.value }))}
                        className="mt-2 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes" className="text-base font-medium text-gray-700">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional information..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="mt-2 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                          </div>
                        </div>
                      </div>
                    </div>
              
              {/* Action Buttons */}
          <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
              className="px-8 py-3 text-base font-medium border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedEntity || !formData.reason || !formData.requested_date || 
                        (formData.transfer_type === 'campus' && !formData.to_campus) ||
                        (formData.transfer_type === 'shift' && !formData.to_shift)}
              className="px-8 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Transfer...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Create Transfer Request
                </>
              )}
                    </Button>
          </div>
        </form>
      </div>
    </div>
  );
}