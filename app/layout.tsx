import type { Metadata } from "next";
import { SessionProvider } from "@/components/session-provider";
import ConvexClientProvider from "@/components/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PSG Placement Hub",
  description: "Campus placement experiences and resources for PSG College students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}