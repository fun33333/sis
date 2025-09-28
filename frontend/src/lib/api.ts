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

//post api call for creating a new campus;
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
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
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "omit",
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
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, { method: "DELETE", credentials: "omit" });
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
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
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
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
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
    return await apiGet(API_ENDPOINTS.STUDENTS);
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return [];
  }
}

export async function getAllCampuses() {
  try {
    return await apiGet(API_ENDPOINTS.CAMPUS_ACTIVE);
  } catch (error) {
    console.error('Failed to fetch campuses:', error);
    return [];
  }
}



