import { useEffect, useState } from 'preact/hooks';
import { ChevronDown } from 'lucide-preact';
import type { TocEntry } from '@/lib/toc.ts';

// h2 → pl-0, h3 → pl-3 (0.75rem), h4 → pl-6 (1.5rem)
const INDENT: Record<number, string> = { 2: '', 3: 'pl-3', 4: 'pl-6' };

function TocLinks({
  headings,
  activeId,
  onNavigate,
}: {
  headings: TocEntry[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={onNavigate}
          class={`block py-0.5 leading-snug transition-colors ${INDENT[h.level] ?? ''} ${
            activeId === h.id
              ? 'text-(--ui-text-primary) font-semibold'
              : 'text-(--ui-text-muted) hover:text-(--ui-text-secondary)'
          }`}
        >
          {h.text}
        </a>
      ))}
    </>
  );
}

export default function TableOfContents({ headings }: { headings: TocEntry[] }) {
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const nodes = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (visible.length > 0) setActiveId(visible[0]);
      },
      { rootMargin: '0px 0px -70% 0px' },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* ── Mobile: collapsible inline above article body ── */}
      <div class='xl:hidden mb-8 rounded-lg border border-(--ui-border-soft) overflow-hidden'>
        <button
          type='button'
          onClick={() => setMobileOpen((o) => !o)}
          class='w-full px-4 py-3 flex justify-between items-center bg-(--ui-surface) text-sm font-semibold text-(--ui-text-primary) text-left'
        >
          On this page
          <ChevronDown
            size={16}
            aria-hidden='true'
            class={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {mobileOpen && (
          <div class='px-4 py-3 flex flex-col gap-1 bg-(--ui-bg) text-sm'>
            <TocLinks headings={headings} activeId={activeId} onNavigate={() => setMobileOpen(false)} />
          </div>
        )}
      </div>

      {/* ── PC: fixed right sidebar ── */}
      <nav
        class='hidden xl:flex fixed flex-col gap-1 top-24 right-6 w-48 text-xs 2xl:w-72 2xl:right-8 2xl:text-base'
        aria-label='Table of contents'
      >
        <p class='text-(--ui-text-primary) font-semibold uppercase tracking-wider mb-3'>On this page</p>
        <div class='flex flex-col gap-1'>
          <TocLinks headings={headings} activeId={activeId} />
        </div>
      </nav>
    </>
  );
}
