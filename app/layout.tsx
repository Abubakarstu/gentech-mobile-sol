import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsScripts } from "@/features/analytics/components/analytics-scripts";
import { PageViewTracker } from "@/features/analytics/components/page-view-tracker";
import { APP_URL } from "@/lib/app-url";
import { APP } from "@/lib/constants";
import "./globals.css";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP.name} — Buy & Sell Mobile Phones`,
    template: `%s · ${APP.name}`,
  },
  description: APP.description,
  applicationName: APP.name,
  openGraph: {
    type: "website",
    siteName: APP.name,
    title: APP.name,
    description: APP.description,
    url: APP_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
