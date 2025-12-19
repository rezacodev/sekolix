/**
 * SPMB (Student Admission) types
 */

export type ApplicantStatus = 'pending' | 'verified' | 'rejected' | 'approved';

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nikHash?: string;
  nikMask?: string;
  schoolOrigin: string;
  program: string;
  status: ApplicantStatus;
  paymentStatus: 'pending' | 'verified' | 'rejected';
  registrationDate: Date;
  updatedAt: Date;
}

export interface CreateApplicantInput {
  fullName: string;
  email: string;
  phone: string;
  nik?: string;
  schoolOrigin: string;
  program: string;
}

export interface UpdateApplicantInput {
  fullName?: string;
  email?: string;
  phone?: string;
  schoolOrigin?: string;
  program?: string;
  status?: ApplicantStatus;
  paymentStatus?: 'pending' | 'verified' | 'rejected';
}

export interface SPMBProgram {
  id: string;
  name: string;
  description?: string;
  quota?: number;
  registrationFee?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
