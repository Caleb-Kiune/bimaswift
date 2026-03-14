"use client";

import { useQuoteEngine } from "@/hooks/useQuoteEngine";
import VehicleInputForm from "./VehicleInputForm";
import QuoteMarketplace from "./QuoteMarketplace";

export default function QuoteForm() {
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
    handleSelectQuote,
    globalRiders,
    handleGlobalRiderToggle,
    insurerUpgrades,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  } = useQuoteEngine();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <form className="space-y-4">
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

        {/* --- GLOBAL COMMODITY RIDERS --- */}
        {displayedCoverType === "COMPREHENSIVE" && (
          <div className="bg-white p-4 rounded-md border border-gray-200 mt-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Standard Upgrades (Applies to all quotes)
            </h4>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6">
              {/* PVT Global Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!globalRiders["PVT"]}
                  onChange={() => handleGlobalRiderToggle("PVT")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Political Violence & Terrorism (PVT)
                </span>
              </label>

              {/* Excess Protector Global Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!globalRiders["EXCESS_PROTECTOR"]}
                  onChange={() => handleGlobalRiderToggle("EXCESS_PROTECTOR")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Excess Protector</span>
              </label>
            </div>
          </div>
        )}

        {!products && (
          <p className="text-sm text-gray-500">Loading active rates ...</p>
        )}
      </form>

      <QuoteMarketplace
        comparisonQuotes={comparisonQuotes}
        isSubmitting={isSubmitting}
        handleSelectQuote={handleSelectQuote}
        products={products}
        insurerUpgrades={insurerUpgrades}
        handleInsurerRiderToggle={handleInsurerRiderToggle}
        handleInsurerRiderOptionChange={handleInsurerRiderOptionChange}
      />
    </div>
  );
}
