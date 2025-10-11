import { gql } from '@apollo/client';

// ============================
// Attendance Queries
// ============================

export const GET_TEACHER_CLASSES = gql`
  query GetTeacherClasses {
    teacherClasses
  }
`;

export const GET_CLASSROOM_ATTENDANCES = gql`
  query GetClassroomAttendances(
    $classroomId: Int!
    $startDate: Date
    $endDate: Date
  ) {
    classroomAttendances(
      classroomId: $classroomId
      startDate: $startDate
      endDate: $endDate
    ) {
      edges {
        node {
          id
          date
          classroomName
          markedByName
          totalStudents
          presentCount
          absentCount
          lateCount
          leaveCount
          attendancePercentage
          isEditable
          editHistory
          studentAttendances {
            edges {
              node {
                id
                status
                remarks
                studentName
                studentCode
                studentPhoto
                isEditable
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_STUDENT_ATTENDANCES = gql`
  query GetStudentAttendances(
    $studentId: Int!
    $startDate: Date
    $endDate: Date
  ) {
    studentAttendances(
      studentId: $studentId
      startDate: $startDate
      endDate: $endDate
    ) {
      edges {
        node {
          id
          status
          remarks
          studentName
          studentCode
          studentPhoto
          attendance {
            id
            date
            classroomName
            markedByName
          }
        }
      }
    }
  }
`;

export const GET_ATTENDANCE_STATS = gql`
  query GetAttendanceStats(
    $classroomId: Int
    $studentId: Int
    $startDate: Date
    $endDate: Date
  ) {
    attendanceStats(
      classroomId: $classroomId
      studentId: $studentId
      startDate: $startDate
      endDate: $endDate
    ) {
      totalDays
      presentDays
      absentDays
      lateDays
      leaveDays
      attendancePercentage
      consecutiveAbsentDays
      lastAttendanceDate
      monthlyStats
    }
  }
`;

export const GET_ALL_ATTENDANCES = gql`
  query GetAllAttendances(
    $classroomId: Int
    $startDate: Date
    $endDate: Date
  ) {
    allAttendances(
      classroomId: $classroomId
      startDate: $startDate
      endDate: $endDate
    ) {
      edges {
        node {
          id
          date
          classroomName
          markedByName
          totalStudents
          presentCount
          absentCount
          lateCount
          leaveCount
          attendancePercentage
          isEditable
          editHistory
        }
      }
    }
  }
`;

// ============================
// Student Queries
// ============================

export const GET_STUDENTS_BY_CLASSROOM = gql`
  query GetStudentsByClassroom($classroomId: Int!) {
    allStudents(classroomId: $classroomId) {
      id
      name
      studentCode
      grNo
      photo
      gender
      classroom {
        id
        name
      }
    }
  }
`;

// ============================
// Classroom Queries
// ============================

export const GET_CLASSROOM_DETAILS = gql`
  query GetClassroomDetails($classroomId: Int!) {
    allClassrooms(id: $classroomId) {
      id
      name
      code
      grade {
        name
      }
      section
      shift
      campus {
        campusName
      }
      classTeacher {
        fullName
        employeeCode
      }
    }
  }
`;

