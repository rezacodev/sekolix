"use client";

import { Card } from "@/components/ui/card";

export function SkeletonLoader() {
  return (
    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
  );
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <SkeletonLoader key={i} />
        ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-12 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse" />
            </Card>
          ))}
      </div>

      {/* Content Cards */}
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse mb-4" />
            <div className="space-y-3">
              {Array(4)
                .fill(0)
                .map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                ))}
            </div>
          </Card>
        ))}
    </div>
  );
}

export function KelasSkeleton() {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse mb-2" />
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse mb-3" />
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, j) => (
                    <div key={j} className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-full animate-pulse" />
                  ))}
              </div>
              <div className="flex gap-2 mt-4">
                {Array(3)
                  .fill(0)
                  .map((_, j) => (
                    <div
                      key={j}
                      className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md flex-1 animate-pulse"
                    />
                  ))}
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function MateriSkeleton() {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse mb-2" />
      </div>

      {/* Search Bar */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

      {/* Material List */}
      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-full animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function UjianSkeleton() {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse mb-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-12 animate-pulse" />
            </Card>
          ))}
      </div>

      {/* Exam Cards */}
      <div className="space-y-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse" />
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function NilaiSkeleton() {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse mb-2" />
      </div>

      {/* Filter */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-32" />

      {/* Chart Placeholder */}
      <Card className="p-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
      </Card>

      {/* Table */}
      <Card className="p-4">
        <div className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md flex-1 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 animate-pulse" />
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
