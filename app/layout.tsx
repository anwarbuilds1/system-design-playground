import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "System Design Playground",
  description: "Learn system design by building it. Construct architectures, run simulations, and see the trade-offs behind real-world systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
