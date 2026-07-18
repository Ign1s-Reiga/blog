interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label='Pagination' class='flex items-center justify-center gap-2 py-8'>
      <a
        href={hasPrev ? `?page=${currentPage - 1}` : undefined}
        aria-disabled={!hasPrev}
        class={`px-3 py-1 rounded border text-sm transition-colors ${
          hasPrev
            ? 'border-(--ui-border) text-(--ui-text-primary) hover:bg-(--ui-surface)'
            : 'border-(--ui-border-soft) text-(--ui-text-muted) pointer-events-none'
        }`}
      >
        ← Prev
      </a>

      <span class='px-3 py-1 text-sm text-(--ui-text-secondary)'>
        {currentPage} / {totalPages}
      </span>

      <a
        href={hasNext ? `?page=${currentPage + 1}` : undefined}
        aria-disabled={!hasNext}
        class={`px-3 py-1 rounded border text-sm transition-colors ${
          hasNext
            ? 'border-(--ui-border) text-(--ui-text-primary) hover:bg-(--ui-surface)'
            : 'border-(--ui-border-soft) text-(--ui-text-muted) pointer-events-none'
        }`}
      >
        Next →
      </a>
    </nav>
  );
}
