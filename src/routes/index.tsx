import { page } from 'fresh';
import { define } from '@/utils.ts';
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

interface PostsApiResponse {
  data: { slug: string; title: string; tags: string[] | null }[];
  total: number;
  page: number;
  limit: number;
}

export const handler = define.handlers({
  async GET(ctx) {
    const pageNum = Math.max(1, Number(ctx.url.searchParams.get('page') ?? '1'));

    const apiUrl = new URL('/api/posts', ctx.url);
    apiUrl.searchParams.set('page', String(pageNum));
    apiUrl.searchParams.set('limit', String(PAGE_SIZE));

    const res = await fetch(apiUrl);
    const json: PostsApiResponse = await res.json();

    const totalPages = Math.max(1, Math.ceil(json.total / PAGE_SIZE));
    const currentPage = Math.min(pageNum, totalPages);

    const articles: Article[] = json.data.map((p) => ({
      title: p.title,
      href: `/posts/${p.slug}`,
      tags: p.tags ?? undefined,
    }));

    return page<HomeData>({ articles, currentPage, totalPages });
  },
});

export default define.page<typeof handler>(function Home({ data }) {
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
        <Pagination currentPage={data.currentPage} totalPages={data.totalPages} />
      </div>
    </main>
  );
});
