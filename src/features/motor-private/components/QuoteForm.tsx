"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  privateQuoteSchema, 
  PrivateQuoteRequest 
} from "../validations/privateValidation";
import { useQuoteEngine } from "@/src/features/motor-private/hooks/useQuoteEngine";
import VehicleInputForm from "./VehicleInputForm";
import QuoteMarketplace from "./ComparisonTable";
import { InsuranceProduct } from "../types";
import { UNDERWRITING_RULES } from "@/src/features/motor-private/utils/constants";

export default function QuoteForm({
  initialProducts,
}: {
  initialProducts: InsuranceProduct[];
}) {
  const {
    lockedSnapshot,
    products,
    isSubmitting,
    comparisonQuotes,
    fetchQuotes,
    isLoadingQuotes,
    recalculatingInsurers,
    handleSaveQuote,
    insurerUpgrades,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  } = useQuoteEngine(initialProducts);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PrivateQuoteRequest>({
    resolver: zodResolver(privateQuoteSchema),
    mode: "onBlur", // validate on blur
    defaultValues: {
      requestMode: "MARKET_SCAN",
      coverType: "COMPREHENSIVE",
      selectedRiders: {},
    },
  });

  const vehicleValue = watch("vehicleValue");
  const yom = watch("yom");
  const coverType = watch("coverType");
  const selectedRiders = watch("selectedRiders") || {};

  const currentYear = new Date().getFullYear();
  const forceTpo =
    (!!vehicleValue && vehicleValue < UNDERWRITING_RULES.MIN_COMPREHENSIVE_VALUE_KES) ||
    (!!yom && currentYear - yom > UNDERWRITING_RULES.MAX_COMPREHENSIVE_AGE_YEARS);

  const displayedCoverType = forceTpo ? "TPO" : coverType;

  const onSubmit = async (data: PrivateQuoteRequest) => {
    // If forceTpo is active, silently compel TPO coverage to backend
    if (forceTpo) {
      data.coverType = "TPO";
    }
    await fetchQuotes(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* THE INPUT SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <VehicleInputForm
            register={register}
            errors={errors}
            setValue={setValue}
            displayedCoverType={displayedCoverType}
            forceTpo={forceTpo}
            isSubmitting={isLoadingQuotes}
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
                      {...register("selectedRiders.PVT")}
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
                      {...register("selectedRiders.EXCESS_PROTECTOR")}
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

          <div className="pt-4 flex justify-end border-t border-zinc-100">
             <button 
                type="submit" 
                disabled={isLoadingQuotes || !vehicleValue || !yom}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
             >
                {isLoadingQuotes && (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                )}
                {isLoadingQuotes ? "Fetching Market Rates..." : "Get Quotes"}
             </button>
          </div>
        </form>
      </div>

      {/* THE MARKETPLACE */}
      {/* We pass the locked display type to the marketplace, so the cards reflect what they were quoted with */}
      <QuoteMarketplace
        comparisonQuotes={comparisonQuotes}
        isSubmitting={isSubmitting}
        handleSaveQuote={handleSaveQuote}
        products={products}
        insurerUpgrades={insurerUpgrades}
        handleInsurerRiderToggle={handleInsurerRiderToggle}
        handleInsurerRiderOptionChange={handleInsurerRiderOptionChange}
        displayedCoverType={lockedSnapshot?.coverType || displayedCoverType}
        recalculatingInsurers={recalculatingInsurers}
      />
    </div>
  );
}
