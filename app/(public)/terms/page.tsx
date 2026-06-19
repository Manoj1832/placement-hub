"use client";

import Link from "next/link";
import Header from "@/components/header";
import { ArrowLeft, FileText, Heart } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#2D1A5C] text-white">
      <Header />

      <div className="w-full px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-sm text-white/60 hover:text-white inline-flex items-center transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/20">
              <FileText className="w-6 h-6 text-[#22C55E]" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-white/50 text-sm">Last updated: June 2026</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance</h2>
            <p>By using PSG Placement Hub, you agree to these terms. If you do not agree, please do not use the platform.</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">2. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your password. You must be a current or former PSG College of Technology student to use the platform.</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">3. Content Submissions</h2>
            <p>By submitting interview experiences, you grant PSG Placement Hub a non-exclusive license to display the content on the platform. You retain ownership of your content. All submissions are moderated and may be edited or removed at our discretion. You must not submit false, misleading, or defamatory content.</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">4. Premium Services</h2>
            <p>Paid features including premium access, resume reviews, GitHub audits, and portfolio audits are non-refundable once delivered. Service delivery timelines are estimates and may vary. Payment is processed securely through Razorpay.</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">5. Prohibited Conduct</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Sharing copyrighted material without permission</li>
              <li>Impersonating other users or companies</li>
              <li>Attempting to scrape or harvest data from the platform</li>
              <li>Using the platform for commercial advertising</li>
              <li>Harassing or threatening other users</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>PSG Placement Hub is provided &quot;as is&quot; without warranties. We are not liable for any decisions made based on content shared on the platform. Interview experiences are user-submitted and may not reflect current hiring practices.</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">7. Changes</h2>
            <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Questions?</h3>
            <p className="text-white/60 text-sm">
              Contact us at{" "}
              <a href="mailto:support@psgplacementhub.com" className="text-[#22C55E] hover:underline">
                support@psgplacementhub.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-black/60 pt-12 pb-8 border-t border-white/10 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-white/40">
          <p className="flex items-center justify-center gap-1">
            © 2026 PSG Placement Hub. Made with <Heart className="w-4 h-4 text-red-500" /> for the community
          </p>
        </div>
      </footer>
    </div>
  );
}
