import { CacheManager } from './cache';

export function getApiBaseUrl(): string {
  const baseUrl = typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000")
    : (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000");
  
  console.log('🌐 API Base URL:', baseUrl);
  return baseUrl;
}

// API endpoints
export const API_ENDPOINTS = {
  STUDENTS: "/api/students/",
  STUDENTS_TOTAL: "/api/students/total/",
  STUDENTS_GENDER_STATS: "/api/students/gender_stats/",
  STUDENTS_CAMPUS_STATS: "/api/students/campus_stats/",
  STUDENTS_GRADE_DISTRIBUTION: "/api/students/grade_distribution/",
  STUDENTS_ENROLLMENT_TREND: "/api/students/enrollment_trend/",
  STUDENTS_MOTHER_TONGUE_DISTRIBUTION: "/api/students/mother_tongue_distribution/",
  STUDENTS_RELIGION_DISTRIBUTION: "/api/students/religion_distribution/",
  TEACHERS: "/api/teachers/",
  CAMPUS: "/api/campus/",
  CAMPUS_ACTIVE: "/api/campus/active/",
  USERS: "/api/users/",
  AUTH_LOGIN: "/api/auth/login/",
  AUTH_REFRESH: "/api/auth/refresh/",
  COORDINATORS: "/api/coordinators/",
  LEVELS: "/api/levels/",
  GRADES: "/api/grades/",
  CLASSROOMS: "/api/classrooms/",
  LEVEL_CHOICES: "/api/levels/choices/",
  GRADE_CHOICES: "/api/grades/choices/",
  CLASSROOM_CHOICES: "/api/classrooms/choices/",
  CLASSROOM_SECTIONS: "/api/classrooms/sections/",
  CLASSROOM_STUDENTS: "/api/attendance/class/{id}/students/",
  AVAILABLE_STUDENTS: "/api/attendance/class/{id}/available-students/",
  CURRENT_USER_PROFILE: "/api/current-user/",
} as const;


// Enhanced error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API error handler
function handleApiError(response: Response, errorText: string): never {
  let errorMessage = `API Error (${response.status}): ${response.statusText}`;
  
  // Try to parse JSON error response for specific error message
  try {
    const errorData = JSON.parse(errorText);
    
    // Handle different error response formats
    if (errorData.error) {
      // Simple error field
      errorMessage = errorData.error;
    } else if (errorData.detail) {
      // DRF detail field
      errorMessage = errorData.detail;
    } else if (errorData.non_field_errors) {
      // Handle non_field_errors (DRF specific)
      const messages = Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors.join(', ')
        : String(errorData.non_field_errors);
      errorMessage = messages;
    } else if (typeof errorData === 'object') {
      // Handle ValidationError format - extract first field error
      const fieldErrors = Object.values(errorData);
      if (fieldErrors.length > 0) {
        const firstError = Array.isArray(fieldErrors[0]) ? fieldErrors[0][0] : fieldErrors[0];
        errorMessage = firstError;
      }
    }
  } catch {
    // If not JSON, use the error text as is
    if (errorText) {
      errorMessage = errorText;
    }
  }
  
  // Don't log here - let the calling component decide how to handle it
  throw new ApiError(errorMessage, response.status, response.statusText, errorText);
}

// Token storage helpers
const ACCESS_TOKEN_KEY = 'sis_access_token';
const REFRESH_TOKEN_KEY = 'sis_refresh_token';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(access: string, refresh?: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Centralized authorized fetch with auto-refresh and retry
export async function authorizedFetch(path: string, init: RequestInit = {}, alreadyRetried = false): Promise<Response> {
  const base = getApiBaseUrl();
  // Ensure no double slashes in URL construction
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${cleanBase}${cleanPath}`;

  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  console.log('🔑 Token check:', token ? 'Token exists' : 'No token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('🔑 Authorization header set');
  } else {
    console.log('❌ No token available for authorization');
  }

  console.log('🌐 Making fetch request to:', url);
  console.log('🌐 Headers:', Object.fromEntries(headers.entries()));
  
  const res = await fetch(url, { ...init, headers, credentials: 'omit' });
  
  console.log('📡 Fetch response status:', res.status, res.statusText);

  if (res.status !== 401) return res;
  
  console.log('🔄 Got 401, attempting token refresh...');

  // Attempt token refresh once
  if (!alreadyRetried) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshRes = await fetch(`${cleanBase}${API_ENDPOINTS.AUTH_REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccess = data?.access as string | undefined;
        if (newAccess) {
          setAuthTokens(newAccess, refresh);
          const retryHeaders = new Headers(init.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newAccess}`);
          return fetch(url, { ...init, headers: retryHeaders, credentials: 'omit' });
        }
      }
    }
  }

  return res; // Caller will handle error body
}

// Auth APIs
export async function loginWithEmailPassword(emailOrCode: string, password: string) {
  const base = getApiBaseUrl();
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const res = await fetch(`${cleanBase}${API_ENDPOINTS.AUTH_LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailOrCode, password }),
    credentials: 'omit'
  });
  if (!res.ok) {
    const text = await res.text();
    handleApiError(res, text);
  }
  const data = await res.json();
  const access = data?.access as string | undefined;
  const refresh = data?.refresh as string | undefined;
  if (access) setAuthTokens(access, refresh);
  if (typeof window !== 'undefined' && data?.user) {
    window.localStorage.setItem('sis_user', JSON.stringify(data.user));
  }
  return data;
}

export function logoutClientOnly() {
  clearAuthTokens();
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('sis_user');
    window.localStorage.removeItem('userProfile'); // Clear userProfile too
  }
}

// Helper function to get user profile from localStorage
export function getStoredUserProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const profile = window.localStorage.getItem('sis_user');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error parsing user profile:', error);
    return null;
  }
}

// Helper function to get campus ID for principals
export function getUserCampusId(): number | null {
  const profile = getStoredUserProfile();
  return profile?.campus_id || null;
}

// Helper function to get level ID for coordinators
export function getUserLevelId(): number | null {
  const profile = getStoredUserProfile();
  return profile?.level_id || null;
}

// Helper function to get user role
export function getUserRole(): string | null {
  const profile = getStoredUserProfile();
  return profile?.role || null;
}

//post api call for creating a new campus; and other JSON POSTs
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await authorizedFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      handleApiError(res, text);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${error}`, 0, 'Network Error');
  }
}


// simple GET helper 
export async function apiGet<T>(path: string): Promise<T> {
  try {
    console.log('🌐 apiGet called with path:', path);
    const fullUrl = `${getApiBaseUrl()}${path}`;
    console.log('🔗 Full URL:', fullUrl);
    
    const res = await authorizedFetch(path, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    
    console.log('📡 Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const text = await res.text();
      console.error('❌ API Error:', res.status, text);
      handleApiError(res, text);
    }
    
    const data = await res.json();
    console.log('✅ API Response data:', data);
    return data as T;
  } catch (error) {
    console.error('❌ apiGet error:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${error}`, 0, 'Network Error');
  }
}

// optional: DELETE helper
export async function apiDelete(path: string): Promise<void> {
  try {
    const res = await authorizedFetch(path, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text();
      handleApiError(res, text);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${error}`, 0, 'Network Error');
  }
}

// PATCH helper for updating partial resources
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await authorizedFetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      handleApiError(res, text);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${error}`, 0, 'Network Error');
  }
}

// PUT helper for replacing resources
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await authorizedFetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      handleApiError(res, text);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${error}`, 0, 'Network Error');
  }
}

// FormData POST helper (e.g., uploading photo)
export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  try {
    const res = await authorizedFetch(path, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      handleApiError(res, text);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${error}`, 0, 'Network Error');
  }
}

// Dashboard-specific API functions
export interface DashboardStats {
  totalStudents: number;
  male: number;
  female: number;
  other: number;
  campusStats: Array<{ campus: string; count: number }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [totalRes, genderRes, campusRes] = await Promise.all([
      apiGet<{ totalStudents: number }>(API_ENDPOINTS.STUDENTS_TOTAL),
      apiGet<{ male: number; female: number; other: number }>(API_ENDPOINTS.STUDENTS_GENDER_STATS),
      apiGet<Array<{ campus: string; count: number }>>(API_ENDPOINTS.STUDENTS_CAMPUS_STATS)
    ]);

    return {
      totalStudents: totalRes.totalStudents,
      male: genderRes.male,
      female: genderRes.female,
      other: genderRes.other,
      campusStats: campusRes
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    
    // Show user-friendly error message
    if (error instanceof ApiError) {
      console.error(`API Error: ${error.status} - ${error.message}`);
    }
    
    // Return fallback data
    return {
      totalStudents: 0,
      male: 0,
      female: 0,
      other: 0,
      campusStats: []
    };
  }
}

// Fetch chart data from backend (aggregated for all students)
export async function getDashboardChartData() {
  try {
    const [gradeDistribution, genderDistribution, enrollmentTrend, motherTongueDistribution, religionDistribution, campusStats] = await Promise.all([
      apiGet<Array<{ grade: string; count: number }>>(API_ENDPOINTS.STUDENTS_GRADE_DISTRIBUTION),
      apiGet<{ male: number; female: number; other: number }>(API_ENDPOINTS.STUDENTS_GENDER_STATS),
      apiGet<Array<{ year: number; count: number }>>(API_ENDPOINTS.STUDENTS_ENROLLMENT_TREND),
      apiGet<Array<{ name: string; value: number }>>(API_ENDPOINTS.STUDENTS_MOTHER_TONGUE_DISTRIBUTION),
      apiGet<Array<{ name: string; value: number }>>(API_ENDPOINTS.STUDENTS_RELIGION_DISTRIBUTION),
      apiGet<Array<{ campus: string; count: number }>>(API_ENDPOINTS.STUDENTS_CAMPUS_STATS)
    ]);

    // Format gender distribution
    const genderData = [
      { name: 'Male', value: genderDistribution.male },
      { name: 'Female', value: genderDistribution.female },
      { name: 'Other', value: genderDistribution.other }
    ].filter(item => item.value > 0);

    // Format campus performance
    const campusPerformance = campusStats.map(item => ({
      name: item.campus,
      value: item.count
    }));

    return {
      gradeDistribution,
      genderDistribution: genderData,
      enrollmentTrend,
      motherTongueDistribution,
      religionDistribution,
      campusPerformance
    };
  } catch (error) {
    console.error('Failed to fetch dashboard chart data:', error);
    
    // Return empty data on error
    return {
      gradeDistribution: [],
      genderDistribution: [],
      enrollmentTrend: [],
      motherTongueDistribution: [],
      religionDistribution: [],
      campusPerformance: []
    };
  }
}

// Fetch limited students for dashboard (first page only)
export async function getDashboardStudents(pageSize: number = 50) {
  try {
    const data = await apiGet(`${API_ENDPOINTS.STUDENTS}?page=1&page_size=${pageSize}`);
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray((data as any).results)) {
      return (data as any).results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching dashboard students:', error);
    return [];
  }
}

export async function getAllStudents(forceRefresh: boolean = false, shift?: string) {
  try {
    // Try to get from cache first (unless force refresh or shift filter)
    if (!forceRefresh && !shift) {
      const cached = CacheManager.get(CacheManager.KEYS.STUDENTS);
      if (cached) {
        return cached;
      }
    }

    // Fetch all students with pagination
    let allStudents: any[] = [];
    let page = 1;
    let hasNext = true;
    
    while (hasNext) {
      let url = `${API_ENDPOINTS.STUDENTS}?page=${page}&page_size=1000`;
      if (shift) {
        url += `&shift=${encodeURIComponent(shift)}`;
      }
      const data = await apiGet(url);
      
      if (Array.isArray(data)) {
        allStudents = [...allStudents, ...data];
        hasNext = false; // If no pagination, stop
      } else if (data && Array.isArray((data as any).results)) {
        allStudents = [...allStudents, ...(data as any).results];
        hasNext = (data as any).next !== null; // Check if there's a next page
        page++;
      } else {
        hasNext = false;
      }
    }
    
    // Disable caching of huge arrays to prevent quota issues
    // CacheManager.set(CacheManager.KEYS.STUDENTS, allStudents, 10 * 60 * 1000);
    
    return allStudents;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return [];
  }
}

export async function getTeacherStudents() {
  try {
    // Don't use cache for teacher-specific students
    // Backend will filter students based on teacher's assigned classroom
    const data = await apiGet(`${API_ENDPOINTS.STUDENTS}?page=1&page_size=1000`);
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray((data as any).results)) {
      return (data as any).results;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch teacher students:', error);
    return [];
  }
}

export async function getFilteredStudents(params: {
  page?: number;
  page_size?: number;
  search?: string;
  campus?: number;
  current_grade?: string;
  section?: string;
  current_state?: string;
  gender?: string;
  shift?: string;
  classroom?: number;
  ordering?: string;
}): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination params
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    // Add search param
    if (params.search) queryParams.append('search', params.search);
    
    // Add filter params
    if (params.campus) queryParams.append('campus', params.campus.toString());
    if (params.current_grade) queryParams.append('current_grade', params.current_grade);
    if (params.section) queryParams.append('section', params.section);
    if (params.current_state) queryParams.append('current_state', params.current_state);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.shift) queryParams.append('shift', params.shift);
    if (params.classroom) queryParams.append('classroom', params.classroom.toString());
    
    // Add ordering param
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const response = await apiGet(`${API_ENDPOINTS.STUDENTS}?${queryParams.toString()}`);
    return response as {
      count: number;
      next: string | null;
      previous: string | null;
      results: any[];
    };
  } catch (error) {
    console.error('Failed to fetch filtered students:', error);
    return { results: [], count: 0, next: null, previous: null };
  }
}

export async function getAllCampuses() {
  try {
    // Try to get from cache first
    const cached = CacheManager.get(CacheManager.KEYS.CAMPUSES);
    if (cached) {
      console.log('Using cached campuses:', cached);
      return cached;
    }

    console.log('Fetching campuses from API...');
    const data = await apiGet(API_ENDPOINTS.CAMPUS);
    console.log('Raw campus API response:', data);
    
    // Handle different response formats
    let campuses = [];
    if (Array.isArray(data)) {
      campuses = data;
      console.log('Data is direct array:', campuses);
    } else if (data && Array.isArray((data as any).results)) {
      campuses = (data as any).results;
      console.log('Data has results array:', campuses);
    } else if (data && Array.isArray((data as any).data)) {
      campuses = (data as any).data;
      console.log('Data has data array:', campuses);
    } else {
      console.warn('Unexpected campus data format:', data);
      campuses = [];
    }
    
    console.log('Final campuses array:', campuses);
    
    // Only cache if we got valid data
    if (campuses.length > 0) {
      CacheManager.set(CacheManager.KEYS.CAMPUSES, campuses, 30 * 60 * 1000);
    }
    
    return campuses;
  } catch (error) {
    console.error('Failed to fetch campuses:', error);
    // Return empty array instead of throwing error
    return [];
  }
}

export async function getAllTeachers(shift?: string) {
  try {
    // Try to get from cache first (only if no shift filter)
    if (!shift) {
      const cached = CacheManager.get(CacheManager.KEYS.TEACHERS);
      if (cached) {
        return cached;
      }
    }

    // Fetch all teachers with pagination
    let allTeachers: any[] = [];
    let page = 1;
    let hasNext = true;
    
    while (hasNext) {
      let url = `${API_ENDPOINTS.TEACHERS}?page=${page}&page_size=1000`;
      if (shift) {
        url += `&shift=${encodeURIComponent(shift)}`;
      }
      const data = await apiGet(url);
      
      if (Array.isArray(data)) {
        allTeachers = [...allTeachers, ...data];
        hasNext = false; // If no pagination, stop
      } else if (data && Array.isArray((data as any).results)) {
        allTeachers = [...allTeachers, ...(data as any).results];
        hasNext = (data as any).next !== null; // Check if there's a next page
        page++;
      } else {
        hasNext = false;
      }
    }
    
    // Disable caching of huge arrays to prevent quota issues
    // CacheManager.set(CacheManager.KEYS.TEACHERS, allTeachers, 10 * 60 * 1000);
    
    return allTeachers;
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return [];
  }
}

export async function getFilteredTeachers(params: {
  page?: number;
  page_size?: number;
  search?: string;
  current_campus?: number;
  shift?: string;
  is_currently_active?: boolean;
  assigned_coordinator?: number;
  is_class_teacher?: boolean;
  current_subjects?: string;
  ordering?: string;
}): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination params
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    // Add search param
    if (params.search) queryParams.append('search', params.search);
    
    // Add filter params
    if (params.current_campus) queryParams.append('current_campus', params.current_campus.toString());
    if (params.shift) queryParams.append('shift', params.shift);
    if (params.is_currently_active !== undefined) queryParams.append('is_currently_active', params.is_currently_active.toString());
    if (params.assigned_coordinator) queryParams.append('assigned_coordinator', params.assigned_coordinator.toString());
    if (params.is_class_teacher !== undefined) queryParams.append('is_class_teacher', params.is_class_teacher.toString());
    if (params.current_subjects) queryParams.append('current_subjects', params.current_subjects);
    
    // Add ordering param
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const response = await apiGet(`${API_ENDPOINTS.TEACHERS}?${queryParams.toString()}`);
    return response as {
      count: number;
      next: string | null;
      previous: string | null;
      results: any[];
    };
  } catch (error) {
    console.error('Failed to fetch filtered teachers:', error);
    return { results: [], count: 0, next: null, previous: null };
  }
}

export async function getTeacherById(teacherId: string | number) {
  try {
    // Try to get from cache first
    const cached = CacheManager.get(CacheManager.KEYS.TEACHER_PROFILE(Number(teacherId)));
    if (cached) {
      return cached;
    }

    const teacher = await apiGet(`${API_ENDPOINTS.TEACHERS}${teacherId}/`);
    
    // Cache the teacher profile for 15 minutes
    CacheManager.set(CacheManager.KEYS.TEACHER_PROFILE(Number(teacherId)), teacher, 15 * 60 * 1000);
    
    return teacher;
  } catch (error) {
    console.error('Failed to fetch teacher by ID:', error);
    return null;
  }
}


export async function getStudentById(studentId: string | number) {
  try {
    console.log('🔍 getStudentById called with ID:', studentId);
    
    // Try to get from cache first
    const cached = CacheManager.get(CacheManager.KEYS.STUDENT_PROFILE(Number(studentId)));
    if (cached) {
      console.log('✅ Found student in cache:', cached);
      return cached;
    }

    console.log('🌐 Fetching student from API...');
    const url = `${API_ENDPOINTS.STUDENTS}${studentId}/`;
    console.log('🔗 API URL:', url);
    
    const student = await apiGet(url);
    
    console.log('📊 Student data from API:', student);
    
    // Cache the student profile for 15 minutes
    CacheManager.set(CacheManager.KEYS.STUDENT_PROFILE(Number(studentId)), student, 15 * 60 * 1000);
    
    return student;
  } catch (error) {
    console.error('❌ Failed to fetch student by ID:', error);
    return null;
  }
}


// Cache invalidation functions
export function invalidateStudentCache(studentId?: number) {
  if (studentId) {
    CacheManager.remove(CacheManager.KEYS.STUDENT_PROFILE(studentId));
  }
  CacheManager.remove(CacheManager.KEYS.STUDENTS);
}

export function invalidateTeacherCache(teacherId?: number) {
  if (teacherId) {
    CacheManager.remove(CacheManager.KEYS.TEACHER_PROFILE(teacherId));
  }
  CacheManager.remove(CacheManager.KEYS.TEACHERS);
}

export function invalidateCampusCache() {
  CacheManager.remove(CacheManager.KEYS.CAMPUSES);
}

export function clearAllCache() {
  CacheManager.clear();
}
export async function getUsers(role?: string) {
  try {
    const path = role ? `${API_ENDPOINTS.USERS}?role=${encodeURIComponent(role)}` : API_ENDPOINTS.USERS;
    return await apiGet(path);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// Coordinator API
export async function getCoordinatorTeachers(coordinatorId: number) {
  try {
    return await apiGet(`${API_ENDPOINTS.COORDINATORS}${coordinatorId}/teachers/`);
  } catch (error) {
    console.error('Failed to fetch coordinator teachers:', error);
    return { teachers: [], total_teachers: 0 };
  }
}

export async function getCoordinatorGeneralStats(coordinatorId: number) {
  try {
    return await apiGet(`${API_ENDPOINTS.COORDINATORS}${coordinatorId}/dashboard_stats/`);
  } catch (error) {
    console.error('Failed to fetch coordinator dashboard stats:', error);
    return { stats: { total_teachers: 0, total_students: 0, total_classes: 0, pending_requests: 0 } };
  }
}

// Classes API functions

export async function findCoordinatorByEmployeeCode(employeeCode: string) {
  try {
    const response = await apiGet(API_ENDPOINTS.COORDINATORS);
    
    // Handle different response formats
    let coordinators = []
    if (Array.isArray(response)) {
      coordinators = response
    } else if (response && (response as any).results) {
      coordinators = (response as any).results
    } else if (response && Array.isArray((response as any).data)) {
      coordinators = (response as any).data
    }
    
    const foundCoordinator = coordinators.find((coord: any) => coord.employee_code === employeeCode);
    return foundCoordinator || null;
  } catch (error) {
    console.error('Failed to find coordinator by employee code:', error);
    return null;
  }
}

export async function findCoordinatorByEmail(email: string) {
  try {
    const coordinators = await apiGet(API_ENDPOINTS.COORDINATORS);
    if (Array.isArray(coordinators)) {
      return coordinators.find((coord: any) => coord.email === email);
    }
    return null;
  } catch (error) {
    console.error('Failed to find coordinator by email:', error);
    return null;
  }
}

export async function getCampusStudents(campusId: number) {
  try {
    return await apiGet(`${API_ENDPOINTS.STUDENTS}?campus=${campusId}`);
  } catch (error) {
    console.error('Failed to fetch campus students:', error);
    return [];
  }
}

export async function getClassroomStudents(classroomId: number, teacherId?: number) {
  try {
    const url = API_ENDPOINTS.CLASSROOM_STUDENTS.replace('{id}', classroomId.toString());
    const params = teacherId ? `?teacher_id=${teacherId}` : '';
    return await apiGet(url + params);
  } catch (error) {
    console.error('Failed to fetch classroom students:', error);
    return { students: [], total_students: 0 };
  }
}

export async function getAvailableStudentsForClassroom(classroomId: number) {
  try {
    const url = API_ENDPOINTS.AVAILABLE_STUDENTS.replace('{id}', classroomId.toString());
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch available students for classroom:', error);
    return { available_students: [], total_available: 0 };
  }
}

export async function getCurrentUserProfile() {
  try {
    return await apiGet(API_ENDPOINTS.CURRENT_USER_PROFILE);
  } catch (error) {
    console.error('Failed to fetch current user profile:', error);
    return null;
  }
}

export async function getAllCoordinators(shift?: string) {
  try {
    let url = API_ENDPOINTS.COORDINATORS;
    if (shift) {
      url += `?shift=${encodeURIComponent(shift)}`;
    }
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch coordinators:', error);
    return [];
  }
}

// List functions for displaying data

// Level Management APIs
export async function getLevels(campusId?: number) {
  try {
    const url = campusId ? `${API_ENDPOINTS.LEVELS}?campus_id=${campusId}` : API_ENDPOINTS.LEVELS;
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch levels:', error);
    return [];
  }
}

export async function createLevel(data: any) {
  try {
    return await apiPost(API_ENDPOINTS.LEVELS, data);
  } catch (error) {
    console.error('Failed to create level:', error);
    throw error;
  }
}

export async function updateLevel(id: number, data: any) {
  try {
    return await apiPut(`${API_ENDPOINTS.LEVELS}${id}/`, data);
  } catch (error) {
    console.error('Failed to update level:', error);
    throw error;
  }
}

export async function deleteLevel(id: number) {
  try {
    return await apiDelete(`${API_ENDPOINTS.LEVELS}${id}/`);
  } catch (error) {
    console.error('Failed to delete level:', error);
    throw error;
  }
}

// Grade Management APIs
export async function getGrades(levelId?: number, campusId?: number) {
  try {
    let url = API_ENDPOINTS.GRADES;
    const params = new URLSearchParams();
    if (levelId) params.append('level_id', levelId.toString());
    if (campusId) params.append('campus_id', campusId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    return [];
  }
}

export async function createGrade(data: any) {
  try {
    return await apiPost(API_ENDPOINTS.GRADES, data);
  } catch (error) {
    console.error('Failed to create grade:', error);
    throw error;
  }
}

export async function updateGrade(id: number, data: any) {
  try {
    return await apiPut(`${API_ENDPOINTS.GRADES}${id}/`, data);
  } catch (error) {
    console.error('Failed to update grade:', error);
    throw error;
  }
}

export async function deleteGrade(id: number) {
  try {
    return await apiDelete(`${API_ENDPOINTS.GRADES}${id}/`);
  } catch (error) {
    console.error('Failed to delete grade:', error);
    throw error;
  }
}

// Classroom Management APIs
export async function getClassrooms(gradeId?: number, levelId?: number, campusId?: number, shift?: string) {
  try {
    let url = API_ENDPOINTS.CLASSROOMS;
    const params = new URLSearchParams();
    if (gradeId) params.append('grade_id', gradeId.toString());
    if (levelId) params.append('level_id', levelId.toString());
    if (campusId) params.append('campus_id', campusId.toString());
    if (shift) params.append('shift', shift);
    if (params.toString()) url += `?${params.toString()}`;
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch classrooms:', error);
    return [];
  }
}

export async function createClassroom(data: any) {
  try {
    return await apiPost(API_ENDPOINTS.CLASSROOMS, data);
  } catch (error) {
    console.error('Failed to create classroom:', error);
    throw error;
  }
}

export async function updateClassroom(id: number, data: any) {
  try {
    return await apiPut(`${API_ENDPOINTS.CLASSROOMS}${id}/`, data);
  } catch (error) {
    console.error('Failed to update classroom:', error);
    throw error;
  }
}

export async function deleteClassroom(id: number) {
  try {
    return await apiDelete(`${API_ENDPOINTS.CLASSROOMS}${id}/`);
  } catch (error) {
    console.error('Failed to delete classroom:', error);
    throw error;
  }
}

// Teacher Assignment APIs
export async function assignTeacherToClassroom(classroomId: number, teacherId: number) {
  try {
    return await apiPost(`${API_ENDPOINTS.CLASSROOMS}${classroomId}/assign_teacher/`, {
      teacher_id: teacherId
    });
  } catch (error) {
    console.error('Failed to assign teacher to classroom:', error);
    throw error;
  }
}

export async function unassignTeacherFromClassroom(classroomId: number) {
  try {
    return await apiPost(`${API_ENDPOINTS.CLASSROOMS}${classroomId}/unassign_teacher/`, {});
  } catch (error) {
    console.error('Failed to unassign teacher from classroom:', error);
    throw error;
  }
}

export async function getAvailableTeachers(campusId?: number, shift?: string) {
  try {
    let url = `${API_ENDPOINTS.CLASSROOMS}available_teachers/`;
    const params = new URLSearchParams();
    if (campusId) params.append('campus_id', String(campusId));
    if (shift) params.append('shift', shift);
    if (Array.from(params).length > 0) url += `?${params.toString()}`;
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch available teachers:', error);
    return [];
  }
}

// Coordinator Assignment APIs
export async function assignCoordinatorToLevel(levelId: number, coordinatorId: number) {
  try {
    return await apiPost(`${API_ENDPOINTS.LEVELS}${levelId}/assign_coordinator/`, {
      coordinator_id: coordinatorId
    });
  } catch (error) {
    console.error('Failed to assign coordinator to level:', error);
    throw error;
  }
}

export async function getAvailableCoordinators(campusId?: number) {
  try {
    const url = campusId 
      ? `/api/coordinators/?campus_id=${campusId}&level__isnull=true`
      : '/api/coordinators/?level__isnull=true';
    const response = await apiGet(url);
    
    // Handle paginated response - return results array or empty array
    if (response && typeof response === 'object' && 'results' in response) {
      return response.results || [];
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.warn('Unexpected response format from getAvailableCoordinators:', response);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch available coordinators:', error);
    return [];
  }
}



export async function getCampusDashboardStats(campusId: number) {
  try {
    const [students, teachers, campus] = await Promise.all([
      getCampusStudents(campusId),
      getCampusTeachers(campusId),
      getPrincipalCampusData(campusId)
    ]);
    
    return {
      campus,
      totalStudents: Array.isArray(students) ? students.length : 0,
      totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
      students: Array.isArray(students) ? students : [],
      teachers: Array.isArray(teachers) ? teachers : []
    };
  } catch (error) {
    console.error('Failed to fetch campus dashboard stats:', error);
    return {
      campus: null,
      totalStudents: 0,
      totalTeachers: 0,
      students: [],
      teachers: []
    };
  }
}



function getCampusTeachers(_campusId: number): any {
  throw new Error("Function not implemented.");
}

function getPrincipalCampusData(_campusId: number): any {
  throw new Error("Function not implemented.");
}

// Attendance API functions
export async function getTeacherClasses() {
  try {
    return await apiGet('/api/attendance/teacher/classes/');
  } catch (error) {
    console.error('Failed to fetch teacher classes:', error);
    return [];
  }
}

export async function getClassStudents(classroomId: number) {
  try {
    return await apiGet(`/api/attendance/class/${classroomId}/students/`);
  } catch (error) {
    console.error('Failed to fetch class students:', error);
    return [];
  }
}

export async function markBulkAttendance(data: {
  classroom_id: number;
  date: string;
  student_attendance: Array<{
    student_id: number;
    status: string;
    remarks?: string;
  }>;
}) {
  try {
    return await apiPost('/api/attendance/mark-bulk/', data);
  } catch (error) {
    console.error('Failed to mark attendance:', error);
    throw error;
  }
}

export async function getAttendanceHistory(classroomId: number, startDate?: string, endDate?: string) {
  try {
    let url = `/api/attendance/class/${classroomId}/`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch attendance history:', error);
    return [];
  }
}

export async function getAttendanceForDate(classroomId: number, date: string) {
  try {
    // Add cache-busting parameter
    const timestamp = new Date().getTime();
    return await apiGet(`/api/attendance/class/${classroomId}/attendance/${date}/?t=${timestamp}`);
  } catch (error) {
    console.error('Failed to fetch attendance for date:', error);
    return null;
  }
}

export async function editAttendance(attendanceId: number, data: {
  student_attendance: Array<{
    student_id: number;
    status: string;
    remarks?: string;
  }>;
}) {
  try {
    return await apiPut(`/api/attendance/edit/${attendanceId}/`, data);
  } catch (error) {
    console.error('Failed to edit attendance:', error);
    throw error;
  }
}

export async function getCoordinatorClasses() {
  try {
    console.log('API: Fetching coordinator classes...');
    const response = await apiGet('/api/attendance/coordinator/classes/');
    console.log('API: Coordinator classes response:', response);
    return response;
  } catch (error) {
    console.error('API: Failed to fetch coordinator classes:', error);
    return [];
  }
}

export async function getLevelAttendanceSummary(levelId: number, startDate?: string, endDate?: string) {
  try {
    let url = `/api/attendance/level/${levelId}/summary/`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch level attendance summary:', error);
    return null;
  }
}

// Request/Complaint API functions
export interface RequestData {
  category: string;
  subject: string;
  description: string;
  priority?: string;
}

export interface RequestUpdateData {
  status?: string;
  priority?: string;
  coordinator_notes?: string;
  resolution_notes?: string;
}

export async function createRequest(data: RequestData) {
  try {
    return await apiPost('/api/requests/create/', data);
  } catch (error) {
    console.error('Failed to create request:', error);
    throw error;
  }
}

export async function getMyRequests() {
  try {
    return await apiGet('/api/requests/my-requests/');
  } catch (error) {
    console.error('Failed to fetch my requests:', error);
    return [];
  }
}

export async function getRequestDetail(requestId: number) {
  try {
    return await apiGet(`/api/requests/${requestId}/`);
  } catch (error) {
    console.error('Failed to fetch request detail:', error);
    return null;
  }
}

export async function getCoordinatorRequests(filters?: {
  status?: string;
  priority?: string;
  category?: string;
}) {
  try {
    let url = '/api/requests/coordinator/requests/';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (params.toString()) url += `?${params.toString()}`;
    }
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch coordinator requests:', error);
    return [];
  }
}

export async function getCoordinatorDashboardStats(coordinatorId?: number) {
  try {
    if (coordinatorId) {
      return await apiGet(`/api/coordinators/${coordinatorId}/dashboard_stats/`);
    } else {
      // Fallback to requests stats if no coordinator ID provided
      return await apiGet('/api/requests/coordinator/dashboard-stats/');
    }
  } catch (error) {
    console.error('Failed to fetch coordinator dashboard stats:', error);
    return {
      stats: {
        total_teachers: 0,
        total_students: 0,
        total_classes: 0,
        pending_requests: 0,
      }
    };
  }
}

// Result Management API functions
export interface SubjectMark {
  subject_name: string;
  total_marks: number;
  obtained_marks: number;
  has_practical: boolean;
  practical_total?: number;
  practical_obtained?: number;
  is_pass: boolean;
}

export interface ResultData {
  student: number;
  exam_type: 'mid_term' | 'final_term';
  academic_year: string;
  semester: string;
  subject_marks: SubjectMark[];
}

export interface Result {
  id: number;
  student: {
    id: number;
    full_name: string;
    student_code: string;
  };
  teacher: {
    id: number;
    full_name: string;
  };
  coordinator?: {
    id: number;
    full_name: string;
  };
  exam_type: string;
  exam_type_display: string;
  academic_year: string;
  semester: string;
  status: string;
  status_display: string;
  edit_count: number;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  result_status: string;
  result_status_display: string;
  coordinator_comments?: string;
  subject_marks: SubjectMark[];
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  name: string; // Backend uses 'name' field
  full_name?: string; // Keep for backward compatibility
  student_code: string;
  student_id?: string; // Alternative ID field
  gr_no?: string; // Alternative ID field
  roll_number?: string;
  father_name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  gender: string;
  admission_date?: string;
  class_name?: string;
  section?: string;
  campus_name?: string;
}

export interface MidTermCheck {
  student_id: number;
  student_name: string;
  mid_term_exists: boolean;
  mid_term_approved: boolean;
}

export async function createResult(data: ResultData) {
  try {
    return await apiPost('/api/result/create/', data);
  } catch (error) {
    console.error('Failed to create result:', error);
    throw error;
  }
}

// Coordinator Result Functions
export async function getCoordinatorResults() {
  try {
    console.log('🌐 Making API call to /api/result/coordinator/results/');
    console.log('🔑 Current token:', localStorage.getItem('sis_access_token') ? 'Token exists' : 'No token');
    
    const response = await apiGet('/api/result/coordinator/results/');
    console.log('🌐 API response received:', response);
    console.log('🌐 Response type:', typeof response);
    console.log('🌐 Is array?', Array.isArray(response));
    
    // Handle paginated response
    if (response && typeof response === 'object' && 'results' in response) {
      console.log('📄 Paginated response detected, returning results array');
      return response.results;
    }
    
    // Handle direct array response
    if (Array.isArray(response)) {
      console.log('📄 Direct array response detected');
      return response;
    }
    
    console.log('⚠️ Unexpected response format:', response);
    return [];
    
  } catch (error: any) {
    console.error('❌ Failed to fetch coordinator results:', error);
    console.error('❌ Error details:', error?.message);
    console.error('❌ Error status:', error?.status);
    console.error('❌ Error response:', error?.response);
    
    // If it's an authentication error, clear tokens and redirect
    if (error?.status === 401) {
      console.log('🔐 Authentication error detected, clearing tokens');
      localStorage.removeItem('sis_access_token');
      localStorage.removeItem('sis_refresh_token');
      localStorage.removeItem('sis_user');
      window.location.href = '/Universal_Login';
      return [];
    }
    
    throw error;
  }
}

export async function getCoordinatorPendingResults() {
  try {
    return await apiGet('/api/result/coordinator/pending/');
  } catch (error) {
    console.error('Failed to fetch pending results:', error);
    throw error;
  }
}

export async function approveResult(resultId: number, data: { status: string; coordinator_comments: string }) {
  try {
    return await apiPut(`/api/result/${resultId}/approve/`, data);
  } catch (error) {
    console.error('Failed to approve result:', error);
    throw error;
  }
}

export async function rejectResult(resultId: number, data: { status: string; coordinator_comments: string }) {
  try {
    return await apiPut(`/api/result/${resultId}/approve/`, data);
  } catch (error) {
    console.error('Failed to reject result:', error);
    throw error;
  }
}

export async function bulkApproveResults(resultIds: number[], comments: string) {
  try {
    return await apiPost('/api/result/coordinator/results/bulk_approve/', {
      result_ids: resultIds,
      comments: comments
    });
  } catch (error) {
    console.error('Failed to bulk approve results:', error);
    throw error;
  }
}

export async function bulkRejectResults(resultIds: number[], comments: string) {
  try {
    return await apiPost('/api/result/coordinator/results/bulk_reject/', {
      result_ids: resultIds,
      comments: comments
    });
  } catch (error) {
    console.error('Failed to bulk reject results:', error);
    throw error;
  }
}

export async function getMyResults() {
  try {
    return await apiGet('/api/result/my-results/');
  } catch (error) {
    console.error('Failed to fetch my results:', error);
    return [];
  }
}

export async function getResultDetail(resultId: number) {
  try {
    return await apiGet(`/api/result/${resultId}/`);
  } catch (error) {
    console.error('Failed to fetch result detail:', error);
    throw error;
  }
}

export async function updateResult(resultId: number, data: Partial<ResultData>) {
  try {
    return await apiPut(`/api/result/${resultId}/update/`, data);
  } catch (error) {
    console.error('Failed to update result:', error);
    throw error;
  }
}

export async function submitResult(resultId: number) {
  try {
    return await apiPut(`/api/result/${resultId}/submit/`, { status: 'submitted' });
  } catch (error) {
    console.error('Failed to submit result:', error);
    throw error;
  }
}

export async function forwardResult(resultId: number) {
  try {
    return await apiPut(`/api/result/${resultId}/submit/`, { status: 'pending' });
  } catch (error) {
    console.error('Failed to forward result:', error);
    throw error;
  }
}

export async function checkMidTerm(studentId: number): Promise<MidTermCheck> {
  try {
    return await apiGet(`/api/result/check-midterm/${studentId}/`);
  } catch (error) {
    console.error('Failed to check mid-term:', error);
    throw error;
  }
}


export async function updateRequestStatus(requestId: number, data: RequestUpdateData) {
  try {
    return await apiPut(`/api/requests/${requestId}/update-status/`, data);
  } catch (error) {
    console.error('Failed to update request status:', error);
    throw error;
  }
}

export async function addRequestComment(requestId: number, comment: string) {
  try {
    return await apiPost(`/api/requests/${requestId}/comment/`, { comment });
  } catch (error) {
    console.error('Failed to add comment:', error);
    throw error;
  }
}

// Teacher Statistics API functions
export async function getTeacherAttendanceSummary(classroomId: number, startDate?: string, endDate?: string) {
  try {
    let url = `/api/attendance/class/${classroomId}/summary/`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch teacher attendance summary:', error);
    return [];
  }
}

export async function getTeacherWeeklyAttendance(classroomId: number) {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    return await getTeacherAttendanceSummary(classroomId, startDate, endDate);
  } catch (error) {
    console.error('Failed to fetch weekly attendance:', error);
    return [];
  }
}

export async function getTeacherMonthlyTrend(classroomId: number) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1); // Last 6 months
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];
    
    return await getTeacherAttendanceSummary(classroomId, startDate, endDate);
  } catch (error) {
    console.error('Failed to fetch monthly trend:', error);
    return [];
  }
}

export async function getTeacherTodayAttendance(classroomId: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    return await getAttendanceForDate(classroomId, today);
  } catch (error) {
    console.error('Failed to fetch today attendance:', error);
    return null;
  }
}

// Attendance State Management
export async function submitAttendance(attendanceId: number) {
  try {
    return await apiPost(`/api/attendance/submit/${attendanceId}/`, {});
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    throw error;
  }
}

export async function reviewAttendance(attendanceId: number) {
  try {
    return await apiPost(`/api/attendance/review/${attendanceId}/`, {});
  } catch (error) {
    console.error('Failed to review attendance:', error);
    throw error;
  }
}

export async function finalizeAttendance(attendanceId: number) {
  try {
    return await apiPost(`/api/attendance/finalize/${attendanceId}/`, {});
  } catch (error) {
    console.error('Failed to finalize attendance:', error);
    throw error;
  }
}

export async function reopenAttendance(attendanceId: number, reason: string) {
  try {
    return await apiPost(`/api/attendance/reopen/${attendanceId}/`, { reason });
  } catch (error) {
    console.error('Failed to reopen attendance:', error);
    throw error;
  }
}

// Backfill Permission Management
export async function grantBackfillPermission(data: {
  classroom_id: number;
  date: string;
  teacher_id: number;
  reason: string;
  deadline: string;
}) {
  try {
    return await apiPost('/api/attendance/backfill/grant/', data);
  } catch (error) {
    console.error('Failed to grant backfill permission:', error);
    throw error;
  }
}

export async function getBackfillPermissions() {
  try {
    return await apiGet('/api/attendance/backfill/permissions/');
  } catch (error) {
    console.error('Failed to fetch backfill permissions:', error);
    return [];
  }
}

// Holiday Management
export async function createHoliday(data: {
  date: string;
  reason: string;
}) {
  try {
    return await apiPost('/api/attendance/holidays/create/', data);
  } catch (error) {
    console.error('Failed to create holiday:', error);
    throw error;
  }
}

export async function getHolidays(levelId?: number, startDate?: string, endDate?: string) {
  try {
    let url = '/api/attendance/holidays/';
    const params = new URLSearchParams();
    
    if (levelId) params.append('level_id', levelId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    return [];
  }
}

// Real-time Metrics
export async function getRealtimeMetrics() {
  try {
    return await apiGet('/api/attendance/metrics/realtime/');
  } catch (error) {
    console.error('Failed to fetch real-time metrics:', error);
    return { today: '', classrooms: [] };
  }
}

// ==================== TRANSFER MANAGEMENT APIs ====================

export interface TransferRequest {
  id: number;
  request_type: 'student' | 'teacher';
  status: 'draft' | 'pending' | 'approved' | 'declined' | 'cancelled';
  entity_name: string;
  current_id: string;
  from_campus: number;
  from_campus_name: string;
  from_shift: 'M' | 'A';
  to_campus: number;
  to_campus_name: string;
  to_shift: 'M' | 'A';
  requesting_principal: number;
  requesting_principal_name: string;
  receiving_principal: number;
  receiving_principal_name: string;
  student?: number;
  student_name?: string;
  student_id?: string;
  teacher?: number;
  teacher_name?: string;
  teacher_id?: string;
  reason: string;
  requested_date: string;
  notes: string;
  reviewed_at?: string;
  decline_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface IDHistory {
  id: number;
  entity_type: 'student' | 'teacher';
  entity_name: string;
  student?: number;
  teacher?: number;
  old_id: string;
  old_campus_code: string;
  old_shift: string;
  old_year: string;
  new_id: string;
  new_campus_code: string;
  new_shift: string;
  new_year: string;
  immutable_suffix: string;
  transfer_request: number;
  changed_by: number;
  changed_by_name: string;
  change_reason: string;
  changed_at: string;
}

export interface IDPreview {
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

// Transfer Request APIs
export async function createTransferRequest(data: {
  request_type: 'student' | 'teacher';
  from_campus: number;
  from_shift: 'M' | 'A';
  to_campus: number;
  to_shift: 'M' | 'A';
  student?: number;
  teacher?: number;
  reason: string;
  requested_date: string;
  notes?: string;
  transfer_type?: 'campus' | 'shift';
}) {
  try {
    return await apiPost('/api/transfers/request/', data);
  } catch (error) {
    console.error('Failed to create transfer request:', error);
    throw error;
  }
}

export async function getTransferRequests(params?: {
  type?: 'student' | 'teacher';
  status?: 'draft' | 'pending' | 'approved' | 'declined' | 'cancelled';
  direction?: 'all' | 'outgoing' | 'incoming';
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.direction) queryParams.append('direction', params.direction);
    
    const url = `/api/transfers/request/list/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGet(url);
  } catch (error) {
    console.error('Failed to fetch transfer requests:', error);
    return [];
  }
}

export async function getTransferRequest(requestId: number) {
  try {
    return await apiGet(`/api/transfers/request/${requestId}/`);
  } catch (error) {
    console.error('Failed to fetch transfer request:', error);
    throw error;
  }
}

export async function approveTransfer(requestId: number) {
  try {
    return await apiPost(`/api/transfers/request/${requestId}/approve/`, {});
  } catch (error) {
    console.error('Failed to approve transfer:', error);
    throw error;
  }
}

export async function declineTransfer(requestId: number, reason: string) {
  try {
    return await apiPost(`/api/transfers/request/${requestId}/decline/`, {
      action: 'decline',
      reason: reason
    });
  } catch (error) {
    console.error('Failed to decline transfer:', error);
    throw error;
  }
}

export async function cancelTransfer(requestId: number) {
  try {
    return await apiPost(`/api/transfers/request/${requestId}/cancel/`, {});
  } catch (error) {
    console.error('Failed to cancel transfer:', error);
    throw error;
  }
}

// ID History APIs
export async function getIDHistory(entityType: 'student' | 'teacher', entityId: number) {
  try {
    return await apiGet(`/api/transfers/history/${entityType}/${entityId}/`);
  } catch (error) {
    console.error('Failed to fetch ID history:', error);
    return [];
  }
}

export async function searchByOldID(oldId: string) {
  try {
    return await apiGet(`/api/transfers/search-by-old-id/?id=${encodeURIComponent(oldId)}`);
  } catch (error) {
    console.error('Failed to search by old ID:', error);
    throw error;
  }
}

// ID Preview API
export async function previewIDChange(data: {
  old_id: string;
  new_campus_code: string;
  new_shift: 'M' | 'A';
  new_role?: string;
}) {
  try {
    return await apiPost('/api/transfers/preview-id-change/', data);
  } catch (error) {
    console.error('Failed to preview ID change:', error);
    throw error;
  }
}

