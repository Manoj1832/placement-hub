"use client";

import SubmitForm from "@/components/submit-form";
import Header from "@/components/header";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubmitPage() {
  const router = useRouter();

  const handleSuccess = () => {
    alert("Experience submitted successfully! It will be reviewed by an admin.");
    router.push("/browse");
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-4 border-b border-zinc-800">
        <Link href="/browse" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to browse
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-8">Share Your Experience</h1>
        <SubmitForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
