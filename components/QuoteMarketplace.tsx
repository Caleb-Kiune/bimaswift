"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { QuoteBreakdown, InsuranceProduct } from "@/types";
import { Show, SignInButton } from "@clerk/nextjs";

interface ComparisonQuote {
  insurerId: string;
  insurerName: string;
  quote: QuoteBreakdown;
  riderIds: string[];
}

interface Props {
  comparisonQuotes: ComparisonQuote[] | null;
  isSubmitting: boolean;
  handleCopyQuote: (insurerId: string, quote: QuoteBreakdown) => void;
  handleSaveQuote: (insurerId: string, riderIds: string[]) => void;
  products: InsuranceProduct[] | null;
  insurerUpgrades: Record<string, Record<string, any>>;
  handleInsurerRiderToggle: (insurerId: string, type: string) => void;
  handleInsurerRiderOptionChange: (
    insurerId: string,
    type: string,
    optionId: string,
  ) => void;
  displayedCoverType: "COMPREHENSIVE" | "TPO";
}

// --- NEW COMPONENT: Custom Dropdown ---
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
// --- END NEW COMPONENT ---

export default function QuoteMarketplace({
  comparisonQuotes,
  isSubmitting,
  handleCopyQuote,
  handleSaveQuote,
  products,
  insurerUpgrades,
  handleInsurerRiderToggle,
  handleInsurerRiderOptionChange,
  displayedCoverType,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // 1. Memoize sorting
  const sortedQuotes = useMemo(() => {
    if (!comparisonQuotes) return [];
    return [...comparisonQuotes].sort(
      (a, b) => a.quote.totalPayable - b.quote.totalPayable,
    );
  }, [comparisonQuotes]);

  // Empty state handling
  if (sortedQuotes.length === 0) {
    return (
      <div className="mt-8 p-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl">
        <h3 className="text-lg font-medium text-zinc-900">
          No quotes available
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Please adjust your parameters to generate new quotes.
        </p>
      </div>
    );
  }

  const cheapestInsurerId = sortedQuotes[0].insurerId;

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
        const isCheapest = comp.insurerId === cheapestInsurerId;
        const product = products?.find((p) => p.insurerId === comp.insurerId);

        const specialtyRiders =
          product?.riders.filter(
            (r) => r.type !== "PVT" && r.type !== "EXCESS_PROTECTOR",
          ) || [];

        return (
          <div
            key={comp.insurerId}
            className={`relative bg-white rounded-2xl border transition-all duration-200 shadow-sm ${
              isCheapest
                ? "border-indigo-500 ring-1 ring-indigo-500"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {/* Badge and Header */}
            {isCheapest && (
              <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
                Most Affordable
              </div>
            )}

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
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">
                      {displayedCoverType === "COMPREHENSIVE"
                        ? "Comprehensive"
                        : "Third Party Only"}
                    </span>
                    {comp.quote.calculatedRiders.filter((r) => r.premium === 0)
                      .length > 0 && (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        Free Add-ons Included
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-0 w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:items-end items-center">
                <span className="font-extrabold text-2xl tracking-tight text-zinc-900">
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
                <div className="border-t border-dashed border-zinc-300 pt-4 text-sm space-y-4">
                  {/* Basic Premium, Applied Riders, Taxes */}
                  <div>
                    <div className="flex justify-between text-zinc-600 mb-1">
                      <span>Basic Premium</span>
                      <span className="font-medium">
                        KES {comp.quote.basicPremium.toLocaleString("en-KE")}
                      </span>
                    </div>
                  </div>

                  {comp.quote.calculatedRiders.length > 0 && (
                    <div className="space-y-1.5">
                      {comp.quote.calculatedRiders.map((rider) => (
                        <div
                          key={rider.id}
                          className="flex justify-between text-zinc-600"
                        >
                          <span className="flex items-center gap-1.5">
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
                          </span>
                          <span>
                            {rider.premium === 0 ? (
                              <span className="text-emerald-600 font-semibold text-xs uppercase">
                                Free
                              </span>
                            ) : (
                              `KES ${rider.premium.toLocaleString("en-KE")}`
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-100">
                    <div className="flex justify-between text-zinc-500 text-xs">
                      <span>Taxes & Levies (ITL, PHCF, Stamp Duty)</span>
                      <span>
                        KES{" "}
                        {(
                          comp.quote.itl +
                          comp.quote.phcf +
                          comp.quote.stampDuty
                        ).toLocaleString("en-KE")}
                      </span>
                    </div>
                  </div>

                  {/* UPDATED SPECIALTY UPGRADES SECTION */}
                  {displayedCoverType === "COMPREHENSIVE" &&
                    specialtyRiders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-200 bg-zinc-50 rounded-xl p-4">
                        <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">
                          Optional {comp.insurerName} Upgrades
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyQuote(comp.insurerId, comp.quote);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#20bd5a] active:scale-[0.98] transition-all"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      Share via WhatsApp
                    </button>

                    <Show when="signed-in">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveQuote(comp.insurerId, comp.riderIds);
                        }}
                        disabled={isSubmitting}
                        className="w-full bg-transparent text-zinc-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-50 hover:text-zinc-800 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? "Saving..." : "Save to Dashboard"}
                      </button>
                    </Show>

                    <Show when="signed-out">
                      <SignInButton mode="modal" fallbackRedirectUrl="/">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="w-full bg-transparent text-zinc-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                        >
                          Sign in to save this quote
                        </button>
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
