import { page } from 'fresh';
import { define, parsePageParam, redirectToPage } from '@/utils.ts';
import { getDB } from '@/lib/db.ts';
import { listPosts } from '@/lib/posts.ts';
import { getPostThumbnail } from '@/lib/content.ts';
import Header from '@/components/Header.tsx';
import { ArticleCard } from '@/components/ArticleCard.tsx';
import { Pagination } from '@/components/Pagination.tsx';
import type { Article } from '@/components/ArticleCard.tsx';

const PAGE_SIZE = 20;

interface PostsData {
  articles: Article[];
  currentPage: number;
  totalPages: number;
  query: string;
  total: number;
}

export const handler = define.handlers({
  async GET(ctx) {
    const query = ctx.url.searchParams.get('q')?.trim() ?? '';
    const pageNum = parsePageParam(ctx.url.searchParams.get('page'), PAGE_SIZE);

    // Sourced in-process from the shared data module. The public listing
    // never exposes drafts, so it stays published-only regardless of caller.
    const db = getDB(ctx);
    const { rows, total } = await listPosts(db, {
      q: query || undefined,
      publishedOnly: true,
      limit: PAGE_SIZE,
      offset: (pageNum - 1) * PAGE_SIZE,
    });

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    // Past the end there is nothing to show, and clamping only the displayed
    // number left the pager claiming the last page while the list was empty.
    if (pageNum > totalPages) return redirectToPage(ctx.url, totalPages);

    const articles: Article[] = rows.map((p) => ({
      title: p.title,
      href: `/posts/${p.slug}`,
      tags: p.tags ?? undefined,
      thumbnail: getPostThumbnail(ctx, p.slug),
    }));

    ctx.state.head = { title: 'Posts', type: 'website' };

    return page<PostsData>({ articles, currentPage: pageNum, totalPages, query, total });
  },
});

export default define.page<typeof handler>(function Posts({ data, url }) {
  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Posts' }];

  return (
    <main class='grow px-6 py-12'>
      <div class='max-w-3xl mx-auto'>
        <Header breadcrumbs={breadcrumbs} />
        <section class='my-12'>
          <h1 class='text-4xl font-bold leading-tight text-(--ui-text-primary)'>Posts</h1>
        </section>
        <form method='get' action='/posts' class='mb-8'>
          <div class='flex gap-2'>
            <input
              type='search'
              name='q'
              value={data.query}
              placeholder='Search posts… or #tag'
              class='flex-1 px-4 py-2 rounded border border-(--ui-border) bg-(--ui-bg) text-(--ui-text-primary) placeholder-(--ui-text-muted) focus:outline-none focus:border-(--ui-text-secondary)'
            />
            <button
              type='submit'
              class='px-4 py-2 rounded border border-(--ui-border) text-(--ui-text-primary) bg-(--ui-surface) hover:bg-(--ui-surface-hover) hover:text-(--ui-on-accent) transition-colors text-sm'
            >
              Search
            </button>
          </div>
          {data.query && (
            <p class='mt-2 text-sm text-(--ui-text-muted)'>
              {data.total} result{data.total !== 1 ? 's' : ''} for "{data.query}"
            </p>
          )}
        </form>
        <section>
          {data.articles.length > 0 ? (
            <ul class='grid grid-cols-1 gap-4 list-none p-0 m-0'>
              {data.articles.map((article) => (
                <li key={article.href} class='h-82.5'>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          ) : (
            <p class='text-(--ui-text-secondary) text-[0.95rem]'>No posts found.</p>
          )}
        </section>
        <Pagination currentPage={data.currentPage} totalPages={data.totalPages} searchParams={url.searchParams} />
      </div>
    </main>
  );
});
