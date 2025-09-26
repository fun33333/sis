export interface Student {
  rawData: any
  studentId: string
  name: string
  academicYear: number
  campus: string
  grade: string
  gender: "Male" | "Female" | "Other"
  motherTongue: string
  religion: string
  attendancePercentage: number
  averageScore: number
  retentionFlag: boolean
  enrollmentDate: Date
}
  
  export interface FilterState {
    academicYears: number[]
    campuses: string[]
    grades: string[]
    genders: ("Male" | "Female" | "Other")[]
    motherTongues: string[]
    religions: string[]
  }
  
  export interface DashboardMetrics {
    totalStudents: number
    averageAttendance: number
    averageScore: number
    retentionRate: number
  }
  
  export interface ChartData {
    name: string
    value: number
    fill?: string
  }
  
  export interface TrendData {
    year: number
    enrollment: number
    retention: number
  }

export type CampusStatus = "active" | "inactive" | "temporary_closed";

export type CampusCreateRequest = {
  name: string;
  code: string | null;
  status: CampusStatus;
  governing_body: string | null;
  registration_no: string | null;
  address: string;
  grades_offered: string;
  languages_of_instruction: string;
  academic_year_start_month: number;
  academic_year_end_month?: number | null;
  capacity: number;
  avg_class_size: number;
  num_students: number;
  num_students_male: number;
  num_students_female: number;
  num_teachers: number;
  num_teachers_male: number;
  num_teachers_female: number;
  num_rooms: number;
  total_classrooms: number;
  office_rooms: number;
  biology_labs: number;
  chemistry_labs: number;
  physics_labs: number;
  computer_labs: number;
  library: boolean;
  toilets_male: number;
  toilets_female: number;
  toilets_teachers: number;
  facilities: string | null;
  power_backup: boolean;
  internet_wifi: boolean;
  established_date: string | null; // YYYY-MM-DD
  campus_address: string | null;
  special_classes: string | null;
  total_teachers: number;
  total_non_teaching_staff: number;
  // teacher_student_ratio removed
  staff_contact_hr: string | null;
  admission_office_contact: string | null;
  photo?: string | null;
  is_draft: boolean;
};
  