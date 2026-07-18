import { useEffect, useRef, useState } from 'preact/hooks';

export default function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isMac, setIsMac] = useState(false);
  const [isRetina, setIsRetina] = useState(false);

  useEffect(() => {
    // Prefer modern userAgentData, fall back to platform
    const platform =
      (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform ?? navigator.platform;
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform));
    setIsRetina(globalThis.devicePixelRatio >= 2);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, []);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const q = query.trim();
    location.href = q ? `/posts?q=${encodeURIComponent(q)}` : '/posts';
  };

  const shortcut = isMac ? '⌘/' : 'Ctrl+/';

  return (
    <form onSubmit={handleSubmit}>
      <div class='relative flex items-center'>
        <input
          ref={inputRef}
          type='search'
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          placeholder='Search…'
          class='w-32 sm:w-48 pl-3 pr-14 py-1.5 text-sm rounded-full border border-(--ui-border) bg-(--ui-bg) text-(--ui-text-primary) placeholder-(--ui-text-muted) shadow-sm focus:outline-none focus:border-(--ui-text-secondary)'
        />
        {!isRetina && (
          <kbd class='pointer-events-none absolute right-3 rounded bg-(--ui-surface) px-1.5 py-0.5 text-[10px] text-(--ui-text-muted)'>
            {shortcut}
          </kbd>
        )}
      </div>
    </form>
  );
}
