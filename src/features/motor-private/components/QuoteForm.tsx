"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { Switch } from "@/src/components/ui/switch";

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
    control,
    setValue,
    formState: { errors },
  } = useForm<PrivateQuoteRequest>({
    resolver: zodResolver(privateQuoteSchema),
    mode: "onBlur", // validate on blur
    defaultValues: {
      requestMode: "MARKET_SCAN",
      coverType: "COMPREHENSIVE",
      selectedRiders: {},
    },
  });

  const vehicleValue = useWatch({ control, name: "vehicleValue" });
  const yom = useWatch({ control, name: "yom" });
  const coverType = useWatch({ control, name: "coverType" });

  const currentYear = new Date().getFullYear();
  const forceTpo =
    (!!vehicleValue && vehicleValue < UNDERWRITING_RULES.MIN_COMPREHENSIVE_VALUE_KES) ||
    (!!yom && currentYear - yom > UNDERWRITING_RULES.MAX_COMPREHENSIVE_AGE_YEARS);

  const displayedCoverType = forceTpo ? "TPO" : coverType;

  const selectedRidersPVT = useWatch({
    control,
    name: "selectedRiders.PVT",
  });
  const selectedRidersExcess = useWatch({
    control,
    name: "selectedRiders.EXCESS_PROTECTOR",
  });

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
      <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
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
                <label className="flex flex-1 items-center justify-between sm:justify-start gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Political Violence (PVT)
                  </span>
                  <Switch 
                    checked={!!selectedRidersPVT}
                    onCheckedChange={(checked) => setValue("selectedRiders.PVT", checked)}
                  />
                </label>

                {/* Excess Protector Toggle */}
                <label className="flex flex-1 items-center justify-between sm:justify-start gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Excess Protector
                  </span>
                  <Switch 
                    checked={!!selectedRidersExcess}
                    onCheckedChange={(checked) => setValue("selectedRiders.EXCESS_PROTECTOR", checked)}
                  />
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

          <div className="pt-4 flex justify-end border-t border-border">
             <Button 
                type="submit" 
                size="lg"
                disabled={isLoadingQuotes}
                className="w-full sm:w-auto rounded-xl shadow-sm text-base"
             >
                {isLoadingQuotes && <Spinner size="sm" className="text-primary-foreground mr-2" />}
                {isLoadingQuotes ? "Fetching Market Rates..." : "Get Quotes"}
             </Button>
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
