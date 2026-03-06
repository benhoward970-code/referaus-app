import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo size="small" />
            <p className="text-sm text-gray-400">Connecting NDIS participants with the right providers.</p>
            <p className="text-sm text-gray-400 mt-1">Free for participants. Always.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">For Participants</h4>
            <div className="flex flex-col gap-2">
              <Link href="/providers" className="text-sm text-gray-400 hover:text-gray-600">Browse Providers</Link>
              <Link href="/about" className="text-sm text-gray-400 hover:text-gray-600">How It Works</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">For Providers</h4>
            <div className="flex flex-col gap-2">
              <Link href="/register" className="text-sm text-gray-400 hover:text-gray-600">List Your Service</Link>
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-600">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-gray-400 hover:text-gray-600">About</Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-600">Contact</Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
          <p className="text-xs text-gray-400">ï¿½ 2026 ReferAus (ABN 83 588 359 423). All rights reserved.</p>
          <p className="text-xs text-gray-400">referaus.com</p>
        </div>
      </div>
    </footer>
  );
}

