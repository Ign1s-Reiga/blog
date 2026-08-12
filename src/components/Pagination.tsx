interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** The request's query params. Everything but `page` is carried into the links. */
  searchParams?: URLSearchParams;
}

export function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // A bare `?page=N` replaces the whole query string, which dropped the active
  // search when paging through /posts?q=…. Build on top of the current params.
  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `?${params}`;
  };

  return (
    <nav aria-label='Pagination' class='flex items-center justify-center gap-2 py-8'>
      <a
        href={hasPrev ? hrefFor(currentPage - 1) : undefined}
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
        href={hasNext ? hrefFor(currentPage + 1) : undefined}
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
