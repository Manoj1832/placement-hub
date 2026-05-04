"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast-modal";
import { useRouter } from "next/navigation";

interface PremiumPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumPurchaseModal({ isOpen, onClose, onSuccess }: PremiumPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const handleUpgrade = async () => {
    if (!user?.email) {
      router.push("/sign-in");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "premium_yearly" }), // ₹99 product
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: data.description || "Premium Access — ₹99/yr",
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
                productId: "premium_yearly",
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              showToast("success", "Payment Successful!", "You now have Premium access for 1 year.");
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
          email: user.email,
          name: user.name || "",
        },
        theme: { color: "#9333ea" }, // purple for premium
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
      <DialogContent className="sm:max-w-md bg-[#1a1d2e] border-white/10 text-white overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        
        <div className="p-6">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
            <DialogTitle className="text-2xl font-bold">Unlock Premium</DialogTitle>
            <DialogDescription className="text-white/60 pt-2 text-sm max-w-[280px] mx-auto">
              Get full access to all Company Guides, Advanced DSA roadmaps, and Specialized Role paths.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {[
              "Access all 8+ Company Guides",
              "Advanced DSA patterns (DP, Graphs)",
              "Specialized roles (DevOps, UI, Embedded)",
              "Priority support & updates"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)]"
            >
              {loading ? "Processing..." : "Get Premium — ₹99 / year"}
            </Button>
            <p className="text-center text-xs text-white/40 mt-4 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secure payment via Razorpay
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
