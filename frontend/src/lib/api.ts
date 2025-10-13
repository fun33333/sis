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
  CLASSROOM_STUDENTS: "/api/class/{id}/students/",
  AVAILABLE_STUDENTS: "/api/class/{id}/available-students/",
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
  const errorMessage = `API Error (${response.status}): ${response.statusText}`;
  console.error(errorMessage, errorText);
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
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers, credentials: 'omit' });

  if (res.status !== 401) return res;

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
export async function loginWithEmailPassword(email: string, password: string) {
  const base = getApiBaseUrl();
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const res = await fetch(`${cleanBase}${API_ENDPOINTS.AUTH_LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
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
  }
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

export async function getAllStudents() {
  try {
    // Try to get from cache first
    const cached = CacheManager.get(CacheManager.KEYS.STUDENTS);
    if (cached) {
      return cached;
    }

    // Fetch all students with pagination
    let allStudents: any[] = [];
    let page = 1;
    let hasNext = true;
    
    while (hasNext) {
      const data = await apiGet(`${API_ENDPOINTS.STUDENTS}?page=${page}&page_size=1000`);
      
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
    
    // Cache the results for 10 minutes
    CacheManager.set(CacheManager.KEYS.STUDENTS, allStudents, 10 * 60 * 1000);
    
    return allStudents;
  } catch (error) {
    console.error('Failed to fetch students:', error);
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
      return cached;
    }

    const data = await apiGet(API_ENDPOINTS.CAMPUS);
    
    // Cache the results for 30 minutes (campuses don't change often)
    CacheManager.set(CacheManager.KEYS.CAMPUSES, data, 30 * 60 * 1000);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch campuses:', error);
    return [];
  }
}

export async function getAllTeachers() {
  try {
    // Try to get from cache first
    const cached = CacheManager.get(CacheManager.KEYS.TEACHERS);
    if (cached) {
      return cached;
    }

    // Fetch all teachers with pagination
    let allTeachers: any[] = [];
    let page = 1;
    let hasNext = true;
    
    while (hasNext) {
      const data = await apiGet(`${API_ENDPOINTS.TEACHERS}?page=${page}&page_size=1000`);
      
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
    
    // Cache the results for 10 minutes
    CacheManager.set(CacheManager.KEYS.TEACHERS, allTeachers, 10 * 60 * 1000);
    
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

export async function getCoordinatorDashboardStats(coordinatorId: number) {
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

export async function createLevel(levelData: any) {
  try {
    return await apiPost(API_ENDPOINTS.LEVELS, levelData);
  } catch (error) {
    console.error('Failed to create level:', error);
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

export async function getAllCoordinators() {
  try {
    return await apiGet(API_ENDPOINTS.COORDINATORS);
  } catch (error) {
    console.error('Failed to fetch coordinators:', error);
    return [];
  }
}

// List functions for displaying data

export async function getLevels() {
  try {
    return await apiGet(API_ENDPOINTS.LEVELS);
  } catch (error) {
    console.error('Failed to fetch levels:', error);
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
    return await apiGet('/api/teacher/classes/');
  } catch (error) {
    console.error('Failed to fetch teacher classes:', error);
    return [];
  }
}

export async function getClassStudents(classroomId: number) {
  try {
    return await apiGet(`/api/class/${classroomId}/students/`);
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
    return await apiPost('/api/mark-bulk/', data);
  } catch (error) {
    console.error('Failed to mark attendance:', error);
    throw error;
  }
}

export async function getAttendanceHistory(classroomId: number, startDate?: string, endDate?: string) {
  try {
    let url = `/api/class/${classroomId}/`;
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
    return await apiGet(`/api/class/${classroomId}/attendance/${date}/`);
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
    return await apiPut(`/api/edit/${attendanceId}/`, data);
  } catch (error) {
    console.error('Failed to edit attendance:', error);
    throw error;
  }
}

export async function getCoordinatorClasses() {
  try {
    return await apiGet('/api/coordinator/classes/');
  } catch (error) {
    console.error('Failed to fetch coordinator classes:', error);
    return [];
  }
}

export async function getLevelAttendanceSummary(levelId: number, startDate?: string, endDate?: string) {
  try {
    let url = `/api/level/${levelId}/summary/`;
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

// Teacher Statistics API functions
export async function getTeacherAttendanceSummary(classroomId: number, startDate?: string, endDate?: string) {
  try {
    let url = `/api/class/${classroomId}/summary/`;
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
