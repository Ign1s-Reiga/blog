const links = [
  { label: 'About', href: '/about' },
  { label: 'GitHub', href: 'https://github.com/Ign1s-Reiga' },
  { label: 'X', href: 'https://x.com/rem7953_kogyo' },
  { label: 'Contact', href: 'mailto:remrem4862@gmail.com' },
];

const Footer = () => (
  <footer class='bg-(--ui-surface) border-t border-(--ui-border) py-5 px-4'>
    <nav class='flex items-center justify-center flex-wrap gap-x-4 gap-y-1'>
      {links.map(({ label, href }, i) => (
        <>
          {i > 0 && (
            <span aria-hidden='true' class='text-(--ui-text-muted) select-none'>
              ·
            </span>
          )}
          <a
            key={label}
            href={href}
            class='text-sm text-(--ui-text-secondary) hover:text-(--ui-text-primary) transition-colors'
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>
        </>
      ))}
    </nav>
  </footer>
);

export default Footer;
