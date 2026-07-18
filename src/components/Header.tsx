import Breadcrumb from '@/components/Breadcrumb.tsx';
import SearchBox from '@/islands/SearchBox.tsx';
import ThemeToggle from '@/islands/ThemeToggle.tsx';
import type { BreadcrumbItem } from '@/components/Breadcrumb.tsx';

export default function Header({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  return (
    <div class='flex items-center gap-3 mb-8'>
      <div class='flex-1 min-w-0'>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <div class='flex items-center gap-2 shrink-0'>
        <SearchBox />
        <ThemeToggle />
      </div>
    </div>
  );
}
