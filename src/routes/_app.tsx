import { define } from '@/utils.ts';
import Footer from '@/components/Footer.tsx';
import { asset } from 'fresh/runtime';

const THEME_SCRIPT = `(function(){var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.style.colorScheme=t})()`;

const App = define.page(({ Component }) => {
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
        <title>Rei's Weblog</title>
      </head>
      <body class='flex flex-col min-h-screen bg-(--ui-bg) transition-colors'>
        <Component />
        <Footer />
      </body>
    </html>
  );
});

export default App;
