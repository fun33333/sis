import { gql } from '@apollo/client';

// ============================
// Attendance Mutations
// ============================

export const MARK_ATTENDANCE = gql`
  mutation MarkAttendance($input: MarkAttendanceInput!) {
    markAttendance(input: $input) {
      success
      message
      attendance {
        id
        date
        classroomName
        totalStudents
        presentCount
        absentCount
        lateCount
        leaveCount
        attendancePercentage
        isEditable
        studentAttendances {
          edges {
            node {
              id
              status
              remarks
              studentName
              studentCode
              studentPhoto
            }
          }
        }
      }
    }
  }
`;

export const EDIT_ATTENDANCE = gql`
  mutation EditAttendance($input: EditAttendanceInput!) {
    editAttendance(input: $input) {
      success
      message
      attendance {
        id
        date
        classroomName
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
            }
          }
        }
      }
    }
  }
`;

export const DELETE_ATTENDANCE = gql`
  mutation DeleteAttendance($attendanceId: Int!, $reason: String!) {
    deleteAttendance(attendanceId: $attendanceId, reason: $reason) {
      success
      message
    }
  }
`;

// ============================
// Authentication Mutations
// ============================

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    tokenAuth(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation VerifyToken($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;


