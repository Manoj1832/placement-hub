"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Crown, LogIn, LogOut, User } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const userId = session?.user?.email;
  const [isPremium, setIsPremium] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="bg-[#241350] border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-sm relative flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00FF7F] absolute -right-1 -top-1 rounded-sm" />
            </div>
            <Link href="/" className="text-xl font-bold text-white ml-2">
              psg.hub
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            <Link href="/" className="hover:text-[#00FF7F] transition">Home</Link>
            <Link href="/browse" className="hover:text-[#00FF7F] transition">Browse</Link>
            <Link href="/guidelines" className="hover:text-[#00FF7F] transition">Guidelines</Link>
          </nav>

          {/* Auth + Premium */}
          <div className="flex items-center gap-3">
            {isPremium && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF7F]/10 border border-[#00FF7F]/30 rounded-full">
                <Crown className="w-4 h-4 text-[#00FF7F]" />
                <span className="text-xs font-semibold text-[#00FF7F]">Premium</span>
              </div>
            )}

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#392070] hover:bg-[#462888] rounded-lg border border-white/10 transition"
                >
                  <User className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white hidden sm:inline truncate max-w-[120px]">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#241350] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm text-white font-medium truncate">{session.user?.name}</p>
                      <p className="text-xs text-white/50 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-sm text-white/80 hover:bg-[#392070] transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-3 py-2 text-sm text-white/80 hover:bg-[#392070] transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Saved Experiences
                    </Link>
                    {!isPremium && (
                      <Link
                        href="/browse"
                        className="block px-3 py-2 text-sm text-[#00FF7F] hover:bg-[#392070] transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Crown className="w-3 h-3 inline mr-1" />
                        Get Premium
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#392070] transition"
                    >
                      <LogOut className="w-3 h-3 inline mr-1" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center gap-2 px-4 py-2 bg-[#00FF7F] hover:bg-[#00cc66] text-black rounded-lg font-semibold text-sm transition shadow-[0_0_15px_rgba(0,255,127,0.3)]"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
