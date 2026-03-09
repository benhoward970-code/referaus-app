import Link from 'next/link';

interface Crumb { label: string; href?: string; }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-6">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link href="/" className="hover:text-gray-600 transition-colors">Home</Link></li>
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-gray-600 transition-colors">{item.label}</Link>
            ) : (
              <span className="text-gray-700 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
