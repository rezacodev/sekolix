// Notification Service untuk menangani berbagai jenis notifikasi
// E-mail notifications (mock), in-app notifications, dan reminders

import { Notification, NotificationType } from "@/contexts/student/NotificationProvider";
import type React from "react";
import { BookOpen, Bell, Award, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export type NotificationEvent = 
  | "assignment_new"
  | "grade_released"
  | "exam_scheduled"
  | "exam_reminder"
  | "material_released"
  | "forum_reply"
  | "attendance_warning"
  | "custom";

export interface NotificationPayload {
  event: NotificationEvent;
  userId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function notificationType(value: unknown): NotificationType {
  return value === "success" || value === "error" || value === "warning" || value === "info"
    ? value
    : "info";
}

export class NotificationService {
  /**
   * Generate notification based on event type
   * Use with NotificationProvider's addNotification method
   */
  static generateNotification(
    event: NotificationEvent,
    data: Record<string, unknown>
  ): Omit<Notification, "id" | "timestamp"> {
    switch (event) {
      case "assignment_new":
        return {
          type: "info",
          title: "Tugas Baru",
          message: `Tugas baru: "${text(data.assignmentName)}" di ${text(data.className)}. Deadline: ${text(data.deadline)}`,
          icon: <BookOpen className="w-5 h-5" />,
          action: {
            label: "Lihat Tugas",
            href: `/student/kelas/${text(data.classId)}/tugas`,
          },
          duration: 7000,
        };

      case "grade_released":
        return {
          type: "success",
          title: "Nilai Keluar",
          message: `Nilai untuk "${text(data.assignmentName)}" sudah diumumkan. Skor: ${text(data.score)}/${text(data.maxScore)}`,
          icon: <Award className="w-5 h-5" />,
          action: {
            label: "Lihat Nilai",
            href: `/student/nilai`,
          },
          duration: 7000,
        };

      case "exam_scheduled":
        return {
          type: "warning",
          title: "Ujian Dijadwalkan",
          message: `Ujian "${text(data.examName)}" dijadwalkan ${text(data.examDate)} pukul ${text(data.examTime)}`,
          icon: <Calendar className="w-5 h-5" />,
          action: {
            label: "Lihat Detail",
            href: `/student/ujian`,
          },
          duration: 7000,
        };

      case "exam_reminder":
        return {
          type: "warning",
          title: "Pengingat Ujian",
          message: `Ujian "${text(data.examName)}" akan dimulai dalam ${text(data.hoursUntil)} jam.`,
          icon: <Bell className="w-5 h-5" />,
          duration: 0, // Don't auto-dismiss
          dismissible: true,
        };

      case "material_released":
        return {
          type: "info",
          title: "Materi Baru Tersedia",
          message: `Materi pembelajaran "${text(data.materialName)}" sudah dipublikasikan di ${text(data.className)}`,
          icon: <BookOpen className="w-5 h-5" />,
          action: {
            label: "Pelajari",
            href: `/student/kelas/${text(data.classId)}/materi`,
          },
          duration: 7000,
        };

      case "forum_reply":
        return {
          type: "info",
          title: "Balasan Forum",
          message: `${text(data.replierName)} membalas pertanyaan Anda di forum ${text(data.className)}`,
          icon: <Bell className="w-5 h-5" />,
          action: {
            label: "Baca Balasan",
            href: `/student/kelas/${text(data.classId)}/forum`,
          },
          duration: 7000,
        };

      case "attendance_warning":
        return {
          type: "warning",
          title: "Perhatian Kehadiran",
          message: `Kehadiran Anda di ${text(data.className)} rendah. Silakan tingkatkan kehadiran Anda.`,
          icon: <AlertCircle className="w-5 h-5" />,
          duration: 0,
          dismissible: true,
        };

      case "custom":
        return {
          type: notificationType(data.type),
          title: text(data.title) || "Notifikasi",
          message: text(data.message),
          icon: data.icon as React.ReactNode,
          action: data.action as Notification["action"],
          duration: typeof data.duration === "number" ? data.duration : 5000,
        };

      default:
        return {
          type: "info",
          title: "Notifikasi",
          message: "Ada notifikasi baru",
          duration: 5000,
        };
    }
  }

  /**
   * Send email notification (mock implementation)
   * In production, this would call an API endpoint to send actual emails
   */
  static async sendEmailNotification(
    email: string,
    event: NotificationEvent,
    data: Record<string, unknown>
  ): Promise<boolean> {
    console.log(`[Email Notification] Sending to ${email}:`, event, data);

    // Mock: simulate email sending delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Email Notification] Email sent to ${email}`);
        resolve(true);
      }, 500);
    });
  }

  /**
   * Schedule email reminder (H-1 before exam)
   * In production, this would use a job queue (Bull, Agenda, etc.)
   */
  static scheduleExamReminder(
    email: string,
    examName: string,
    examDateTime: Date
  ): void {
    const now = new Date();
    const oneHourBefore = new Date(examDateTime.getTime() - 60 * 60 * 1000);

    if (now < oneHourBefore) {
      const delayMs = oneHourBefore.getTime() - now.getTime();
      console.log(
        `[Exam Reminder] Scheduled for ${email} in ${delayMs / 1000 / 60} minutes`
      );

      setTimeout(() => {
        this.sendEmailNotification(email, "exam_reminder", {
          examName,
          examDateTime: examDateTime.toLocaleString("id-ID"),
          hoursUntil: 1,
        });
      }, delayMs);
    }
  }

  /**
   * Poll and fetch new notifications (simulating real-time updates)
   * In production, this would use WebSocket or Server-Sent Events
   */
  static async pollNotifications(userId: string): Promise<NotificationPayload[]> {
    console.log(`[Notification Poll] No notification source configured for ${userId}`);
    return [];
  }
}
