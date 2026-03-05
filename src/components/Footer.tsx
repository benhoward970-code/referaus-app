import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#070B12]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-lg">Refer</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecting NDIS participants with trusted providers across Newcastle &amp; the Hunter Region.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900/80">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link href="/providers" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Browse Providers</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Pricing</Link></li>
              <li><Link href="/register" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">List Your Service</Link></li>
              <li><Link href="/compare" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Compare Providers</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900/80">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="https://www.ndis.gov.au" target="_blank" rel="noopener" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">NDIS Website</a></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Guides & Resources</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">About Us</Link></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Provider Guidelines</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900/80">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900/70 transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © 2026 Refer Pty Ltd. ABN XX XXX XXX XXX. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Made in Newcastle, Australia 🇦🇺
          </p>
        </div>
      </div>
    </footer>
  );
}
