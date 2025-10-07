export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  }
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";
}

// API endpoints
export const API_ENDPOINTS = {
  STUDENTS: "/api/students/",
  STUDENTS_TOTAL: "/api/students/total/",
  STUDENTS_GENDER_STATS: "/api/students/gender_stats/",
  STUDENTS_CAMPUS_STATS: "/api/students/campus_stats/",
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
  const url = `${base}${path}`;

  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers, credentials: 'omit' });

  if (res.status !== 401) return res;

  // Attempt token refresh once
  if (!alreadyRetried) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshRes = await fetch(`${base}${API_ENDPOINTS.AUTH_REFRESH}`, {
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
  const res = await fetch(`${base}${API_ENDPOINTS.AUTH_LOGIN}`, {
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
    const res = await authorizedFetch(path, {
      method: "GET",
      headers: { "Accept": "application/json" },
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

export async function getAllStudents() {
  try {
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
    
    return allStudents;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return [];
  }
}

export async function getAllCampuses() {
  try {
    return await apiGet(API_ENDPOINTS.CAMPUS);  // ✅ Use main endpoint
  } catch (error) {
    console.error('Failed to fetch campuses:', error);
    return [];
  }
}

export async function getAllTeachers() {
  try {
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
    
    return allTeachers;
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return [];
  }
}

export async function getTeacherById(teacherId: string | number) {
  try {
    const teacher = await apiGet(`${API_ENDPOINTS.TEACHERS}${teacherId}/`);
    return teacher;
  } catch (error) {
    console.error('Failed to fetch teacher by ID:', error);
    return null;
  }
}


// Users API
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

<<<<<<< HEAD
// Classes API functions
=======
export async function findCoordinatorByEmail(email: string) {
  try {
    const response = await apiGet(API_ENDPOINTS.COORDINATORS);
    
    // Handle paginated response
    let coordinators: any[] = [];
    if (Array.isArray(response)) {
      coordinators = response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).results)) {
      coordinators = (response as any).results;
    } else {
      coordinators = [];
    }
    
    const coordinator = coordinators.find((c: any) => c.email === email);
    return coordinator || null;
  } catch (error) {
    console.error('Failed to find coordinator by email:', error);
    return null;
  }
}

>>>>>>> f6d7b1692105971a2e74d072cde03fa573152e5d

export async function createLevel(levelData: any) {
  try {
    return await apiPost(API_ENDPOINTS.LEVELS, levelData);
  } catch (error) {
    console.error('Failed to create level:', error);
    throw error;
  }
}

export async function createGrade(gradeData: any) {
  try {
    return await apiPost(API_ENDPOINTS.GRADES, gradeData);
  } catch (error) {
    console.error('Failed to create grade:', error);
    throw error;
  }
}

export async function createClassroom(classroomData: any) {
  try {
    return await apiPost(API_ENDPOINTS.CLASSROOMS, classroomData);
  } catch (error) {
    console.error('Failed to create classroom:', error);
    throw error;
  }
}

export async function getLevelChoices() {
  try {
    return await apiGet(API_ENDPOINTS.LEVEL_CHOICES);
  } catch (error) {
    console.error('Failed to fetch level choices:', error);
    return { campuses: [], coordinators: [] };
  }
}

export async function getGradeChoices() {
  try {
    return await apiGet(API_ENDPOINTS.GRADE_CHOICES);
  } catch (error) {
    console.error('Failed to fetch grade choices:', error);
    return { levels: [] };
  }
}

export async function getClassroomChoices() {
  try {
    return await apiGet(API_ENDPOINTS.CLASSROOM_CHOICES);
  } catch (error) {
    console.error('Failed to fetch classroom choices:', error);
    return { grades: [], teachers: [], sections: [] };
  }
}

export async function getClassroomSections() {
  try {
    return await apiGet(API_ENDPOINTS.CLASSROOM_SECTIONS);
  } catch (error) {
    console.error('Failed to fetch classroom sections:', error);
    return [];
  }
}

// List functions for displaying data

export async function getLevels() {
  try {
    console.log('Fetching levels from:', API_ENDPOINTS.LEVELS);
    const response = await apiGet(API_ENDPOINTS.LEVELS);
    console.log('Levels raw response:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch levels:', error);
    return [];
  }
}

export async function getGrades() {
  try {
    console.log('Fetching grades from:', API_ENDPOINTS.GRADES);
    const response = await apiGet(API_ENDPOINTS.GRADES);
    console.log('Grades raw response:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    return [];
  }
}

export async function getClassrooms() {
  try {
    console.log('Fetching classrooms from:', API_ENDPOINTS.CLASSROOMS);
    const response = await apiGet(API_ENDPOINTS.CLASSROOMS);
    console.log('Classrooms raw response:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch classrooms:', error);
    return [];
  }
}

