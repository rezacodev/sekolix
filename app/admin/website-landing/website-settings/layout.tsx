'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Palette, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreadcrumb } from '@/contexts/admin';

const tabs = [
  { label: 'Tema', href: '/admin/website-landing/website-settings/theme', icon: Palette },
  { label: 'Bagian Landing', href: '/admin/website-landing/website-settings/landing', icon: Layout },
];

export default function WebsiteSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  const currentTab = tabs.find(tab => pathname.startsWith(tab.href));

  // Update breadcrumbs
  useEffect(() => {
    if (!setBreadcrumbs) return;
    
    const breadcrumbs: Array<{label: string; href?: string}> = [
      { label: 'Pengaturan Website', href: '/admin/website-landing/website-settings/theme' }
    ];
    
    if (currentTab) {
      breadcrumbs.push({ label: currentTab.label });
    }
    
    setBreadcrumbs(breadcrumbs);
  }, [pathname, currentTab, setBreadcrumbs]);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Website</h1>
        <p className="text-muted-foreground">Kelola tema dan konten landing page</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
