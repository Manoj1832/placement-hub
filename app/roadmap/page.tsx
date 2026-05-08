"use client";

import Header from "@/components/header";
import Link from "next/link";
import { ArrowLeft, Code2, Briefcase, Building2, Target } from "lucide-react";
import { useState } from "react";
import RoleSkillTree from "@/components/roadmap/role-skill-tree";
import CompanyGuide from "@/components/roadmap/company-guide";
import DsaRoadmap from "@/components/roadmap/dsa-roadmap";
import DsaTracker from "@/components/roadmap/dsa-tracker";

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<"dsa" | "track" | "roles" | "companies">("dsa");

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
      <Header />

      <div className="w-full px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-sm text-white/60 hover:text-white inline-flex items-center transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Placement Roadmap
            </h1>
            <p className="text-sm sm:text-lg text-white/50 max-w-2xl mx-auto">
              Interactive skill trees and company-specific prep guides built from real PSG placement data.
            </p>
          </div>

          <div className="flex justify-center mb-10 w-full">
            <div className="bg-black/50 backdrop-blur-md p-1.5 rounded-xl flex flex-wrap sm:inline-flex gap-1.5 border border-white/10 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("dsa")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "dsa" ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg" : "text-white/60 hover:text-white bg-white/5 sm:bg-transparent"
                }`}
              >
                <Code2 className="w-4 h-4 inline mr-2" />
                DSA Tree
              </button>
              <button
                onClick={() => setActiveTab("track")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "track" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg" : "text-white/60 hover:text-white bg-white/5 sm:bg-transparent"
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Tracker
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "roles" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-white/60 hover:text-white bg-white/5 sm:bg-transparent"
                }`}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Role Trees
              </button>
              <button
                onClick={() => setActiveTab("companies")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "companies" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white bg-white/5 sm:bg-transparent"
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Company Guides
              </button>
            </div>
          </div>

          {activeTab === "dsa" && <DsaRoadmap />}

          {activeTab === "track" && <DsaTracker />}

          {activeTab === "roles" && <RoleSkillTree />}
          {activeTab === "companies" && <CompanyGuide />}
        </div>
      </main>
    </div>
  );
}
