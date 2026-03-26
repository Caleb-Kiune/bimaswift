import Link from "next/link";
import QuoteForm from "@/src/features/motor-private/components/QuoteForm";
import { getActiveMotorProducts } from "@/src/features/motor-private/services/products";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab || "motor";

  const initialProducts =
    activeTab === "motor" ? await getActiveMotorProducts() : [];

  return (
    
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header Toggle */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            Premium Calculator
          </h1>

          <div className="inline-flex bg-gray-200 rounded-lg p-1 shadow-inner">
            <Link
              href="/?tab=motor"
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "motor"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Private Motor
            </Link>
            
            {/* 1. Changed Medical to Commercial */}
            <Link
              href="/?tab=commercial"
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "commercial"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Commercial Motor
            </Link>
          </div>
        </div>

      {/* The Calculators */}
        <div>
          {activeTab === "motor" ? (
            <QuoteForm initialProducts={initialProducts} />
          ) : (
            
            <div className="bg-white p-14 rounded-2xl border border-gray-200 shadow-sm text-center">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Commercial Motor Engine
              </h2>
              <div className="w-10 h-px bg-gray-300 mx-auto my-5"></div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                Access the enterprise module for heavy commercial vehicles, general cartage, and fleet policies.
              </p>
              
              {/* 3. The Launch Button to your dedicated route */}
              <Link
                href="/commercial"
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition font-medium shadow-sm"
              >
                Launch Calculator
              </Link>
            </div>
            
          )}
        </div>
        
      </div>
    </main>
  );
}