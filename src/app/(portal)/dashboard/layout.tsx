"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Layout({
  children,
  analytics,
  recentQuotes,
  modal
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  recentQuotes: React.ReactNode;
  modal: React.ReactNode
}) {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <div className="flex min-h-screen">
      <nav className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="p-4">
          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "font-bold text-black block py-2" : "text-black block py-2"}
          >
            Overview
          </Link>
          <Link
            href="/dashboard/new-quote"
            className={
              pathname === "/dashboard/new-quote" ? "font-bold text-black block py-2" : "text-black block py-2"
            }
          >
            New Quote
          </Link>
        </div>
      </nav>

      <div className="flex-1 p-6 space-y-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 text-black">
          {children}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 text-black">
          {analytics}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 text-black">
          {recentQuotes}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 text-black">
          {modal}
        </div>
      </div>
    </div>
  );
}