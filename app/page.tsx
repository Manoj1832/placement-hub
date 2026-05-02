"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, Code2, BookOpen, Target } from "lucide-react";
import ExperienceCard from "@/components/experience-card";
import FloatingCards from "@/components/floating-cards";
import SplitText from "@/components/SplitText";
import LogoLoop from "@/components/LogoLoop";
import { useState } from "react";

export default function HomePage() {
  const recentExperiences = useQuery(api.experiences.getRecent, { limit: 4 });
  const { userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#2D1A5C] text-white overflow-hidden selection:bg-[#00FF7F] selection:text-black">
      {/* Background blobs for wavy effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#462888] opacity-50 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#392070] opacity-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#241350] opacity-80 blur-[80px]" />
      </div>

      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm relative flex items-center justify-center">
            <div className="w-3 h-3 bg-[#00FF7F] absolute -right-1 -top-1 rounded-sm" />
          </div>
          <Link href="/" className="text-xl font-bold tracking-tight text-white ml-2">
            psg.hub
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <Link href="/" className="text-white hover:text-[#00FF7F] transition">Home</Link>
          <Link href="/browse" className="hover:text-[#00FF7F] transition">Browse</Link>
          <Link href="/guidelines" className="hover:text-[#00FF7F] transition">Guidelines</Link>
          <Link href="#" className="hover:text-[#00FF7F] transition">Help</Link>
        </nav>

        <div className="flex items-center gap-6">
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-white hover:text-white/80 transition hidden md:block">
                  Sign In
                </button>
              </SignInButton>
              <Link href="/sign-up">
                <button className="text-sm font-semibold bg-[#00FF7F] text-black px-6 py-2.5 rounded-xl hover:bg-[#00e673] transition shadow-[0_0_20px_rgba(0,255,127,0.3)]">
                  Registration
                </button>
              </Link>
            </>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <SplitText 
                text="Really Good Interview and Technical Insights"
                className="text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.1]"
                delay={30}
                duration={1.25}
                ease={[0.215, 0.61, 0.355, 1]}
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                textAlign="left"
              />
              <p className="text-lg text-white/70 mb-10 leading-relaxed font-light">
                Finding the right company and role is not always easy, but with this platform you will see that finding the right insights can be easy and fast!
              </p>
              <Link href="/browse">
                <button className="text-base font-semibold bg-[#00FF7F] text-black px-8 py-3.5 rounded-xl hover:bg-[#00e673] transition shadow-[0_0_20px_rgba(0,255,127,0.3)] inline-flex items-center gap-2">
                  Browse Experiences
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="relative h-[400px] md:h-[500px] flex items-center justify-center animate-in fade-in zoom-in duration-1000">
              <FloatingCards />
            </div>
          </div>
        </section>

        {/* Company Logos Bar */}
        <div className="container mx-auto px-6 -mt-16 mb-20 relative z-20">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div style={{ height: '50px', position: 'relative' }}>
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
                logoHeight={40}
                gap={80}
                hoverSpeed={0}
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Recent Experiences */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-bold text-white">Recent Experiences</h3>
              <Link href="/browse" className="text-sm font-medium text-[#00FF7F] flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {recentExperiences?.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}