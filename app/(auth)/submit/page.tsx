"use client";

import Header from "@/components/header";
import SubmitForm from "@/components/submit-form";
import Link from "next/link";
import { ArrowLeft, BookOpen, Lightbulb, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-modal";

export default function SubmitPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast("success", "Submitted!", "Experience submitted! It will be reviewed by our team.");
    router.push("/browse");
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-300">
      <Header />

      {/* Back nav */}
      <div className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Browse
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <div className="relative bg-[#0F0F11]/60 border border-zinc-900 rounded-2xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500/40 to-orange-500/0" />

          <div className="relative flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold mb-4">
                <Shield className="w-3 h-3 text-[#F97316]" />
                Alumni Contribution
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                Share Your Interview Journey
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Your insights can be the difference for a junior student cracking their dream company.
                Provide round-by-round details, exact questions, and key tips — the more detail you add,
                the more valuable your contribution.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:w-64 flex-shrink-0">
              {[
                { icon: BookOpen, text: "Round-wise breakdown with questions" },
                { icon: Lightbulb, text: "Curated tips per interview stage" },
                { icon: Shield, text: "Submit anonymously if preferred" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-900 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1C0F02] border border-orange-950/40 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <p className="text-zinc-400 text-xs font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      <div className="pb-20">
        <SubmitForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
