import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "DraftLoop — Organic Content Engine",
  description: "Turn raw ideas into platform-native, scored social post drafts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-neutral-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
