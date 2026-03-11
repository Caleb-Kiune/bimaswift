"use client";

import React, { useState, useEffect } from "react";
import calculateMotorPremium, { QuoteBreakdown } from "@/lib/engine";
import { v4 } from "uuid";

interface MotorPremiumRates {
  basicRateBps: number;
  basicMinPremium: number;
  pvtRateBps: number;
  pvtMinPremium: number;
  tpoFlatPremium: number;
}

export default function QuoteForm() {
  const [vehicleValue, setVehicleValue] = useState<number | "">("");
  const [yom, setYom] = useState<number | "">("");
  const [coverType, setCoverType] = useState<"COMPREHENSIVE" | "TPO">(
    "COMPREHENSIVE",
  );
  const [rates, setRates] = useState<MotorPremiumRates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //fetch rates to the client for speed purposes and instant feedback
  useEffect(() => {
    async function fetchRates() {
      const res = await fetch("/api/rates/active");
      const data = await res.json();
      setRates(data);
    }

    fetchRates();
  }, []);

  const currentYear = new Date().getFullYear();

  // Determine if cover type should be forced to TPO
  const forceTpo =
    (vehicleValue !== "" && vehicleValue < 500000) ||
    (yom !== "" && currentYear - yom > 12);

  // Use derived value if forced, otherwise use selected
  const displayedCoverType = forceTpo ? "TPO" : coverType;

  console.log(rates);

  const premiumBreakdown =
    rates && vehicleValue !== "" && yom !== ""
      ? calculateMotorPremium(vehicleValue, displayedCoverType, rates!)
      : null;

  console.log(premiumBreakdown);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const idempotencyKey = v4();

    const vehicleData = {
      idempotencyKey: idempotencyKey,
      vehicleValue: vehicleValue,
      yom: yom,
      coverType: displayedCoverType,
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleData),
      });

      const result = await res.json();

      // WhatsApp message
      const whatsappMessage = `
Quote Generated!
Vehicle Value: KES ${vehicleValue.toLocaleString("en-KE")}
Cover Type: ${displayedCoverType}

Premium Breakdown:
- Basic Premium: KES ${result.quote.basicPremium.toLocaleString("en-KE")}
- PVT Premium: KES ${result.quote.pvt.toLocaleString("en-KE")}
- Gross Premium: KES ${result.quote.grossPremium.toLocaleString("en-KE")}
- ITL Levy: KES ${result.quote.itl.toLocaleString("en-KE")}
- PHCF Levy: KES ${result.quote.phcf.toLocaleString("en-KE")}
- Stamp Duty: KES ${result.quote.stampDuty.toLocaleString("en-KE")}

Total Payable: KES ${result.quote.totalPayable.toLocaleString("en-KE")}
`.trim();

      try {
        await navigator.clipboard.writeText(whatsappMessage);
        alert("Quote copied to clipboard! Ready to paste in WhatsApp.");
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }

      console.log(result);
    } catch (err) {
      console.error("Error submitting quote", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="vehicleValue"
          >
            Vehicle Value
          </label>
          <input
            type="number"
            placeholder="Vehicle Value"
            value={vehicleValue}
            disabled={isSubmitting}
            onChange={(e) =>
              setVehicleValue(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="yom"
          >
            Year of Manufacture
          </label>
          <input
            type="number"
            placeholder="Year of Manufacture"
            value={yom}
            disabled={isSubmitting}
            onChange={(e) =>
              setYom(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={displayedCoverType}
          disabled={isSubmitting || forceTpo}
          onChange={(e) =>
            setCoverType(e.target.value as "COMPREHENSIVE" | "TPO")
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="COMPREHENSIVE">COMPREHENSIVE</option>
          <option value="TPO">TPO</option>
        </select>

        {forceTpo && (
          <p className="text-sm text-red-500">
            Cover type is automatically set to TPO due to vehicle value or age.
          </p>
        )}

        {!rates ? (
          <p className="text-sm text-gray-500">Loading active rates ...</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !rates}
          className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Saving..." : "Generate and Share Quote"}
        </button>
      </form>

      {premiumBreakdown && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Quote Summary
          </h3>

          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Vehicle Value:</span>
            <span className="font-medium">
              KES {vehicleValue.toLocaleString("en-KE")}
            </span>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Cover Type:</span>
            <span className="font-medium">{displayedCoverType}</span>
          </div>

          <div className="space-y-2 border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Premium:</span>
              <span className="font-medium">
                KES {premiumBreakdown.basicPremium.toLocaleString("en-KE")}
              </span>
            </div>

            {premiumBreakdown.pvt > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">PVT Premium:</span>
                <span className="font-medium">
                  KES {premiumBreakdown.pvt.toLocaleString("en-KE")}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Gross Premium:</span>
              <span className="font-medium">
                KES {premiumBreakdown.grossPremium.toLocaleString("en-KE")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">ITL Levy:</span>
              <span className="font-medium">
                KES {premiumBreakdown.itl.toLocaleString("en-KE")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">PHCF Levy:</span>
              <span className="font-medium">
                KES {premiumBreakdown.phcf.toLocaleString("en-KE")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Stamp Duty:</span>
              <span className="font-medium">
                KES {premiumBreakdown.stampDuty.toLocaleString("en-KE")}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-300 pt-2 mt-2 text-base font-bold text-gray-900">
              <span>Total Payable:</span>
              <span>
                KES {premiumBreakdown.totalPayable.toLocaleString("en-KE")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
