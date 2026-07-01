"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Link from "next/link";
import { Crown, Check, ArrowLeft, Lock, Zap, BookOpen, Target, Shield } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/toast-modal";
import { useRouter } from "next/navigation";

const FEATURES = [
  "Unlimited access to all 450+ interview experiences",
  "Round-wise breakdowns with exact questions asked",
  "8+ Premium company guides (Google, Amazon, Microsoft…)",
  "Advanced DSA patterns: DP, Graphs, Trees, System Design",
  "Resume templates & downloadable study packs",
  "Specialized role skill trees (DevOps, UI, Embedded)",
];

export default function PremiumPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetch("/api/user/sync")
        .then((r) => r.json())
        .then((d) => setIsPremium(d.isPremium))
        .catch(() => {});
    }
  }, [isLoaded, user]);

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/sign-in?redirect_url=" + encodeURIComponent("/premium"));
      return;
    }
    if (isPremium) {
      showToast("info", "Already Premium", "You are already a Premium member!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "premium_3months" }),
      });
      const data = await res.json();
      if (!res.ok || !data.orderId) throw new Error(data.error || "Order creation failed");

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(s);
        });
      }

      const rzp = new (window as any).Razorpay({
        key: data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: data.description || "Premium Access — ₹149/month",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId: "premium_3months",
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setIsPremium(true);
              showToast("success", "Payment Successful! 🎉", "You now have full Premium access.");
              window.location.reload();
            } else {
              showToast("error", "Verification Failed", "Payment received but verification failed. Contact support.");
            }
          } catch (err) {
            showToast("info", "Payment Status", "Payment may have succeeded. Please refresh.");
            window.location.reload();
          }
        },
        prefill: {
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || "",
        },
        theme: { color: "#F97316" },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err: any) {
      showToast("error", "Payment Error", err.message || "Payment failed to initialize.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-300">
      <Header />

      <div className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Browse
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C0F02] border border-orange-950/50 text-[#F97316] text-xs font-bold mb-6">
            <Crown className="w-3.5 h-3.5" /> Premium Membership
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Crack Any Company.<br />
            <span className="text-[#F97316]">One Plan. Zero Compromise.</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Join 2,000+ PSG students who used Premium to prepare smarter and land offers at Tier-1 companies.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative bg-[#0F0F11] border-2 border-[#F97316]/40 rounded-2xl overflow-hidden shadow-2xl shadow-orange-950/20">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0" />

            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 text-[10px] font-black rounded-full bg-[#F97316] text-black tracking-wider uppercase">
                🔥 Best Value
              </span>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Monthly</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white">₹149</span>
                  <span className="text-zinc-500 text-sm mb-2">/month</span>
                </div>
                <p className="text-zinc-600 text-xs mt-1">Cancel anytime • Secure via Razorpay</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-[#1C0F02] border border-orange-950/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#F97316]" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <div className="w-full py-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" /> You already have Premium access!
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 disabled:opacity-70"
                >
                  <Crown className="w-5 h-5 text-black" />
                  {loading ? "Processing Secure Checkout..." : "Get Premium — ₹149 / month"}
                </button>
              )}

              <p className="text-center text-xs text-zinc-600 mt-4 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> 256-bit SSL • Powered by Razorpay
              </p>
            </div>
          </div>
        </div>

        {/* Trust / Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
          {[
            { icon: Zap, label: "Instant Access", desc: "Unlocked immediately after payment" },
            { icon: BookOpen, label: "450+ Experiences", desc: "Real round-by-round details" },
            { icon: Target, label: "92% Success Rate", desc: "Premium users land Tier-1 offers" },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-[#1C0F02] border border-orange-950/40 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-[#F97316]" />
              </div>
              <p className="text-white font-bold text-sm mb-1">{item.label}</p>
              <p className="text-zinc-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
