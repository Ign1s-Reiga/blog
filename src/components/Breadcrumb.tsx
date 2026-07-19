export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label='breadcrumb'>
      <ol class='flex items-center flex-wrap list-none p-0 m-0 text-sm text-(--ui-text-muted) gap-2'>
        {items.map((item, index) => (
          <li key={index} class='flex items-center gap-2'>
            {index > 0 && (
              <span aria-hidden='true' class='select-none'>
                /
              </span>
            )}
            {item.href ? (
              <a href={item.href} class='no-underline hover:underline'>
                {item.label}
              </a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
