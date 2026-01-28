import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { HybridChatButton } from "./components/HybridChatButton";
import { Providers } from "./providers";
import NotificationListener from "./components/NotificationListener";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Home | Godfirst Education and Tours",
  description: "Your trusted partner in education and travel services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const getResolvedTheme = (t) => {
                  if (t === 'system') {
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  return t;
                };
                const resolved = getResolvedTheme(theme);
                if (resolved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider>
            <NotificationListener />
            {children}
            <HybridChatButton />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
