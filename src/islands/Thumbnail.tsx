import { useEffect, useRef, useState } from 'preact/hooks';

type Status = 'loading' | 'loaded' | 'error';

interface ThumbnailProps {
  src: string;
  alt: string;
  /** Solid placeholder color shown while loading / on error. Defaults to --ui-surface. */
  color?: string;
  /**
   * e.g. "16 / 9" — reserves space to prevent layout shift when the parent
   * doesn't already constrain the thumbnail's height.
   */
  aspectRatio?: string;
  class?: string;
}

export default function Thumbnail({ src, alt, color, aspectRatio, class: className = '' }: ThumbnailProps) {
  const [status, setStatus] = useState<Status>('loading');
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    // A cached image can finish loading before hydration attaches the
    // onLoad/onError handlers, so its events never fire. Reconcile from the DOM
    // once after mount: `complete` means it settled, `naturalWidth` tells us
    // whether it decoded (loaded) or failed (error).
    if (img?.complete) {
      setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, []);

  return (
    <div class={`thumb ${className}`.trim()} data-status={status} style={{ backgroundColor: color, aspectRatio }}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading='lazy'
        decoding='async'
        class='thumb-img'
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
