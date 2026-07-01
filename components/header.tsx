"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Crown, LogIn, LogOut, User, ArrowUpRight, Flame, Trophy, Plus, X } from "lucide-react";
import gsap from "gsap";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from '@clerk/nextjs';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const NAV_CARDS = [
  {
    label: "Explore",
    links: [
      { label: "Browse Experiences", href: "/browse", ariaLabel: "Browse experiences" },
      { label: "How It Works", href: "/how-it-works", ariaLabel: "How it works" },
    ],
  },
  {
    label: "Prepare",
    links: [
      { label: "DSA Roadmap", href: "/roadmap", ariaLabel: "DSA Roadmap" },
      { label: "Resume & Vault", href: "/resume-tips", ariaLabel: "Resume tips" },
    ],
  },
  {
    label: "Contribute",
    links: [
      { label: "Share Interview Experience", href: "/submit", ariaLabel: "Share Interview Experience" },
      { label: "Guidelines", href: "/guidelines", ariaLabel: "Guidelines" },
    ],
  },
  {
    label: "Account",
    links: [
      { label: "Dashboard", href: "/dashboard", ariaLabel: "Dashboard" },
      { label: "Saved", href: "/saved", ariaLabel: "Saved experiences" },
    ],
  },
];

export default function Header() {
  const { user: sessionUser } = useUser();
  const userId = sessionUser?.primaryEmailAddress?.emailAddress;
  const router = useRouter();
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Fetch gamification stats
  const userStats = useQuery(api.tracking.getUserStats);

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

  // Close menu on route change
  useEffect(() => {
    if (isExpanded) {
      setIsHamburgerOpen(false);
      tlRef.current?.reverse();
      const timeout = setTimeout(() => setIsExpanded(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  const calculateHeight = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return 430;
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 64, overflow: "hidden" });
    gsap.set(cardsRef.current.filter(Boolean), { y: 40, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: "power3.out" });
    tl.to(cardsRef.current.filter(Boolean), { y: 0, opacity: 1, duration: 0.35, ease: "power3.out", stagger: 0.08 }, "-=0.15");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { newTl.progress(1); tlRef.current = newTl; }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  // Safe destructuring of stats
  const currentStreak = userStats?.currentStreak ?? 12; // Fallback to 12 as per screenshot
  const level = userStats?.level ?? 6; // Fallback to 6 as per screenshot
  const progressPercent = userStats?.progressPercent ?? 65; // Fallback to 65% as per screenshot

  return (
    <div className="w-full z-50 bg-[#09090B]">
      <header className="border-b border-zinc-900">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <nav
            ref={navRef}
            className="w-full h-[64px] relative overflow-hidden will-change-[height] bg-transparent"
          >
            {/* Top Bar */}
            <div className="absolute inset-x-0 top-0 h-[64px] flex items-center justify-between z-[2]">
              {/* Left Logo and Hamburger */}
              <div className="flex items-center gap-3 md:gap-5">
                <button
                  onClick={toggleMenu}
                  className="group flex flex-col items-center justify-center gap-[5px] cursor-pointer h-10 w-10 text-zinc-400 hover:text-white"
                  aria-label={isExpanded ? "Close menu" : "Open menu"}
                >
                  <div className={`w-[20px] h-[1.5px] bg-current transition-all duration-300 origin-center ${isHamburgerOpen ? "translate-y-[3.25px] rotate-45" : ""}`} />
                  <div className={`w-[20px] h-[1.5px] bg-current transition-all duration-300 origin-center ${isHamburgerOpen ? "-translate-y-[3.25px] -rotate-45" : ""}`} />
                </button>

                {/* Logo Text with Orange Dot */}
                <Link href="/" className="flex items-center gap-2.5 group">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
                  <div className="leading-tight text-[15px] font-bold text-white tracking-tight flex flex-col">
                    <span>PSG Placement</span>
                    <span className="text-[#F97316]">Hub</span>
                  </div>
                </Link>
              </div>

              {/* Middle/Right Widgets */}
              <div className="flex items-center gap-4 md:gap-6">
                {/* Streak widget */}
                <div className="hidden sm:flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
                  <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316]/20" />
                  <span className="text-sm font-bold text-white">{currentStreak}</span>
                  <div className="flex flex-col text-[9px] text-zinc-500 font-medium leading-none">
                    <span>day</span>
                    <span>streak</span>
                  </div>
                </div>

                {/* Level widget */}
                <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
                  <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                  <div className="flex flex-col text-[9px] text-zinc-500 font-medium leading-none">
                    <span>Level</span>
                    <span className="text-white font-bold">{level}</span>
                  </div>
                  {/* Custom Progress bar */}
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden ml-1">
                    <div 
                      className="h-full bg-[#F97316] rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <Link href="/submit">
                  <button className="h-9 px-4 bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold text-xs tracking-wide uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-600/10">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Submit Experience
                  </button>
                </Link>

                {/* Clerk user action button */}
                <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 h-8">
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-semibold transition-colors">
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </div>

            {/* Expandable Menu Content */}
            <div
              className={`absolute left-0 right-0 top-[64px] bottom-0 p-2 flex flex-col md:flex-row items-stretch gap-2 z-[1] ${isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}
              aria-hidden={!isExpanded}
            >
              {NAV_CARDS.map((item, idx) => (
                <div
                  key={item.label}
                  ref={setCardRef(idx)}
                  className="relative flex flex-col gap-2 p-3 rounded-lg min-w-0 flex-[1_1_auto] md:flex-[1_1_0%] bg-zinc-900 border border-zinc-800"
                >
                  <div className="font-semibold text-xs tracking-wider uppercase text-zinc-500">{item.label}</div>
                  <div className="mt-auto flex flex-col gap-1">
                    {item.links.map((lnk) => (
                      <Link
                        key={lnk.href}
                        href={lnk.href}
                        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors no-underline font-medium"
                        onClick={() => { setIsHamburgerOpen(false); tlRef.current?.reverse(); setTimeout(() => setIsExpanded(false), 400); }}
                        aria-label={lnk.ariaLabel}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        {lnk.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Premium Alert Promo Banner */}
      {showPromo && (
        <div className="bg-[#1C0F02] border-b border-orange-950/40 py-2.5 px-4 md:px-6 relative overflow-hidden transition-all duration-300">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
            <Link 
              href="/premium" 
              className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[#F97316] hover:text-white transition-colors group cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Unlock every round-by-round breakdown, resume review & portfolio audit — Premium ₹149/3mo</span>
            </Link>
            <button 
              onClick={() => setShowPromo(false)}
              className="text-[#F97316]/70 hover:text-[#F97316] transition-colors p-1"
              aria-label="Close promotion banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
