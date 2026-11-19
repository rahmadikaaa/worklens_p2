import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkLens Dashboard (mockup)",
  description: "UI mockup with synthetic data. Not connected to any backend or source workbook.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
