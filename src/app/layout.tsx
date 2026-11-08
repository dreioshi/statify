import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = { title: "Statify | Advanced Statistics Analysis Studio", description: "Statify — From Data to Statistical Insight. An ADVSTAT learning and analysis workspace for Modules 7 and 9.", icons: { icon: "/favicon.png", apple: "/statify-logo.png" } };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body><ThemeProvider><AuthProvider><AppShell>{children}</AppShell></AuthProvider></ThemeProvider></body>
    </html>
  );
}
