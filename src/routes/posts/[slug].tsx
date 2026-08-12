import { HttpError, page } from 'fresh';
import { define } from '@/utils.ts';
import Header from '@/components/Header.tsx';
import { getDB } from '@/lib/db.ts';
import { getPostBySlug, getSeriesNav, type SeriesNav } from '@/lib/posts.ts';
import { getPostContent, getPostThumbnail } from '@/lib/content.ts';
import { extractHeadings, type TocEntry } from '@/lib/toc.ts';
import TableOfContents from '@/islands/TableOfContents.tsx';
import { renderMarkdown } from '@ign1s-reiga/marked-presets';

interface ArticleData {
  title: string;
  tags: string[];
  posted?: string;
  updated?: string;
  headings: TocEntry[];
  html: string;
  series?: SeriesNav;
}

/**
 * Drop a leading `# title` line so it doesn't render above the title D1 already
 * supplies. Anchored to the very start of the body: the previous multiline
 * pattern matched the first `# ` line *anywhere*, so a body that opens without
 * a title — the CMS's normal output — lost whatever ATX heading came first,
 * including a `# comment` inside a fenced code block.
 */
function stripLeadingTitle(md: string): string {
  return md
    .trimStart()
    .replace(/^#[ \t]+\S[^\n]*(?:\r?\n|$)/, '')
    .trimStart();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  });
}

export const handler = define.handlers({
  async GET(ctx) {
    const { slug } = ctx.params;

    if (slug.includes('.')) return ctx.next();

    const db = getDB(ctx);
    const post = await getPostBySlug(db, slug);
    // Drafts are not served publicly; preview them via the API with the admin
    // token (or against local wrangler dev).
    if (!post || !post.published) throw new HttpError(404);

    const raw = await getPostContent(ctx, slug);
    if (raw === null) throw new HttpError(404);

    // Metadata (title/tags/dates) comes from D1; a leading `# title` in the R2
    // object is tolerated but stripped so it doesn't render twice.
    const html = await renderMarkdown(stripLeadingTitle(raw));

    // Series navigation: position among the published parts, in order.
    const seriesNav = await getSeriesNav(db, post);

    ctx.state.head = {
      title: post.title,
      type: 'article',
      description: post.excerpt ?? undefined,
      image: getPostThumbnail(ctx, slug),
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.getTime() !== post.createdAt.getTime() ? post.updatedAt.toISOString() : undefined,
      tags: post.tags ?? undefined,
    };

    return page<ArticleData>({
      title: post.title,
      tags: post.tags ?? [],
      posted: post.publishedAt?.toISOString(),
      updated: post.updatedAt.getTime() !== post.createdAt.getTime() ? post.updatedAt.toISOString() : undefined,
      headings: extractHeadings(html),
      html,
      series: seriesNav,
    });
  },
});

export default define.page<typeof handler>(function Article({ data }) {
  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Posts', href: '/posts' }, { label: data.title }];

  const hasDate = data.posted || data.updated;
  const series = data.series;

  return (
    <main class='grow px-6 py-12'>
      <div class='max-w-3xl mx-auto'>
        <Header breadcrumbs={breadcrumbs} />
        <article class='mt-12'>
          <header class='mb-8'>
            <h1 class='text-4xl font-bold leading-tight text-(--ui-text-primary)'>{data.title}</h1>
            {series && (
              <p class='mt-2 text-xl text-(--ui-text-secondary)'>
                <a href={`/series/${series.slug}`} class='font-medium text-(--ui-text-primary) hover:underline'>
                  {series.title}
                </a>
                : Part {series.part}
              </p>
            )}
            <div class='flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mt-3'>
              <div class='flex flex-wrap gap-2'>
                {data.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/posts?q=${encodeURIComponent(`#${tag}`)}`}
                    class='text-xs text-(--ui-text-secondary) bg-(--ui-surface) px-2 py-1 rounded hover:bg-(--ui-surface-hover) hover:text-(--ui-on-accent) transition-colors'
                  >
                    #{tag}
                  </a>
                ))}
              </div>
              {hasDate && (
                <div class='flex text-xs text-(--ui-text-secondary) gap-x-2'>
                  {data.posted && <time datetime={data.posted}>Posted: {formatDate(data.posted)}</time>}

                  {data.updated && <time datetime={data.updated}>Updated: {formatDate(data.updated)}</time>}
                </div>
              )}
            </div>
          </header>
          <TableOfContents headings={data.headings} title={data.title} />
          <div class='md-body text-(--ui-text-secondary) leading-7' dangerouslySetInnerHTML={{ __html: data.html }} />
          {series && (series.prev || series.next) && (
            <nav aria-label='Series navigation' class='mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {series.prev ? (
                <a
                  href={`/posts/${series.prev.slug}`}
                  class='group flex flex-col gap-1 rounded-lg border border-(--ui-border) bg-(--ui-surface) p-4 transition-colors hover:bg-(--ui-surface-hover)'
                >
                  <span class='text-[0.7rem] uppercase tracking-wider text-(--ui-text-secondary)'>
                    ← Prev Part: #{series.part - 1}
                  </span>
                  <span class='text-sm font-medium text-(--ui-text-primary) line-clamp-1'>{series.prev.title}</span>
                </a>
              ) : (
                <span class='hidden sm:block' />
              )}
              {series.next ? (
                <a
                  href={`/posts/${series.next.slug}`}
                  class='group flex flex-col items-end gap-1 rounded-lg border border-(--ui-border) bg-(--ui-surface) p-4 text-right transition-colors hover:bg-(--ui-surface-hover)'
                >
                  <span class='text-[0.7rem] uppercase tracking-wider text-(--ui-text-secondary)'>
                    Next Part: #{series.part + 1} →
                  </span>
                  <span class='text-sm font-medium text-(--ui-text-primary) line-clamp-1'>{series.next.title}</span>
                </a>
              ) : (
                <span class='hidden sm:block' />
              )}
            </nav>
          )}
        </article>
      </div>
    </main>
  );
});
