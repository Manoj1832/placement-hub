import type { Metadata } from "next";
import ConvexClientProvider from "@/components/convex-provider";
import { ToastProvider } from "@/components/toast-modal";
import ClickSpark from "@/components/ui/click-spark";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "PSG Placement Hub",
  description: "Campus placement experiences and resources for PSG College students",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <ConvexClientProvider>
          <ToastProvider>
            <ClickSpark
              sparkColor="#d4d4d4"
              sparkSize={8}
              sparkRadius={16}
              sparkCount={6}
              duration={350}
            >
              {children}
            </ClickSpark>
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}