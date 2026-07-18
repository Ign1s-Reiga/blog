import { define } from '@/utils.ts';
import Header from '@/components/Header.tsx';

export default define.page(function About() {
  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'About' }];

  return (
    <main class='grow px-6 py-12'>
      <div class='max-w-3xl mx-auto'>
        <Header breadcrumbs={breadcrumbs} />
        <section class='mt-12 flex flex-col items-center text-center'>
          <img
            src='https://github.com/Ign1s-Reiga.png'
            alt="Rei's avatar"
            width={96}
            height={96}
            class='rounded-full border-2 border-(--ui-border-soft)'
          />
          <h1 class='mt-5 text-3xl font-bold text-(--ui-text-primary)'>Rei</h1>
          <p class='mt-1 text-sm text-(--ui-text-muted)'>@Ign1s-Reiga</p>
          <div class='mt-6 max-w-md text-(--ui-text-secondary) leading-7 space-y-3'>
            <p>
              Software developer based in Japan. I write about programming, tools, and whatever catches my interest.
            </p>
            <p>Mainly working with TypeScript and Rust. Fond of well-designed software and clean interfaces.</p>
          </div>
          <div class='mt-8 flex gap-5'>
            <a
              href='https://github.com/Ign1s-Reiga'
              target='_blank'
              rel='noopener noreferrer'
              class='flex items-center gap-2 px-4 py-2 rounded border border-(--ui-border) text-(--ui-text-primary) bg-(--ui-surface) hover:bg-(--ui-surface-hover) hover:text-(--ui-on-accent) transition-colors text-sm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 16 16'
                fill='currentColor'
                class='w-4 h-4'
                aria-hidden='true'
              >
                <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z' />
              </svg>
              GitHub
            </a>
            <a
              href='https://x.com/rem7953_kogyo'
              target='_blank'
              rel='noopener noreferrer'
              class='flex items-center gap-2 px-4 py-2 rounded border border-(--ui-border) text-(--ui-text-primary) bg-(--ui-surface) hover:bg-(--ui-surface-hover) hover:text-(--ui-on-accent) transition-colors text-sm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                class='w-4 h-4'
                aria-hidden='true'
              >
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
              X
            </a>
          </div>
        </section>
      </div>
    </main>
  );
});
