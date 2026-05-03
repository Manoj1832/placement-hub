"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

interface PremiumGateProps {
  children: React.ReactNode;
}

export default function PremiumGate({ children }: PremiumGateProps) {
  const { user } = useAuth();
  const userId = user?.email;
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  // Check premium status via API
  useEffect(() => {
    if (userId) {
      fetch("/api/user/sync")
        .then((res) => res.json())
        .then((data) => setIsPremium(data.isPremium))
        .catch(() => setIsPremium(false));
    } else {
      setIsPremium(false);
    }
  }, [userId]);

  const handleUpgrade = async () => {
    if (!userId) {
      alert("Please sign in first to upgrade to Premium!");
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 9900 })
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: "Premium Access - ₹99/yr",
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
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsPremium(true);
              alert("🎉 Payment Successful! Premium access granted for 1 year.");
              window.location.reload();
            } else {
              alert("Payment received but verification failed. Contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment may have succeeded. Please refresh.");
            window.location.reload();
          }
        },
        prefill: {
          email: userId,
          name: user?.name || "",
        },
        theme: { color: "#2D1A5C" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed to initialize.");
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
    <Card className="border-2 border-[#00FF7F]/20 bg-[#241350] text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#392070] opacity-50 blur-[80px] -z-10" />
      
      <CardHeader className="text-center relative z-10 pb-2">
        <div className="w-16 h-16 rounded-full bg-[#00FF7F]/10 flex items-center justify-center mx-auto mb-4 border border-[#00FF7F]/20">
          <Lock className="w-8 h-8 text-[#00FF7F]" />
        </div>
        <CardTitle className="text-2xl font-bold text-white tracking-tight">Premium Content</CardTitle>
        <CardDescription className="text-white/60 text-base mt-2">
          Unlock the full experience and discover exclusive insights
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6 relative z-10 pt-4">
        <p className="text-sm text-white/70">
          Get unlimited access to detailed interview rounds, technical questions, hidden behavioral strategies, and exclusive company resources.
        </p>
        <Button 
          onClick={handleUpgrade} 
          disabled={loading}
          className="w-full bg-[#00FF7F] text-black hover:bg-[#00cc66] font-semibold text-base py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,127,0.3)] transition"
        >
          {loading ? "Initializing..." : "Unlock Premium - ₹99"}
        </Button>
      </CardContent>
    </Card>
  );
}