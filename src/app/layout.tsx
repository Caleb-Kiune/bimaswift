import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kentab Insurance Bima Swift Quotation App",
  description: "A Web Application Where Users can Get Quick Free Insurance Premium Quotes at the click of a button.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white py-4 border-b border-gray-200">
          <div className="flex justify-center gap-10 text-lg">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              About
            </Link>

            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </nav>

        <main className="py-8 px-6">
          {children}
        </main>
      </body>
    </html>
  );
}