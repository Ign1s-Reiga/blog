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

interface HomeData {
  articles: Article[];
  currentPage: number;
  totalPages: number;
}

export const handler = define.handlers({
  async GET(ctx) {
    const pageNum = parsePageParam(ctx.url.searchParams.get('page'), PAGE_SIZE);

    // Recent posts, sourced in-process from the shared data module; the public
    // home never lists drafts.
    const db = getDB(ctx);
    const { rows, total } = await listPosts(db, {
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

    return page<HomeData>({ articles, currentPage: pageNum, totalPages });
  },
});

export default define.page<typeof handler>(function Home({ data, url }) {
  const breadcrumbs = [{ label: 'Home' }];

  return (
    <main class='grow px-6 py-12'>
      <div class='max-w-3xl mx-auto'>
        <Header breadcrumbs={breadcrumbs} />
        <section class='my-12'>
          <h1 class='text-4xl font-bold leading-tight text-(--ui-text-primary)'>Rei's Weblog</h1>
          <div class='mt-4 text-(--ui-text-secondary) leading-7'>
            Programming, tools, and things I find interesting.
          </div>
        </section>
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
            <p class='text-(--ui-text-secondary) text-[0.95rem]'>No posts yet — check back soon.</p>
          )}
        </section>
        <Pagination currentPage={data.currentPage} totalPages={data.totalPages} searchParams={url.searchParams} />
      </div>
    </main>
  );
});
