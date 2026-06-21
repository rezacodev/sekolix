// Notification Service untuk menangani berbagai jenis notifikasi
// E-mail notifications (mock), in-app notifications, dan reminders

import { Notification } from "@/contexts/student/NotificationProvider";
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
  data: Record<string, any>;
  timestamp: Date;
}

export class NotificationService {
  /**
   * Generate notification based on event type
   * Use with NotificationProvider's addNotification method
   */
  static generateNotification(
    event: NotificationEvent,
    data: Record<string, any>
  ): Omit<Notification, "id" | "timestamp"> {
    switch (event) {
      case "assignment_new":
        return {
          type: "info",
          title: "Tugas Baru",
          message: `Tugas baru: "${data.assignmentName}" di ${data.className}. Deadline: ${data.deadline}`,
          icon: <BookOpen className="w-5 h-5" />,
          action: {
            label: "Lihat Tugas",
            href: `/student/kelas/${data.classId}/tugas`,
          },
          duration: 7000,
        };

      case "grade_released":
        return {
          type: "success",
          title: "Nilai Keluar",
          message: `Nilai untuk "${data.assignmentName}" sudah diumumkan. Skor: ${data.score}/${data.maxScore}`,
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
          message: `Ujian "${data.examName}" dijadwalkan ${data.examDate} pukul ${data.examTime}`,
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
          message: `Ujian "${data.examName}" akan dimulai dalam ${data.hoursUntil} jam.`,
          icon: <Bell className="w-5 h-5" />,
          duration: 0, // Don't auto-dismiss
          dismissible: true,
        };

      case "material_released":
        return {
          type: "info",
          title: "Materi Baru Tersedia",
          message: `Materi pembelajaran "${data.materialName}" sudah dipublikasikan di ${data.className}`,
          icon: <BookOpen className="w-5 h-5" />,
          action: {
            label: "Pelajari",
            href: `/student/kelas/${data.classId}/materi`,
          },
          duration: 7000,
        };

      case "forum_reply":
        return {
          type: "info",
          title: "Balasan Forum",
          message: `${data.replierName} membalas pertanyaan Anda di forum ${data.className}`,
          icon: <Bell className="w-5 h-5" />,
          action: {
            label: "Baca Balasan",
            href: `/student/kelas/${data.classId}/forum`,
          },
          duration: 7000,
        };

      case "attendance_warning":
        return {
          type: "warning",
          title: "Perhatian Kehadiran",
          message: `Kehadiran Anda di ${data.className} rendah. Silakan tingkatkan kehadiran Anda.`,
          icon: <AlertCircle className="w-5 h-5" />,
          duration: 0,
          dismissible: true,
        };

      case "custom":
        return {
          type: data.type || "info",
          title: data.title || "Notifikasi",
          message: data.message || "",
          icon: data.icon,
          action: data.action,
          duration: data.duration ?? 5000,
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
    data: Record<string, any>
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
    // Mock: return random notification
    const notifications: NotificationPayload[] = [];
    const randomEvent = Math.random();

    if (randomEvent < 0.3) {
      notifications.push({
        event: "assignment_new",
        userId,
        data: {
          assignmentName: "Essay: Dampak Globalisasi",
          className: "XI IPA 1",
          classId: "kelas-1",
          deadline: "10 Juni 2026",
        },
        timestamp: new Date(),
      });
    } else if (randomEvent < 0.6) {
      notifications.push({
        event: "grade_released",
        userId,
        data: {
          assignmentName: "Quiz Matematika",
          score: 92,
          maxScore: 100,
        },
        timestamp: new Date(),
      });
    } else if (randomEvent < 0.9) {
      notifications.push({
        event: "exam_scheduled",
        userId,
        data: {
          examName: "PAS Fisika",
          examDate: "15 Juni 2026",
          examTime: "08:00",
        },
        timestamp: new Date(),
      });
    }

    return notifications;
  }
}
