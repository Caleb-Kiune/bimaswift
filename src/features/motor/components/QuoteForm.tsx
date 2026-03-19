"use client";

import { useQuoteEngine } from "@/src/features/motor/hooks/useQuoteEngine";
import VehicleInputForm from "./VehicleInputForm";
import QuoteMarketplace from "./QuoteMarketplace";
import { InsuranceProduct } from "../types";

export default function QuoteForm({ initialProducts }: { initialProducts: InsuranceProduct[] }) {

 

  const {
    vehicleValue,
    setVehicleValue,
    yom,
    setYom,
    coverType,
    setCoverType,
    products,
    isSubmitting,
    forceTpo,
    displayedCoverType,
    comparisonQuotes,
    handleCopyQuote,
    handleSaveQuote,
    globalRiders,
    handleGlobalRiderToggle,
    insurerUpgrades,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  } = useQuoteEngine(initialProducts);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* THE INPUT SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <VehicleInputForm
            vehicleValue={vehicleValue}
            setVehicleValue={setVehicleValue}
            yom={yom}
            setYom={setYom}
            displayedCoverType={displayedCoverType}
            setCoverType={setCoverType}
            forceTpo={forceTpo}
            isSubmitting={isSubmitting}
          />

          {/* GLOBAL COMMODITY RIDERS (Sleek Toggle Bar) */}
          {displayedCoverType === "COMPREHENSIVE" && (
            <div className="pt-5 border-t border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                Optional Add-Ons 
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                {/* PVT Toggle */}
                <label className="flex items-center justify-between sm:justify-start gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                    Political Violence (PVT)
                  </span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!globalRiders["PVT"]}
                      onChange={() => handleGlobalRiderToggle("PVT")}
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>

                {/* Excess Protector Toggle */}
                <label className="flex items-center justify-between sm:justify-start gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                    Excess Protector
                  </span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!globalRiders["EXCESS_PROTECTOR"]}
                      onChange={() =>
                        handleGlobalRiderToggle("EXCESS_PROTECTOR")
                      }
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {!products && (
            <div className="pt-4 flex items-center gap-3 text-zinc-500 text-sm font-medium animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              Syncing live market rates...
            </div>
          )}
        </form>
      </div>

      {/* THE MARKETPLACE */}
      <QuoteMarketplace
        comparisonQuotes={comparisonQuotes}
        isSubmitting={isSubmitting}
        handleCopyQuote={handleCopyQuote}
        handleSaveQuote={handleSaveQuote}
        products={products}
        insurerUpgrades={insurerUpgrades}
        handleInsurerRiderToggle={handleInsurerRiderToggle}
        handleInsurerRiderOptionChange={handleInsurerRiderOptionChange}
        displayedCoverType={displayedCoverType}
      />
    </div>
  );
}
