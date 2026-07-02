"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Lock, Crown, Check } from "lucide-react";
import { useState, useEffect } from "react";

import { useToast } from "@/components/toast-modal";

interface PremiumGateProps {
  children: React.ReactNode;
}

export default function PremiumGate({ children }: PremiumGateProps) {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(false);
  const { showToast } = useToast();

  // Premium check will be re-enabled with OAuth2

  const handleUpgrade = async () => {
    // No auth system yet — show sign-in message
    showToast("warning", "Sign In Required", "Please sign in first to upgrade to Premium!");
    return;
    
    if (isPremium) {
      showToast("info", "Already Premium", "You are already a Premium member!");
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "premium_3months" })
      });
      const data = await res.json();
      
      if (!res.ok || !data.orderId) throw new Error(data.error || "Order creation failed");

      // Load Razorpay SDK
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
        description: "Premium Access - 3 Months",
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
              showToast("success", "Payment Successful!", "Premium access granted for 3 months. 🎉");
              window.location.reload();
            } else {
              showToast("error", "Verification Failed", "Payment received but verification failed. Contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            showToast("info", "Payment Status", "Payment may have succeeded. Please refresh.");
            window.location.reload();
          }
        },
        prefill: {
          email: "",
          name: "",
        },
        theme: { color: "#9333ea" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      showToast("error", "Payment Error", "Payment failed to initialize. Please try again.");
      setLoading(false);
    }
  };

  // Still loading premium status
  if (isPremium === null) {
    return <div className="text-white text-center py-8">Checking access...</div>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-purple-500/20 bg-[#16132b] text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-900/20 opacity-50 blur-[80px] -z-10" />
      
      <CardHeader className="text-center relative z-10 pb-2">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-[0_0_30px_rgba(147,51,234,0.25)]">
          <Lock className="w-8 h-8 text-purple-400 animate-pulse" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight">
          Unlock Premium Content
        </CardTitle>
        <CardDescription className="text-white/60 text-base mt-2">
          Gain full access to exclusive resources and verified insights
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-6 relative z-10 pt-4 max-w-md mx-auto">
        <p className="text-sm text-white/70 leading-relaxed">
          Upgrade to Premium for unlimited access to detailed interview rounds, technical questions, hidden behavioral strategies, and exclusive company resources.
        </p>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-2.5 text-left text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 font-bold" />
            <span>All 450+ interview experiences</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 font-bold" />
            <span>Specialized role roadmap skill trees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 font-bold" />
            <span>8+ Tier-1 premium company guides</span>
          </div>
        </div>

        <Button 
          onClick={handleUpgrade} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition transform hover:scale-[1.01]"
        >
          <Crown className="w-4 h-4 mr-2 text-white" />
          {loading ? "Initializing..." : "Unlock Premium — ₹149 / month"}
        </Button>
      </CardContent>
    </Card>
  );
}