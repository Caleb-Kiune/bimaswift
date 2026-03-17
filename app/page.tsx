// app/page.tsx
"use client";

import { useState } from "react";
import QuoteForm from "@/components/QuoteForm";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"motor" | "medical">("motor");

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header & Toggle Switch */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-semibold text-gray-900">Premium Calculator</h1>
          
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
            <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
              <h2 className="text-xl font-medium text-gray-800">Medical Calculator</h2>
              <p className="text-gray-500 mt-2">Coming soon... Stay tuned!</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}