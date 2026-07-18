import { eq } from 'drizzle-orm';
import { HttpError, page } from 'fresh';
import { define } from '@/utils.ts';
import Header from '@/components/Header.tsx';
import { getDB } from '@/lib/db.ts';
import { posts } from '@/lib/db-schema.ts';
import { getPostContent } from '@/lib/content.ts';
import { parseFrontmatter } from '@/lib/markdown.ts';
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
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
    // Drafts are not served publicly; preview them via the API with the admin
    // token (or against local wrangler dev).
    if (!post || !post.published) throw new HttpError(404);

    const raw = await getPostContent(ctx, slug);
    if (raw === null) throw new HttpError(404);

    // Metadata (title/tags/dates) comes from D1; a frontmatter block or
    // leading `# title` in the R2 object is tolerated but stripped so it
    // doesn't render twice.
    const { body } = parseFrontmatter(raw);
    const bodyWithoutTitle = body.replace(/^#\s+.+$/m, '').trimStart();
    const html = await renderMarkdown(bodyWithoutTitle);

    return page<ArticleData>({
      title: post.title,
      tags: post.tags ?? [],
      posted: post.publishedAt?.toISOString(),
      updated: post.updatedAt.getTime() !== post.createdAt.getTime() ? post.updatedAt.toISOString() : undefined,
      headings: extractHeadings(html),
      html,
    });
  },
});

export default define.page<typeof handler>(function Article({ data }) {
  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Posts', href: '/posts' }, { label: data.title }];

  const hasDate = data.posted || data.updated;

  return (
    <main class='grow px-6 py-12'>
      <div class='max-w-3xl mx-auto'>
        <Header breadcrumbs={breadcrumbs} />
        <article class='mt-12'>
          <header class='mb-8'>
            <h1 class='text-4xl font-bold leading-tight text-(--ui-text-primary)'>{data.title}</h1>
            <div class='flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mt-3'>
              <div class='flex flex-wrap gap-2'>
                {data.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/posts?q=%23${tag}`}
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
          <TableOfContents headings={data.headings} />
          <div class='md-body text-(--ui-text-secondary) leading-7' dangerouslySetInnerHTML={{ __html: data.html }} />
        </article>
      </div>
    </main>
  );
});
