import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkLens — dashboard mockup",
  description: "UI mockup. Verified Phase 1 structural counts only. No backend.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
