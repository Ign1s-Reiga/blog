import { useEffect, useState } from 'preact/hooks';
import { Moon, Sun } from 'lucide-preact';

type Scheme = 'light' | 'dark';

function getInitialScheme(): Scheme {
  const stored = localStorage.getItem('theme') as Scheme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyScheme(scheme: Scheme) {
  document.documentElement.style.colorScheme = scheme;
  localStorage.setItem('theme', scheme);
}

export default function ThemeToggle() {
  const [scheme, setScheme] = useState<Scheme>('light');

  useEffect(() => {
    const initial = getInitialScheme();
    setScheme(initial);
    applyScheme(initial);
  }, []);

  const toggle = () => {
    const next: Scheme = scheme === 'dark' ? 'light' : 'dark';
    setScheme(next);
    applyScheme(next);
  };

  const isDark = scheme === 'dark';

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      class='w-8 h-8 flex items-center justify-center rounded-full border border-(--ui-border) bg-(--ui-bg) text-(--ui-text-primary) hover:bg-(--ui-surface) transition-colors shrink-0'
    >
      {isDark ? <Sun size={16} aria-hidden='true' /> : <Moon size={16} aria-hidden='true' />}
    </button>
  );
}
