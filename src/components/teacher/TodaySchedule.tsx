import { Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleItem {
  id: string;
  subject: string;
  class: string;
  time: string;
  room: string;
  status: "upcoming" | "ongoing" | "completed";
}

interface TodayScheduleProps {
  schedules: ScheduleItem[];
}

export default function TodaySchedule({ schedules }: TodayScheduleProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Akan Datang</Badge>;
      case "ongoing":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sedang Berlangsung</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Selesai</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Jadwal Mengajar Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal mengajar hari ini</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{schedule.subject}</h4>
                    {getStatusBadge(schedule.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{schedule.class}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{schedule.room}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
