"use client";

import { useNotification } from "@/contexts/student/NotificationProvider";
import { NotificationService, NotificationEvent } from "@/lib/notification-service";

/**
 * Hook to easily trigger notifications
 * Usage in components:
 * const { notify } = useNotificationHandler();
 * notify("assignment_new", { assignmentName: "...", className: "..." })
 */
export function useNotificationHandler() {
  const { addNotification } = useNotification();

  const notify = (event: NotificationEvent, data: Record<string, any>) => {
    const notification = NotificationService.generateNotification(event, data);
    const id = addNotification(notification);
    return id;
  };

  return { notify };
}
