import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import ConvexClientProvider from "@/components/convex-provider";
import { ToastProvider } from "@/components/toast-modal";
import "./globals.css";

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
    <html lang="en">
      <body>
        <AuthProvider>
          <ConvexClientProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}