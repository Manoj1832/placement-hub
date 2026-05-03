import Header from "@/components/header";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#2D1A5C] text-white">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 border-b border-white/10">
        <Link href="/" className="text-sm text-white/60 hover:text-white inline-flex items-center transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
          <Construction className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Placement Roadmap</h1>
        <p className="text-lg text-white/60 max-w-lg mb-8">
          We are building a step-by-step roadmap tailored for your branch to help you land your dream job. Coming soon!
        </p>
        <Link href="/browse">
          <button className="bg-[#00FF7F] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#00cc66] transition shadow-[0_0_15px_rgba(0,255,127,0.3)]">
            Read Interview Experiences instead
          </button>
        </Link>
      </main>
    </div>
  );
}
