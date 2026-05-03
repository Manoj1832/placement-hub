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
                text="Really Good Interview and Technical Insights"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-[1.1]"
                delay={30}
                duration={1.25}
                ease={[0.215, 0.61, 0.355, 1]}
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                textAlign="left"
              />
              <p className="text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-8 leading-relaxed font-light">
                Finding the right company and role is not always easy, but with this platform you will see that finding the right insights can be easy and fast!
              </p>
              <Link href="/browse">
                <button className="text-sm sm:text-base font-semibold bg-[#00FF7F] text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-[#00e673] transition shadow-[0_0_20px_rgba(0,255,127,0.3)] inline-flex items-center gap-2">
                  Browse Experiences
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="relative h-[300px] sm:h-[350px] md:h-[450px] flex items-center justify-center animate-in fade-in zoom-in duration-1000">
              <FloatingCards />
            </div>
          </div>
        </section>

        {/* Company Logos Bar */}
        <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-20">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div style={{ height: '40px', position: 'relative' }}>
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
                logoHeight={35}
                gap={60}
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

        {/* Resume Tips Section - Placeholder */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6 sm:mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Resume Tips</h3>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Target className="w-6 h-6" />, title: "ATS-Friendly Format", desc: "Learn how to structure your resume to pass Applicant Tracking Systems used by top companies." },
                { icon: <Sparkles className="w-6 h-6" />, title: "Action Words That Work", desc: "Replace weak verbs with powerful action words that grab recruiter attention in 6 seconds." },
                { icon: <BookOpen className="w-6 h-6" />, title: "Project Descriptions", desc: "Frame your projects with impact metrics and technical depth that interviewers love." },
              ].map((tip, i) => (
                <div key={i} className="group bg-[#392070]/60 backdrop-blur border border-white/10 rounded-xl p-5 sm:p-6 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-500/30 transition">
                    {tip.icon}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-2">{tip.title}</h4>
                  <p className="text-sm text-white/60 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 sm:mt-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300">
                <Sparkles className="w-4 h-4" /> More resume tips coming soon
              </span>
            </div>
          </div>
        </section>

        {/* Roadmap Section - Placeholder */}
        <section className="py-12 sm:py-16 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6 sm:mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Placement Roadmap</h3>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden sm:block absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />
              <div className="space-y-4 sm:space-y-6">
                {[
                  { step: "1", title: "Foundation (Sem 3-4)", desc: "Build DSA fundamentals, start competitive coding, and strengthen core CS subjects.", color: "from-blue-500 to-cyan-500" },
                  { step: "2", title: "Skill Building (Sem 5)", desc: "Work on 2-3 solid projects, contribute to open source, and prepare your resume.", color: "from-purple-500 to-pink-500" },
                  { step: "3", title: "Practice Phase (Sem 6)", desc: "Solve 200+ LeetCode problems, practice system design basics, and do mock interviews.", color: "from-pink-500 to-red-500" },
                  { step: "4", title: "Placement Season (Sem 7-8)", desc: "Apply strategically, leverage PSG Hub insights, and crack your dream company!", color: "from-green-500 to-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 items-start">
                    <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {item.step}
                    </div>
                    <div className="flex-1 bg-[#392070]/60 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-5 hover:border-white/20 transition">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-6 sm:mt-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-300">
                <TrendingUp className="w-4 h-4" /> Detailed roadmaps coming soon
              </span>
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