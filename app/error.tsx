"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, ArrowLeft } from "lucide-react";

export default function Error({
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
        <p className="text-white/60 mb-8">
          We encountered an error while trying to load this content. Please try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#22C55E] text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-[#4ADE80] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-left bg-black/40 p-4 rounded-lg overflow-auto text-xs font-mono text-amber-300 border border-amber-900/30">
            <p className="font-bold mb-1">Developer Details:</p>
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
