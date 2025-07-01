import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tic-Tac-Toe Game",
  description:
    "A modern, responsive Tic-Tac-Toe game built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${outfit.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>{children}</main>

            <footer>
              <div className="text-center text-sm text-muted-foreground p-8">
                © {new Date().getFullYear()} MADE BY VINCENT.
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
