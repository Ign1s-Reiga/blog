import { HttpError, PageProps } from 'fresh';

const STATUS_TEXT: Record<number, string> = {
  403: 'Forbidden',
  404: 'Page Not Found',
  500: 'Internal Server Error',
};

export default function ErrorPage(props: PageProps) {
  const error = props.error;

  const status = error instanceof HttpError ? error.status : 500;
  const detail = STATUS_TEXT[status] ?? (error instanceof Error ? error.message : 'An unexpected error occurred');

  return (
    <main class='grow flex flex-col items-center justify-center px-6 py-12 text-center'>
      <p class='text-6xl font-bold text-(--ui-text-primary)'>{status}</p>
      <p class='mt-2 text-2xl text-(--ui-text-secondary)'>{detail}</p>
      <a
        href='/'
        class='mt-10 px-5 py-2 rounded border border-(--ui-border) bg-(--ui-surface) text-sm text-(--ui-text-primary) hover:bg-(--ui-surface-hover) hover:text-(--ui-on-accent) transition-colors'
      >
        Return to Home
      </a>
    </main>
  );
}
