"use client";

import SubmitForm from "@/components/submit-form";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();

  const handleSuccess = () => {
    alert("Experience submitted successfully! It will be reviewed by an admin.");
    router.push("/browse");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Share Your Experience</h1>
      <SubmitForm onSuccess={handleSuccess} />
    </div>
  );
}