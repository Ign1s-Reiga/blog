import { useEffect, useState } from 'preact/hooks';
import { Check, ChevronDown, Share2 } from 'lucide-preact';
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

function XIcon() {
  return (
    <svg viewBox='0 0 24 24' width='16' height='16' fill='currentColor' aria-hidden='true'>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  );
}

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const btn =
    'inline-flex items-center justify-center rounded-md border border-(--ui-border) p-1.5 text-(--ui-text-secondary) transition-colors hover:bg-(--ui-surface-hover) hover:text-(--ui-text-primary)';

  const onShare = async () => {
    const url = location.href;
    // Navigator typings here don't include the Web Share API; cast narrowly.
    const nav = navigator as unknown as {
      share?: (data: { title?: string; url?: string }) => Promise<void>;
      clipboard?: { writeText: (text: string) => Promise<void> };
    };
    if (nav.share) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        // Share sheet dismissed — fall through to copying the link.
      }
    }
    try {
      await nav.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; nothing more to do.
    }
  };

  const shareToX = () => {
    const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(location.href)}`;
    globalThis.open(intent, '_blank', 'noopener,noreferrer');
  };

  return (
    <div class='flex items-center gap-2'>
      <button type='button' onClick={onShare} aria-label={copied ? 'Link copied' : 'Share'} class={btn}>
        {copied ? <Check size={16} aria-hidden='true' /> : <Share2 size={16} aria-hidden='true' />}
      </button>
      <button type='button' onClick={shareToX} aria-label='Share on X' class={btn}>
        <XIcon />
      </button>
    </div>
  );
}

export default function TableOfContents({ headings, title }: { headings: TocEntry[]; title: string }) {
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
      <div class='xl:hidden mb-8'>
        <div class='rounded-lg border border-(--ui-border-soft) overflow-hidden'>
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
        <div class='mt-3'>
          <ShareBar title={title} />
        </div>
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
        <div class='mt-4 border-t border-(--ui-border-soft) pt-3'>
          <ShareBar title={title} />
        </div>
      </nav>
    </>
  );
}
