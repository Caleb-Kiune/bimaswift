"use client";

import React, { useState, useEffect } from "react";
import calculateMotorPremium, { QuoteBreakdown } from "@/lib/engine";
import { InsuranceProduct } from "@/lib/data/insurers";
import { v4 } from "uuid";

export default function QuoteForm() {
  const [vehicleValue, setVehicleValue] = useState<number | "">("");
  const [yom, setYom] = useState<number | "">("");
  const [coverType, setCoverType] = useState<"COMPREHENSIVE" | "TPO">(
    "COMPREHENSIVE",
  );
  const [products, setProducts] = useState<InsuranceProduct[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRiderTypes, setSelectedRiderTypes] = useState<string[]>([]);

  console.log("Fetched Products:", products);
  //fetch rates to the client for speed purposes and instant feedback
  useEffect(() => {
    async function fetchRates() {
      const res = await fetch("/api/rates/active");
      const data = await res.json();
      setProducts(data);
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

  console.log(products);

  const comparisonQuotes =
    products && vehicleValue !== "" && yom !== ""
      ? products.map((product) => {
          //Look at the types the user checked (e.g., "PVT").
          //Find this specific product's rider ID for that type (e.g., "monarch_pvt").
          const productSpecificRiderIds = product.riders
            .filter((rider) => selectedRiderTypes.includes(rider.type))
            .map((rider) => rider.id);

          //Pass the translated array of IDs into the engine!
          const quote = calculateMotorPremium(
            vehicleValue,
            displayedCoverType,
            product,
            productSpecificRiderIds,
          );

          return {
            insurerId: product.insurerId,
            insurerName: product.insurerName,
            quote: quote,
            riderIds: productSpecificRiderIds,
          };
        })
      : null;

  console.log("Comparison Quotes:", comparisonQuotes);

  const handleSelectQuote = async (
    insurerId: string,
    quoteBreakdown: QuoteBreakdown,
    riderIds: string[],
  ) => {
    setIsSubmitting(true);
    const idempotencyKey = v4();

    //send the specific insurerId and the correct rider IDs to backend!
    const vehicleData = {
      idempotencyKey,
      vehicleValue,
      yom,
      coverType: displayedCoverType,
      insurerId,
      selectedRiderIds: riderIds,
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });

      if (!res.ok) throw new Error("Failed to save quote");

      const savedQuote = await res.json();
      console.log("Quote Saved:", savedQuote);

      //WhatsApp message
      const whatsappMessage = `
*Motor Insurance Quote*
Vehicle Value: KES ${vehicleValue.toLocaleString("en-KE")}
Cover Type: ${displayedCoverType}

*Premium Breakdown:*
- Basic Premium: KES ${quoteBreakdown.basicPremium.toLocaleString("en-KE")}
- Optional Riders: KES ${quoteBreakdown.calculatedRiders.reduce((sum: number, r: { premium: number }) => sum + r.premium, 0).toLocaleString("en-KE")}
- Levies & Taxes: KES ${(quoteBreakdown.itl + quoteBreakdown.phcf + quoteBreakdown.stampDuty).toLocaleString("en-KE")}

*Total Payable: KES ${quoteBreakdown.totalPayable.toLocaleString("en-KE")}*
`.trim();

      try {
        await navigator.clipboard.writeText(whatsappMessage);
        alert(
          "Quote saved to database and copied to clipboard! Ready to paste in WhatsApp.",
        );
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    } catch (err) {
      console.error("Error submitting quote", err);
      alert("Failed to save quote to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRiderToggle = (riderType: string) => {
    setSelectedRiderTypes((prev) =>
      prev.includes(riderType)
        ? prev.filter((type) => type !== riderType)
        : [...prev, riderType],
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <form className="space-y-4">
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

        {products && displayedCoverType === "COMPREHENSIVE" && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Optional Riders
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRiderTypes.includes("PVT")}
                  onChange={() => handleRiderToggle("PVT")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Political Violence & Terrorism (PVT)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRiderTypes.includes("EXCESS_PROTECTOR")}
                  onChange={() => handleRiderToggle("EXCESS_PROTECTOR")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Excess Protector</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRiderTypes.includes("LOSS_OF_USE")}
                  onChange={() => handleRiderToggle("LOSS_OF_USE")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Loss of Use / Courtesy Car
                </span>
              </label>
            </div>
          </div>
        )}

        {forceTpo && (
          <p className="text-sm text-red-500">
            Cover type is automatically set to TPO due to vehicle value or age.
          </p>
        )}

        {!products ? (
          <p className="text-sm text-gray-500">Loading active rates ...</p>
        ) : null}
      </form>

      {comparisonQuotes && (
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">
            Available Quotes
          </h3>

          {comparisonQuotes.map((comp) => (
            <div
              key={comp.insurerId}
              className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm"
            >
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                <span className="font-bold text-lg text-blue-900">
                  {comp.insurerName}
                </span>
                <span className="font-bold text-lg text-gray-900">
                  KES {comp.quote.totalPayable.toLocaleString("en-KE")}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Basic Premium:</span>
                  <span>
                    KES {comp.quote.basicPremium.toLocaleString("en-KE")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Levies & Taxes:</span>
                  <span>
                    KES{" "}
                    {(
                      comp.quote.itl +
                      comp.quote.phcf +
                      comp.quote.stampDuty
                    ).toLocaleString("en-KE")}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleSelectQuote(comp.insurerId, comp.quote, comp.riderIds)
                  }
                  disabled={isSubmitting}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
                >
                  {isSubmitting ? "Saving..." : `Select ${comp.insurerName}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
