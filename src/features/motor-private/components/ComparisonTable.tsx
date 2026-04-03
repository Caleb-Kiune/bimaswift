"use client";

import { useState, useRef, useEffect } from "react";
import {
  DetailedQuoteBreakdown,
  InsuranceProduct,
} from "@/src/features/motor-private/types";
import { Show, SignInButton } from "@clerk/nextjs";
import { formatKES } from "@/src/lib/formatters";
import DownloadPrivateQuoteWrapper from "./DownloadPrivateQuoteWrapper";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

interface ComparisonQuote {
  insurerId: string;
  insurerName: string;
  quote: DetailedQuoteBreakdown;
  riderIds: string[];
}

interface Props {
  comparisonQuotes: ComparisonQuote[] | null;
  isSubmitting: boolean;

  handleSaveQuote: (insurerId: string, riderIds: string[]) => void;
  products: InsuranceProduct[] | null;
  insurerUpgrades: Record<string, Record<string, string | boolean>>;
  handleInsurerRiderToggle: (insurerId: string, type: string) => void;
  handleInsurerRiderOptionChange: (
    insurerId: string,
    type: string,
    optionId: string,
  ) => void;
  displayedCoverType: "COMPREHENSIVE" | "TPO";
  recalculatingInsurers: Record<string, boolean>;
}

// Custom Dropdown
function CustomSelect({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between bg-white border border-zinc-300 rounded-lg py-2 pl-3 pr-2 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
      >
        <span className="block truncate">
          {selectedOption?.label || "Select an option..."}
        </span>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu with Animation */}
      <div
        className={`absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <ul className="max-h-60 overflow-auto py-1 focus:outline-none">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <li
                key={opt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-900"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span
                  className={`block truncate ${isSelected ? "font-medium" : "font-normal"}`}
                >
                  {opt.label}
                </span>
                {/* Selected Checkmark Icon */}
                {isSelected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function QuoteMarketplace({
  comparisonQuotes,
  isSubmitting,

  handleSaveQuote,
  products,
  insurerUpgrades,
  handleInsurerRiderToggle,
  handleInsurerRiderOptionChange,
  displayedCoverType,
  recalculatingInsurers,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const formatRate = (bps: number) => `${(bps / 100).toFixed(2)}%`;

  // The quotes are already stably sorted by the Orchestrator Hook
  const sortedQuotes = comparisonQuotes || [];

  // Empty state handling
  if (sortedQuotes.length === 0) {
    return (
      <EmptyState 
        className="mt-8"
        title="No quotes available" 
        description="Please adjust your parameters to generate new quotes."
      />
    );
  }

  const toggleExpand = (insurerId: string) => {
    setExpandedIds((prev) =>
      prev.includes(insurerId)
        ? prev.filter((id) => id !== insurerId)
        : [...prev, insurerId],
    );
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <h3 className="font-semibold text-zinc-900">Available Quotes</h3>
        <span className="text-xs font-medium text-zinc-500">
          Sorted by Lowest Price
        </span>
      </div>

      {sortedQuotes.map((comp) => {
        const isExpanded = expandedIds.includes(comp.insurerId);
        const product = products?.find((p) => p.insurerId === comp.insurerId);

        const specialtyRiders =
          product?.riders.filter(
            (r) => r.type !== "PVT" && r.type !== "EXCESS_PROTECTOR",
          ) || [];

        const isRecalculating = recalculatingInsurers[comp.insurerId];

        return (
          <div
            key={comp.insurerId}
            className="relative bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-200 shadow-sm"
          >
            <button
              className="w-full text-left p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded-2xl"
              onClick={() => toggleExpand(comp.insurerId)}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-12 w-12 rounded-full bg-zinc-100 items-center justify-center text-zinc-400 font-bold text-lg border border-zinc-200 shrink-0">
                  {comp.insurerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-zinc-900 leading-tight">
                    {comp.insurerName}
                  </h4>
                  {comp.quote.vehicleValue && (
                    <span className="text-xs text-zinc-500 mt-1 block">
                      Sum Insured: KES {comp.quote.vehicleValue.toLocaleString()}
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">
                      {displayedCoverType === "COMPREHENSIVE"
                        ? "Comprehensive"
                        : "Third Party Only"}
                    </span>
                    {comp.quote.calculatedRiders.filter(
                      (r) => r.premium.value === 0,
                    ).length > 0 && (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        Free Add-ons Included
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-0 w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:items-end items-center">
                <span className={`font-extrabold text-2xl tracking-tight text-zinc-900 transition-opacity duration-300 ${isRecalculating ? "opacity-30" : "opacity-100"}`}>
                  KES {comp.quote.totalPayable.toLocaleString("en-KE")}
                </span>
                <span className="text-xs font-medium text-indigo-600 mt-1 flex items-center gap-1">
                  {isExpanded ? "Hide Details" : "View Breakdown"}
                  <svg
                    className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </button>

            {/* EXPANDABLE RECEIPT SECTION */}
            {isExpanded && (
              <div className="px-5 pb-5">
                <div className="border-t border-dashed border-zinc-300 pt-4 text-sm">
                  {/* --- 1. BASIC PREMIUM WITH MATH STORY --- */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-zinc-600">
                      <span>Basic Premium</span>
                      <span className="font-semibold text-zinc-900">
                        {formatKES(comp.quote.basicPremium)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-zinc-400">
                        Rate:{" "}
                        {formatRate(comp.quote.basicPremium.breakdown.rateBps)}
                      </span>
                      {comp.quote.basicPremium.breakdown
                        .isMinPremiumApplied && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          ⚠️ Underwriter Minimum Enforced
                        </span>
                      )}
                    </div>
                  </div>

                  {/* --- 2. DETAILED RIDERS BREAKDOWN --- */}
                  {comp.quote.calculatedRiders.length > 0 && (
                    <div className="bg-zinc-50 p-3 rounded-md space-y-2 mb-4">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Included Benefits
                      </p>
                      {comp.quote.calculatedRiders.map((rider) => (
                        <div
                          key={rider.id}
                          className="flex justify-between items-start"
                        >
                          <div>
                            <p className="text-xs text-zinc-700 flex items-center gap-1.5">
                              <svg
                                className="w-3.5 h-3.5 text-emerald-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {rider.name}
                            </p>
                            {/* Rider Math Story */}
                            <p className="text-[10px] text-zinc-400 ml-5 mt-0.5">
                              {rider.premium.breakdown.rateType === "FREE" &&
                                "Complimentary"}
                              {rider.premium.breakdown.rateType === "FLAT" &&
                                "Flat Rate"}
                              {rider.premium.breakdown.rateType ===
                                "OPTION_SELECTION" && "Selected Tier Limit"}
                              {rider.premium.breakdown.rateType ===
                                "PERCENTAGE_BPS" &&
                                `Rate: ${formatRate(rider.premium.breakdown.rateValue)}`}
                              {rider.premium.breakdown.isMinPremiumApplied &&
                                " (Min. Applied)"}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-zinc-700">
                            {rider.premium.value === 0 ? (
                              <span className="text-emerald-600 font-semibold text-xs uppercase">
                                Free
                              </span>
                            ) : (
                              formatKES(rider.premium)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* --- 3. DETAILED LEVIES BREAKDOWN --- */}
                  <div className="text-sm border-t border-dashed border-zinc-200 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>
                        Training Levy (
                        {formatRate(comp.quote.itl.breakdown.rateValue)})
                      </span>
                      <span>{formatKES(comp.quote.itl)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>
                        Policyholders Fund (
                        {formatRate(comp.quote.phcf.breakdown.rateValue)})
                      </span>
                      <span>{formatKES(comp.quote.phcf)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Stamp Duty</span>
                      <span>{formatKES(comp.quote.stampDuty)}</span>
                    </div>
                  </div>

                  {/* --- 4. BOTTOM TOTAL --- */}
                  <div className="pt-3 mt-3 border-t border-zinc-200">
                    <p className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-zinc-700">
                        Total Premium
                      </span>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatKES(comp.quote.totalPayable)}
                      </span>
                    </p>
                  </div>

                  {/* UPDATED SPECIALTY UPGRADES SECTION */}
                  {displayedCoverType === "COMPREHENSIVE" &&
                    specialtyRiders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-200 bg-zinc-50 rounded-xl p-4">
                        <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">
                          Optional Add-Ons
                        </h5>
                        <div className="space-y-5">
                          {specialtyRiders.map((rider) => {
                            const isSelected =
                              !!insurerUpgrades[comp.insurerId]?.[rider.type];
                            const currentOption =
                              typeof insurerUpgrades[comp.insurerId]?.[
                                rider.type
                              ] === "string"
                                ? insurerUpgrades[comp.insurerId][rider.type]
                                : rider.options?.[0]?.id || "";

                            return (
                              <div
                                key={rider.id}
                                className="flex flex-col space-y-2"
                              >
                                <label className="flex items-center justify-between cursor-pointer group">
                                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                                    {rider.name}
                                  </span>
                                  <div className="relative inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleInsurerRiderToggle(
                                          comp.insurerId,
                                          rider.type,
                                        );
                                        if (
                                          !isSelected &&
                                          rider.options &&
                                          rider.options.length > 0
                                        ) {
                                          handleInsurerRiderOptionChange(
                                            comp.insurerId,
                                            rider.type,
                                            rider.options[0].id,
                                          );
                                        }
                                      }}
                                    />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                  </div>
                                </label>

                                {/* INTEGRATED CUSTOM SELECT HERE */}
                                {isSelected &&
                                  rider.options &&
                                  rider.options.length > 0 && (
                                    <div className="ml-2 pl-3 border-l-2 border-indigo-200 transition-all duration-300">
                                      <CustomSelect
                                        options={rider.options}
                                        value={currentOption as string}
                                        onChange={(newOptionId) =>
                                          handleInsurerRiderOptionChange(
                                            comp.insurerId,
                                            rider.type,
                                            newOptionId,
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* ACTION BUTTONS */}
                  <div className="pt-4 space-y-3">
                    <DownloadPrivateQuoteWrapper
                      insurerName={comp.insurerName}
                      quote={comp.quote}
                      coverType={displayedCoverType}
                    />

                    <Show when="signed-in">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveQuote(comp.insurerId, comp.riderIds);
                        }}
                        disabled={isSubmitting}
                        className="w-full rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {isSubmitting && <Spinner size="sm" className="mr-2" />}
                        {isSubmitting ? "Saving..." : "Save to Dashboard"}
                      </Button>
                    </Show>

                    <Show when="signed-out">
                      <SignInButton mode="modal" fallbackRedirectUrl="/">
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="w-full rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground"
                        >
                          Sign in to save this quote
                        </Button>
                      </SignInButton>
                    </Show>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
