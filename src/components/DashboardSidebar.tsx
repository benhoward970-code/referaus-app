'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/profile', label: 'Edit Profile', icon: '✏️' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-full md:w-56 shrink-0">
      <div className="md:sticky md:top-24 space-y-1">
        {links.map(l => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} className={'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ' + (active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
              <span>{l.icon}</span>{l.label}
            </Link>
          );
        })}
        <hr className="my-3 border-gray-100" />
        <Link href="/pricing" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all">
          <span>⭐</span>Upgrade Plan
        </Link>
      </div>
    </nav>
  );
}
