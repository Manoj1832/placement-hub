"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Crown, LogIn, LogOut, User, ArrowUpRight } from "lucide-react";
import gsap from "gsap";

const NAV_CARDS = [
  {
    label: "Explore",
    bgColor: "#1B1722",
    textColor: "#fff",
    links: [
      { label: "Browse Experiences", href: "/browse", ariaLabel: "Browse experiences" },
      { label: "How It Works", href: "/how-it-works", ariaLabel: "How it works" },
    ],
  },
  {
    label: "Prepare",
    bgColor: "#2F293A",
    textColor: "#fff",
    links: [
      { label: "DSA Roadmap", href: "/roadmap", ariaLabel: "DSA Roadmap" },
      { label: "custResume & Vault", href: "/resume-tips", ariaLabel: "Resume tips" },
    ],
  },
  {
    label: "Account",
    bgColor: "#2F293A",
    textColor: "#fff",
    links: [
      { label: "Dashboard", href: "/dashboard", ariaLabel: "Dashboard" },
      { label: "Saved", href: "/saved", ariaLabel: "Saved experiences" },
      { label: "Guidelines", href: "/guidelines", ariaLabel: "Guidelines" },
    ],
  },
];

export default function Header() {
  const { user: session, signOut } = useAuth();
  const userId = session?.email;
  const router = useRouter();
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

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
    if (isMobile) return 340;
    return 220;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
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

  return (
    <div className="sticky top-0 z-50 flex justify-center px-3 pt-3">
      <nav
        ref={navRef}
        className="w-full max-w-[900px] h-[60px] rounded-2xl shadow-2xl relative overflow-hidden will-change-[height] backdrop-blur-xl"
        style={{ backgroundColor: "rgba(20, 10, 40, 0.92)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Top Bar */}
        <div className="absolute inset-x-0 top-0 h-[60px] flex items-center justify-between px-4 z-[2]">
          {/* Hamburger */}
          <button
            onClick={toggleMenu}
            className="group flex flex-col items-center justify-center gap-[5px] cursor-pointer h-full w-10"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
          >
            <div className={`w-[22px] h-[2px] bg-white/80 transition-all duration-300 origin-center ${isHamburgerOpen ? "translate-y-[3.5px] rotate-45" : ""} group-hover:bg-white`} />
            <div className={`w-[22px] h-[2px] bg-white/80 transition-all duration-300 origin-center ${isHamburgerOpen ? "-translate-y-[3.5px] -rotate-45" : ""} group-hover:bg-white`} />
          </button>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#22C55E] absolute -right-0.5 -top-0.5 rounded-sm" />
            </div>
            <span className="text-lg font-bold text-white">psg.hub</span>
          </Link>

          {/* Right: Auth */}
          <div className="flex items-center gap-2">
            {isPremium && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full">
                <Crown className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[10px] font-bold text-[#22C55E] uppercase">Pro</span>
              </div>
            )}
            {session ? (
              <button onClick={() => { signOut(); }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                {isPremium ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#1E1B4B] flex items-center justify-center text-xs font-bold text-[#22C55E]">
                      {session?.name?.charAt(0).toUpperCase() || <Crown className="w-3 h-3" />}
                    </div>
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><User className="w-3.5 h-3.5 text-white/60" /></div>
                )}
                <span className="hidden sm:inline text-sm text-white/80 font-medium truncate max-w-[100px]">{session?.name?.split(" ")[0] || "User"}</span>
              </button>
            ) : (
              <button onClick={() => router.push("/sign-in")} className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-black rounded-xl font-semibold text-sm transition shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Card Content */}
        <div
          className={`absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col md:flex-row items-stretch gap-2 z-[1] ${isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}
          aria-hidden={!isExpanded}
        >
          {NAV_CARDS.map((item, idx) => (
            <div
              key={item.label}
              ref={setCardRef(idx)}
              className="relative flex flex-col gap-2 p-3 rounded-xl min-w-0 flex-[1_1_auto] md:flex-[1_1_0%]"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="font-medium text-base md:text-lg tracking-tight opacity-60">{item.label}</div>
              <div className="mt-auto flex flex-col gap-1">
                {item.links.map((lnk) => (
                  <Link
                    key={lnk.href}
                    href={lnk.href}
                    className="inline-flex items-center gap-1.5 text-sm md:text-[15px] text-white/90 hover:text-[#22C55E] transition-colors no-underline"
                    onClick={() => { setIsHamburgerOpen(false); tlRef.current?.reverse(); setTimeout(() => setIsExpanded(false), 400); }}
                    aria-label={lnk.ariaLabel}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    {lnk.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
