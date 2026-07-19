import { HttpError, page } from 'fresh';
import { define } from '@/utils.ts';
import Header from '@/components/Header.tsx';
import { getDB } from '@/lib/db.ts';
import { getSeriesBySlug, getSeriesMembers } from '@/lib/posts.ts';

interface SeriesPagePost {
  slug: string;
  title: string;
  excerpt: string | null;
  posted?: string;
}

interface SeriesPageData {
  title: string;
  description: string | null;
  posts: SeriesPagePost[];
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
    const db = getDB(ctx);
    const s = await getSeriesBySlug(db, ctx.params.slug);
    if (!s) throw new HttpError(404);

    const members = await getSeriesMembers(db, s.id);

    return page<SeriesPageData>({
      title: s.title,
      description: s.description,
      posts: members.map((m) => ({
        slug: m.slug,
        title: m.title,
        excerpt: m.excerpt,
        posted: m.publishedAt?.toISOString(),
      })),
    });
  },
});

export default define.page<typeof handler>(function SeriesPage({ data }) {
  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Posts', href: '/posts' }, { label: data.title }];

  return (
    <main class='grow px-6 py-12'>
      <div class='max-w-3xl mx-auto'>
        <Header breadcrumbs={breadcrumbs} />
        <section class='mt-12'>
          <h1 class='text-4xl font-bold leading-tight text-(--ui-text-primary)'>{data.title}</h1>
          {data.description && <p class='mt-3 text-(--ui-text-secondary)'>{data.description}</p>}
          <ol class='mt-8 space-y-4'>
            {data.posts.map((post, index) => (
              <li key={post.slug} class='rounded border border-(--ui-border) bg-(--ui-surface) p-4'>
                <a href={`/posts/${post.slug}`} class='group block'>
                  <p class='text-xs text-(--ui-text-secondary)'>Part {index + 1}</p>
                  <h2 class='mt-1 text-lg font-medium text-(--ui-text-primary) group-hover:underline'>{post.title}</h2>
                  {post.excerpt && <p class='mt-1 text-sm text-(--ui-text-secondary)'>{post.excerpt}</p>}
                  {post.posted && (
                    <time datetime={post.posted} class='mt-2 block text-xs text-(--ui-text-secondary)'>
                      Posted: {formatDate(post.posted)}
                    </time>
                  )}
                </a>
              </li>
            ))}
          </ol>
          {data.posts.length === 0 && <p class='mt-8 text-(--ui-text-secondary)'>No published posts yet.</p>}
        </section>
      </div>
    </main>
  );
});
