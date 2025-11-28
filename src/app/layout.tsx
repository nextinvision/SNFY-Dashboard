import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNFYI Feed Management",
  description: "Admin dashboard for StartupNews.fyi feed operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
