import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: "AemroSprint",
  description:
    "AI academic survival assistant — syllabus summaries, study roadmaps, quizzes, and exam cram mode.",
};

export const viewport = {
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "#151b2e";
const DARK_THEME_COLOR = "#0f131f";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

const DIAGNOSTIC_SCRIPT = `\
window.addEventListener('error', function(e) {
  var overlay = document.getElementById('error-diagnostic-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    overlay.innerText = '⚠️ Client Runtime Error: ' + e.message + ' (' + e.filename + ':' + e.lineno + ')';
  }
});
window.addEventListener('unhandledrejection', function(e) {
  var overlay = document.getElementById('error-diagnostic-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    overlay.innerText = '⚠️ Unhandled Promise Rejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason));
  }
});
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: DIAGNOSTIC_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div
          id="error-diagnostic-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "rgba(239, 68, 68, 0.98)",
            color: "white",
            zIndex: 9999999,
            padding: "14px 20px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "13px",
            lineHeight: "1.5",
            fontWeight: "bold",
            display: "none",
            wordBreak: "break-all",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            borderBottom: "3px solid #b91c1c"
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
