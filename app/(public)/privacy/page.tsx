"use client";

import Link from "next/link";
import Header from "@/components/header";
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Trash2, Globe, Heart } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="w-6 h-6 text-[#22C55E]" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-white/50 text-sm">Last updated: June 2026</p>
        </div>

        <div className="space-y-8">
          <Section icon={Database} title="1. Information We Collect">
            <p>When you create an account on PSG Placement Hub, we collect:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-white/70">
              <li>Name and email address (for authentication)</li>
              <li>Branch and graduation year (optional, for filtering)</li>
              <li>Interview experiences you submit (content you create)</li>
              <li>Usage data such as pages visited and features used</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> collect phone numbers, physical addresses, or government IDs.</p>
          </Section>

          <Section icon={Lock} title="2. How We Use Your Data">
            <ul className="list-disc list-inside space-y-1 text-white/70">
              <li>To provide and maintain the platform</li>
              <li>To display experiences to other students (anonymously if you choose)</li>
              <li>To process payments via Razorpay (we never store card details)</li>
              <li>To send booking confirmations via email</li>
              <li>To moderate content and prevent abuse</li>
            </ul>
          </Section>

          <Section icon={Eye} title="3. Anonymous Submissions">
            <p>
              When you submit an experience with the &quot;Submit Anonymously&quot; option enabled,
              your name and identity are hidden from all users including admins on the public page.
              Your user ID is stored internally for moderation purposes only.
            </p>
          </Section>

          <Section icon={Globe} title="4. Third-Party Services">
            <p>We use the following trusted third-party services:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-white/70">
              <li><strong>Convex</strong> — Database and backend (US-hosted)</li>
              <li><strong>Razorpay</strong> — Payment processing (PCI DSS compliant)</li>
              <li><strong>Vercel</strong> — Hosting and deployment</li>
              <li><strong>Resend</strong> — Transactional emails</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your data with advertisers or data brokers.</p>
          </Section>

          <Section icon={Mail} title="5. Cookies & Authentication">
            <p>
              We use HTTP-only cookies to maintain your login session. These cookies are encrypted
              and expire after 7 days. We do not use tracking cookies or third-party analytics
              that identify individual users.
            </p>
          </Section>

          <Section icon={Trash2} title="6. Data Deletion">
            <p>
              You can request deletion of your account and all associated data by emailing us.
              Upon request, we will delete your profile, submitted experiences, saved items,
              and booking history within 30 days.
            </p>
          </Section>

          <Section icon={Shield} title="7. Security">
            <p>
              Passwords are hashed using bcrypt with 12 rounds. All data is transmitted over HTTPS.
              Payment information is handled entirely by Razorpay and never touches our servers.
              JWT tokens are signed with HS256 and rotated regularly.
            </p>
          </Section>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p className="text-white/60 text-sm">
              For privacy concerns or data requests, contact us at{" "}
              <a href="mailto:privacy@psgplacementhub.com" className="text-[#22C55E] hover:underline">
                privacy@psgplacementhub.com
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

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-[#22C55E]" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="text-white/70 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
