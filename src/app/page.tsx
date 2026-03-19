"use client";

import { useState } from "react";
import QuoteForm from "@/src/features/motor/components/QuoteForm";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"motor" | "medical">("motor");

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header & Toggle Switch */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            Premium Calculator
          </h1>

          <div className="inline-flex bg-gray-200 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setActiveTab("motor")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "motor"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Motor Insurance
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "medical"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Medical Insurance
            </button>
          </div>
        </div>

        {/* The Calculators */}
        <div>
          {activeTab === "motor" ? (
            <QuoteForm />
          ) : (
            <div className="bg-white p-14 rounded-2xl border border-gray-200 shadow-sm text-center">
              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Medical Calculator
              </h2>

              {/* Divider */}
              <div className="w-10 h-px bg-gray-300 mx-auto my-5"></div>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                A streamlined medical insurance calculator is currently in
                development.
              </p>

              {/* Subtle status */}
              <p className="mt-6 text-xs text-gray-400 tracking-wide uppercase">
                Coming Soon
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
