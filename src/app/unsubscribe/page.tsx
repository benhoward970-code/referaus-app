import type { Metadata } from "next";
import { UnsubscribeContent } from "@/components/UnsubscribeContent";

export const metadata: Metadata = {
  title: "Unsubscribed — ReferAus",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <UnsubscribeContent />
    </div>
  );
}
