"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Check } from "lucide-react";
import { useState, useEffect } from "react";

import { useToast } from "@/components/toast-modal";
import { useRouter } from "next/navigation";

interface PremiumPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumPurchaseModal({ isOpen, onClose, onSuccess }: PremiumPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Premium check will be re-enabled with OAuth2
  // For now, premium status is not checked without auth

  const handleUpgrade = async () => {
    // Auth required — redirect to sign-in (will be OAuth2 in future)
    router.push("/sign-in");
    showToast("warning", "Sign In Required", "Please sign in first to upgrade to Premium.");
    onClose();
    return;

    if (isPremium) {
      showToast("info", "Already Premium", "You are already a Premium member!");
      onClose();
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "premium_3months" }), // ₹99 / 3 months product
      });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        throw new Error(data.error || "Order creation failed");
      }

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      const rzp = new (window as any).Razorpay({
        key: data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: data.description || "Premium Access — 3 Months",
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
              showToast("success", "Payment Successful!", "You now have Premium access for 3 months.");
              if (onSuccess) onSuccess();
              onClose();
              window.location.reload();
            } else {
              showToast("error", "Verification Failed", "Payment was received but verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            showToast("info", "Payment Status", "Payment may have succeeded. Please refresh the page.");
            window.location.reload();
          }
        },
        prefill: {
          email: "",
          name: "",
        },
        theme: { color: "#F97316" }, 
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment init error:", err);
      showToast("error", "Payment Error", err.message || "Payment failed to initialize. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#16132b] border-white/10 text-white overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        
        <div className="p-6">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription className="text-white/70 pt-2 text-sm max-w-[320px] mx-auto leading-relaxed">
              Crack your dream company placement! Join 2,000+ PSG seniors who use Premium tools to prepare.
            </DialogDescription>
          </DialogHeader>

          {/* Social Proof Badge */}
          <div className="mt-4 bg-purple-950/40 border border-purple-800/40 rounded-lg p-2.5 text-center text-xs text-purple-300 font-medium">
            🔥 92% of premium users secure placements at Tier-1 companies
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Unlimited access to all 450+ Experiences",
              "Unlocks all 8+ Company Guides",
              "Advanced DSA patterns (DP, Graphs, Trees)",
              "Specialized role paths (DevOps, UI, Embedded)",
              "Direct resume templates & downloadables"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/90">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-green-400 font-bold" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Monthly Plan</span>
                <p className="text-lg font-bold text-white">Full Premium Access</p>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 line-through text-xs mr-1">₹499</span>
                <span className="text-2xl font-black text-amber-400">₹149</span>
              </div>
            </div>

            {isPremium ? (
              <div className="w-full py-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> You already have Premium access!
              </div>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all transform hover:scale-[1.01]"
              >
                {loading ? "Processing..." : "Get Premium — ₹149 / month"}
              </Button>
            )}
            
            <p className="text-center text-xs text-white/40 mt-4 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-white/40" /> Secure payment via Razorpay • Cancel anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
