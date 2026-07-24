import { define } from '@/utils.ts';
import Footer from '@/components/Footer.tsx';
import { asset } from 'fresh/runtime';

const THEME_SCRIPT = `(function(){var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.style.colorScheme=t})()`;

const SITE_NAME = "Rei's Weblog";
const SITE_DESCRIPTION = 'Programming, tools, and things I find interesting.';

const App = define.page(({ Component, state, url }) => {
  const head = state.head;
  const title = head?.title ? `${head.title} · ${SITE_NAME}` : SITE_NAME;
  const description = head?.description ?? SITE_DESCRIPTION;
  const canonical = `${url.origin}${url.pathname}`;
  const ogType = head?.type ?? 'website';
  const image = head?.image;

  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel='stylesheet' href={asset('/styles.css')} />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700&display=swap'
          rel='stylesheet'
        />

        <title>{title}</title>
        <meta name='description' content={description} />
        <link rel='canonical' href={canonical} />

        {/* Open Graph — https://ogp.me/ */}
        <meta property='og:site_name' content={SITE_NAME} />
        <meta property='og:type' content={ogType} />
        <meta property='og:title' content={head?.title ?? SITE_NAME} />
        <meta property='og:description' content={description} />
        <meta property='og:url' content={canonical} />
        <meta property='og:locale' content='en_US' />
        {image && <meta property='og:image' content={image} />}
        {image && <meta property='og:image:alt' content={head?.title ?? SITE_NAME} />}
        {ogType === 'article' && head?.publishedTime && (
          <meta property='article:published_time' content={head.publishedTime} />
        )}
        {ogType === 'article' && head?.modifiedTime && (
          <meta property='article:modified_time' content={head.modifiedTime} />
        )}
        {ogType === 'article' && head?.tags?.map((tag) => <meta key={tag} property='article:tag' content={tag} />)}

        {/* Twitter Card — reads og:* as fallback, but needs its own card type. */}
        <meta name='twitter:card' content={image ? 'summary_large_image' : 'summary'} />
      </head>
      <body class='flex flex-col min-h-screen bg-(--ui-bg) transition-colors'>
        <Component />
        <Footer />
      </body>
    </html>
  );
});

export default App;
