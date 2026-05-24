import { ClipboardList, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PendingTask {
  id: string;
  type: "koreksi" | "absensi" | "nilai";
  title: string;
  class: string;
  deadline?: string;
  count: number;
}

interface PendingTasksProps {
  tasks: PendingTask[];
}

export default function PendingTasks({ tasks }: PendingTasksProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "koreksi":
        return { label: "Koreksi Tugas", color: "bg-orange-50 text-orange-700 border-orange-200" };
      case "absensi":
        return { label: "Isi Absensi", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "nilai":
        return { label: "Input Nilai", color: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: type, color: "bg-gray-50 text-gray-700 border-gray-200" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Tugas Pending
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada tugas pending</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const typeInfo = getTypeLabel(task.type);
              return (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{task.deadline}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.class}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600">{task.count}</span>
                    <p className="text-xs text-muted-foreground">item</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
