"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ArrowRight, FileText, Map, Sparkles, BookOpen, Target, TrendingUp } from "lucide-react";
import ExperienceCard from "@/components/experience-card";
import FloatingCards from "@/components/floating-cards";
import SplitText from "@/components/SplitText";
import LogoLoop from "@/components/LogoLoop";
import Header from "@/components/header";

export default function HomePage() {
  const recentExperiences = useQuery(api.experiences.getRecent, { limit: 4 });

  return (
    <div className="min-h-screen bg-[#2D1A5C] text-white overflow-hidden selection:bg-[#00FF7F] selection:text-black">
      <Header />

      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#462888] opacity-50 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#392070] opacity-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#241350] opacity-80 blur-[80px]" />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-2 sm:pt-6 md:pt-8 pb-4 sm:pb-6 md:pb-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="max-w-xl">
              <SplitText 
                text="Real Interview Insights & Strategies"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-[1.1]"
                delay={30}
                duration={1.25}
                ease={[0.215, 0.61, 0.355, 1]}
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                textAlign="left"
              />
              <p className="text-sm sm:text-base md:text-lg text-white/70 mb-5 sm:mb-6 leading-relaxed font-light">
                Discover the right company and role for you. Fast-track your placement prep with authentic experiences.
              </p>
              <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
                <Link href="/browse">
                  <button className="text-xs sm:text-sm font-semibold bg-[#00FF7F] text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-[#00e673] transition shadow-[0_0_15px_rgba(0,255,127,0.3)] inline-flex items-center gap-1.5">
                    Browse Experiences
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <Link href="/resume-tips">
                  <button className="text-xs sm:text-sm font-semibold bg-[#392070]/60 backdrop-blur text-white border border-white/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-[#392070] hover:border-white/20 transition inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Resume Tips
                  </button>
                </Link>
                <Link href="/roadmap">
                  <button className="text-xs sm:text-sm font-semibold bg-[#392070]/60 backdrop-blur text-white border border-white/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-[#392070] hover:border-white/20 transition inline-flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-blue-400" />
                    Roadmap
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[350px] md:h-[450px] flex items-center justify-center animate-in fade-in zoom-in duration-1000">
              <FloatingCards />
            </div>
          </div>
        </section>

        {/* Company Logos Bar */}
        <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-20">
          <div className="bg-white rounded-[1.5rem] p-3 sm:p-5 shadow-2xl relative overflow-hidden">
            <div style={{ height: '30px', position: 'relative' }}>
              <LogoLoop
                logos={[
                  { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", alt: "Meta" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg", alt: "Goldman Sachs" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", alt: "IBM" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg", alt: "Cisco" },
                  { src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg", alt: "TCS" }
                ]}
                speed={40}
                direction="left"
                logoHeight={24}
                gap={50}
                hoverSpeed={0}
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Recent Experiences */}
        <section className="py-12 sm:py-16 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 sm:mb-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Recent Experiences</h3>
              <Link href="/browse" className="text-xs sm:text-sm font-medium text-[#00FF7F] flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {recentExperiences?.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
          </div>
        </section>



        {/* Footer */}
        <footer className="py-8 sm:py-10 border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-sm relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#00FF7F] absolute -right-0.5 -top-0.5 rounded-sm" />
                </div>
                <span className="text-sm font-bold text-white">psg.hub</span>
              </div>
              <p className="text-xs text-white/40">© 2026 PSG Placement Hub. Built for PSG College students.</p>
              <div className="flex gap-4 text-xs text-white/50">
                <Link href="/guidelines" className="hover:text-white transition">Guidelines</Link>
                <Link href="/browse" className="hover:text-white transition">Browse</Link>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}