"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#2D1A5C] flex items-center justify-center p-4 text-white">
          <div className="max-w-md w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-3">Something went wrong!</h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              We&apos;re sorry, but an unexpected error occurred. Our team has been notified and is looking into it.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[#4ADE80] transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/10"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left bg-black/50 p-4 rounded-lg overflow-auto text-xs font-mono text-red-300">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
