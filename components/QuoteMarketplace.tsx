"use client";

import React, { useState } from "react";
import { QuoteBreakdown, InsuranceProduct } from "@/types";

interface ComparisonQuote {
  insurerId: string;
  insurerName: string;
  quote: QuoteBreakdown;
  riderIds: string[];
}

interface Props {
  comparisonQuotes: ComparisonQuote[] | null;
  isSubmitting: boolean;
  handleSelectQuote: (
    insurerId: string,
    quote: QuoteBreakdown,
    riderIds: string[],
  ) => void;
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

export default function QuoteMarketplace({
  comparisonQuotes,
  isSubmitting,
  handleSelectQuote,
  products,
  insurerUpgrades,
  handleInsurerRiderToggle,
  handleInsurerRiderOptionChange,
  displayedCoverType,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  if (!comparisonQuotes) return null;

  const toggleExpand = (insurerId: string) => {
    setExpandedIds((prev) =>
      prev.includes(insurerId)
        ? prev.filter((id) => id !== insurerId)
        : [...prev, insurerId],
    );
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="font-semibold text-gray-800 border-b pb-2">
        Available Quotes
      </h3>

      {comparisonQuotes.map((comp) => {
        const isExpanded = expandedIds.includes(comp.insurerId);

        const product = products?.find((p) => p.insurerId === comp.insurerId);

        const specialtyRiders =
          product?.riders.filter(
            (r) => r.type !== "PVT" && r.type !== "EXCESS_PROTECTOR",
          ) || [];

        return (
          <div
            key={comp.insurerId}
            className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden transition-all duration-200 shadow-sm"
          >
            {/* --- VISIBLE HEADER --- */}
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white">
              <div>
                <span className="font-bold text-lg text-blue-900">
                  {comp.insurerName}
                </span>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    Basic Premium + {comp.quote.calculatedRiders.length} Rider
                    {comp.quote.calculatedRiders.length === 1 ? "" : "s"}
                  </span>

                  {comp.quote.calculatedRiders.filter((r) => r.premium === 0)
                    .length > 0 && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                      Free{" "}
                      {comp.quote.calculatedRiders
                        .filter((r) => r.premium === 0)
                        .map((r) =>
                          r.name.includes("Political") ? "PVT" : r.name,
                        )
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 sm:mt-0 text-left sm:text-right">
                <span className="font-bold text-xl text-gray-900">
                  KES {comp.quote.totalPayable.toLocaleString("en-KE")}
                </span>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => toggleExpand(comp.insurerId)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    {isExpanded
                      ? "▲ Hide Breakdown"
                      : "▼ View Detailed Breakdown"}
                  </button>
                </div>
              </div>
            </div>

            {/* --- EXPANDABLE RECEIPT SECTION --- */}
            {isExpanded && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm space-y-4">
                {/* Basic Premium */}
                <div>
                  <div className="flex justify-between text-gray-700 font-medium border-b border-gray-200 pb-1 mb-2">
                    <span>Core Premium</span>
                    <span>Cost</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Basic Premium</span>
                    <span>
                      KES {comp.quote.basicPremium.toLocaleString("en-KE")}
                    </span>
                  </div>
                </div>

                {/* Applied Riders List */}
                {comp.quote.calculatedRiders.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Applied Riders
                    </div>
                    <div className="space-y-1">
                      {comp.quote.calculatedRiders.map((rider) => (
                        <div
                          key={rider.id}
                          className="flex justify-between text-gray-600"
                        >
                          <span>+ {rider.name}</span>
                          <span>
                            {rider.premium === 0 ? (
                              <span className="text-green-600 font-medium">
                                Included (Free)
                              </span>
                            ) : (
                              `KES ${rider.premium.toLocaleString("en-KE")}`
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Levies & Taxes */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Levies & Taxes
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span>Training Levy (ITL)</span>
                      <span>KES {comp.quote.itl.toLocaleString("en-KE")}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Policyholders Fund (PHCF)</span>
                      <span>KES {comp.quote.phcf.toLocaleString("en-KE")}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Stamp Duty</span>
                      <span>
                        KES {comp.quote.stampDuty.toLocaleString("en-KE")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- THE NEW SPECIALTY UPGRADES SECTION --- */}
                {displayedCoverType === "COMPREHENSIVE" &&
                  specialtyRiders.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50/50 -mx-4 px-4 pb-4">
                      <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 pt-2">
                        {comp.insurerName} Upgrades
                      </h5>
                      <div className="space-y-3">
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
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
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
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {rider.name}
                                </span>
                              </label>

                              {isSelected &&
                                rider.options &&
                                rider.options.length > 0 && (
                                  <div className="ml-7 pl-2 border-l-2 border-blue-300 transition-all duration-300">
                                    <select
                                      value={currentOption}
                                      onChange={(e) =>
                                        handleInsurerRiderOptionChange(
                                          comp.insurerId,
                                          rider.type,
                                          e.target.value,
                                        )
                                      }
                                      className="mt-1 block w-full pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md shadow-sm"
                                    >
                                      {rider.options.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() =>
                      handleSelectQuote(
                        comp.insurerId,
                        comp.quote,
                        comp.riderIds,
                      )
                    }
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition shadow-sm"
                  >
                    {isSubmitting
                      ? "Saving Quote..."
                      : `Select ${comp.insurerName}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
