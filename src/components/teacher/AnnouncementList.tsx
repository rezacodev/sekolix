import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "high" | "normal" | "low";
  date: string;
  from: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
}

export default function AnnouncementList({ announcements }: AnnouncementListProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">Penting</Badge>;
      case "normal":
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Normal</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs">Info</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Pengumuman & Notifikasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pengumuman baru</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(announcement.priority)}
                    <span className="text-xs text-muted-foreground">{announcement.date}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-sm mb-1">{announcement.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                <p className="text-xs text-muted-foreground">Dari: {announcement.from}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
