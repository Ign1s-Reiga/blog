export interface Article {
  title: string;
  href: string;
  thumbnail?: string;
  tags?: string[];
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.href}
      class='h-full flex flex-col overflow-hidden rounded-lg border border-(--ui-border-soft) hover:shadow-md dark:hover:shadow-neutral-500 transition-shadow'
    >
      <div class='flex-9 min-h-0'>
        {article.thumbnail ? (
          <img src={article.thumbnail} alt={article.title} class='w-full h-full object-cover' />
        ) : (
          <div class='w-full h-full bg-(--ui-surface)' />
        )}
      </div>
      <div class='flex-1 min-h-11 px-3 flex items-center justify-between gap-2 bg-(--ui-bg) border-t border-(--ui-border-soft)'>
        <span class='text-sm font-medium text-(--ui-text-primary) truncate min-w-0'>{article.title}</span>
        {article.tags && article.tags.length > 0 && (
          <div class='flex gap-1 shrink-0'>
            {article.tags.map((tag) => (
              <span key={tag} class='text-xs text-(--ui-text-secondary) bg-(--ui-surface) px-1.5 py-0.5 rounded'>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
