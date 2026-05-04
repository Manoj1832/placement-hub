"use client";

import Header from "@/components/header";
import Link from "next/link";
import { ArrowLeft, FileText, Lock, Crown, Download, Eye, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-modal";

const TEMPLATES = [
  { id: 1, title: "The Google SWE Standard", role: "Software Engineer", downloads: "2.4k", rating: "4.9", color: "from-blue-500/20 to-blue-900/20", iconColor: "text-blue-400" },
  { id: 2, title: "Amazon Leadership Focus", role: "SDE / Analyst", downloads: "1.8k", rating: "4.8", color: "from-orange-500/20 to-orange-900/20", iconColor: "text-orange-400" },
  { id: 3, title: "Data Science & AI", role: "Data Scientist", downloads: "950", rating: "4.7", color: "from-emerald-500/20 to-emerald-900/20", iconColor: "text-emerald-400" },
];

const VAULT_ITEMS = [
  { id: 1, name: "Google L3 SWE", year: "2023", branch: "CSE" },
  { id: 2, name: "Amazon SDE-1", year: "2024", branch: "IT" },
  { id: 3, name: "Microsoft SWE", year: "2023", branch: "CSE" },
  { id: 4, name: "Atlassian SDE", year: "2024", branch: "ECE" },
];

export default function ResumeTipsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "vault">("templates");
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const { user: sessionUser, loading: sessionLoading } = useAuth();
  const userId = sessionUser?.email as string | undefined;
  const router = useRouter();
  const { showToast } = useToast();

  // Check premium status
  useEffect(() => {
    if (!sessionLoading && userId) {
      fetch("/api/user/sync")
        .then((res) => res.json())
        .then((data) => setIsPremiumUser(data.isPremium))
        .catch(console.error);
    }
  }, [sessionLoading, userId]);

  const handleUpgrade = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    try {
      setUpgradeLoading(true);

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "resume_vault" }),
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
        description: data.description || "Resume Vault — ₹199 Lifetime",
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
                productId: "resume_vault",
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsPremiumUser(true);
              showToast("success", "Payment Successful!", "You now have Premium access for 1 year. 🎉");
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
          email: userId,
          name: sessionUser?.name || "",
        },
        theme: { color: "#eab308" },
        modal: {
          ondismiss: function () {
            setUpgradeLoading(false);
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment init error:", err);
      showToast("error", "Payment Error", err.message || "Payment failed to initialize. Please try again.");
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D1A5C] text-white overflow-x-hidden">
      <Header />
      
      <div className="w-full px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-sm text-white/60 hover:text-white inline-flex items-center transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3">custResume & Vault</h1>
            <p className="text-sm sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed px-2">
              Download proven templates or view actual resumes that cracked top companies.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="bg-black/40 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl inline-flex border border-white/10 w-full max-w-md sm:w-auto">
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "templates" ? "bg-[#22C55E] text-black shadow-lg" : "text-white/70 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Templates
              </button>
              <button
                onClick={() => setActiveTab("vault")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "vault" ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" : "text-white/70 hover:text-white"
                }`}
              >
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                Alumni Vault
              </button>
            </div>
          </div>

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {TEMPLATES.map((template) => (
                <Card key={template.id} className="bg-zinc-900/60 border-zinc-800 backdrop-blur hover:border-zinc-700 transition-colors overflow-hidden">
                  <div className={`h-24 sm:h-32 bg-gradient-to-br ${template.color} flex items-center justify-center border-b border-white/5`}>
                    <FileText className={`w-10 h-10 sm:w-12 sm:h-12 ${template.iconColor}`} />
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-1 truncate">{template.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4">Best for: {template.role}</p>
                    
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-300 mb-4 sm:mb-6">
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {template.downloads}</span>
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" /> {template.rating}</span>
                    </div>

                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs sm:text-sm">
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Vault Tab */}
          {activeTab === "vault" && (
            <div className="relative min-h-[400px]">
              
              {/* Blurred Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${!isPremiumUser ? "blur-sm pointer-events-none opacity-40 select-none" : ""}`}>
                {VAULT_ITEMS.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row border border-zinc-800 rounded-xl bg-zinc-900/60 overflow-hidden">
                    <div className="h-20 sm:h-auto sm:w-1/3 bg-zinc-800 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-700">
                      <FileText className="w-8 h-8 text-zinc-500" />
                    </div>
                    <div className="p-4 sm:p-5 flex-1">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-bold text-base sm:text-lg text-white">{item.name}</h3>
                        <Crown className="w-4 h-4 text-yellow-500 shrink-0 ml-2" />
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 mb-3">{item.branch} • Placed in {item.year}</p>
                      <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-xs sm:text-sm">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        View Full Resume
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium Overlay CTA */}
              {!isPremiumUser && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 sm:px-6 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Unlock the Alumni Vault</h2>
                  <p className="text-sm sm:text-lg text-zinc-300 max-w-md mb-6 sm:mb-8 leading-relaxed">
                    Get exclusive access to the exact resumes used by PSG alumni to secure offers at top companies.
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-sm sm:text-lg shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  >
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {upgradeLoading ? "Processing..." : "Unlock Vault — ₹199 Lifetime"}
                  </Button>
                </div>
              )}
              
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
