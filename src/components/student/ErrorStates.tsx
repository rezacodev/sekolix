"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ReactNode } from "react";

export function ErrorBoundary({
  children,
  onReset,
}: {
  children: ReactNode;
  onReset?: () => void;
}) {
  return <>{children}</>;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Silakan coba lagi nanti",
  onRetry,
  showRetry = true,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="flex items-center justify-center min-h-96 py-12">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message}
            </p>
          </div>
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="mt-4 gap-2">
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title = "Tidak Ada Data",
  message = "Data yang Anda cari tidak tersedia",
  action,
}: {
  icon: React.ComponentType<{ className: string }>;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex items-center justify-center min-h-96 py-12">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message}
            </p>
          </div>
          {action && (
            <Button onClick={action.onClick} variant="outline" className="mt-4">
              {action.label}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
