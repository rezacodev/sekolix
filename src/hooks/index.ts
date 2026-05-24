/**
 * Custom Hooks Index
 *
 * Re-exports all custom hooks organized by category
 */

// Authentication and Session
export { useAuth } from "./useAuth";

// Theme Management
export { useTheme } from "./useTheme";

// Form Management
export { useForm } from "./useForm";

// Data Fetching
export { useFetch } from "./useFetch";

// Breadcrumb Management
export { useBreadcrumb } from "./useBreadcrumb";

// Admin Hooks
export * from "./admin";

// Teacher-specific Hooks
export { useTeacherClasses, useTeacherRombels, useTeacherSubjects } from "./useTeacherClasses";
export type { TeacherClass, TeacherClassSubject, TeacherClassSchedule } from "./useTeacherClasses";

export { useStudentData, useFilteredStudents } from "./useStudentData";
export type { StudentBasic } from "./useStudentData";

export { useGrading } from "./useGrading";
export type { GradeEntry, RubricDef } from "./useGrading";

export { useAttendance, ATTENDANCE_OPTIONS } from "./useAttendance";
export type { AttendanceStatus, AttendanceRecord, AttendanceSession } from "./useAttendance";

export { useAssignments, useAssignmentsSummary } from "./useAssignments";
export type { Assignment, AssignmentStatus } from "./useAssignments";
