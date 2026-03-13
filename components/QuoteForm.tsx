"use client";

import React from "react";
import { useQuoteEngine } from "@/hooks/useQuoteEngine";
import VehicleInputForm from "./VehicleInputForm";
import UniversalRiderToggles from "./UniversalRiderToggles";
import QuoteMarketplace from "./QuoteMarketplace";

export default function QuoteForm() {
  const {
    vehicleValue,
    setVehicleValue,
    yom,
    setYom,
    setCoverType,
    products,
    isSubmitting,
    selectedRiderTypes,
    forceTpo,
    displayedCoverType,
    comparisonQuotes,
    handleRiderToggle,
    handleSelectQuote,
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

        {products && displayedCoverType === "COMPREHENSIVE" && (
          <UniversalRiderToggles 
            selectedRiderTypes={selectedRiderTypes}
            handleRiderToggle={handleRiderToggle}
          />
        )}

        {!products && (
          <p className="text-sm text-gray-500">Loading active rates ...</p>
        )}
      </form>

      <QuoteMarketplace 
        comparisonQuotes={comparisonQuotes}
        isSubmitting={isSubmitting}
        handleSelectQuote={handleSelectQuote}
      />
    </div>
  );
}