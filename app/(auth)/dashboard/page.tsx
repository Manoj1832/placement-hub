"use client";

import AdminTable from "@/components/admin-table";
import Header from "@/components/header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-4 border-b border-zinc-800">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        <AdminTable />
      </div>
    </div>
  );
}
