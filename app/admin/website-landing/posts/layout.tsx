'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FileText, Newspaper, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreadcrumb } from '@/contexts/admin';

const tabs = [
  { label: 'Articles', href: '/admin/website-landing/posts/articles', icon: FileText },
  { label: 'News', href: '/admin/website-landing/posts/news', icon: Newspaper },
  { label: 'Events', href: '/admin/website-landing/posts/events', icon: Calendar },
];

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  // Determine current section and page type for breadcrumb
  const currentTab = tabs.find(tab => pathname.startsWith(tab.href));
  
  // Check if we're on a detail page (new/edit) - must be exact /new or /edit path
  const isNewPage = pathname.endsWith('/new');
  const isEditPage = pathname.includes('/edit');

  // Update breadcrumbs
  useEffect(() => {
    if (!setBreadcrumbs) return;
    
    const breadcrumbs: Array<{label: string; href?: string}> = [
      { label: 'Posts', href: '/admin/website-landing/posts/articles' }
    ];
    
    if (currentTab) {
      if (isNewPage || isEditPage) {
        breadcrumbs.push({ label: currentTab.label, href: currentTab.href });
      } else {
        breadcrumbs.push({ label: currentTab.label });
      }
    }
    
    if (isNewPage) {
      breadcrumbs.push({ label: 'Create New' });
    } else if (isEditPage) {
      breadcrumbs.push({ label: 'Edit' });
    }
    
    setBreadcrumbs(breadcrumbs);
  }, [pathname, currentTab, isNewPage, isEditPage, setBreadcrumbs]);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Kelola artikel, berita, dan event sekolah</p>
      </div>

      {/* Tab Navigation - Always visible */}
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
                <Icon className="h-4 w-4 text-current" />
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
