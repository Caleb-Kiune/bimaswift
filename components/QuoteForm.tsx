"use client";

import React, { useState, useEffect } from "react";
import calculateMotorPremium from "@/lib/engine";
import { v4 } from "uuid";

interface MotorPremiumRates {
  basicRateBps: number;
  basicMinPremium: number;
  pvtRateBps: number;
  pvtMinPremium: number;
  tpoFlatPremium: number;
}

export default function QuoteForm() {
  const [vehicleValue, setVehicleValue] = useState<number>(0);
  const [yom, setYom] = useState<number>(0);
  const [coverType, setCoverType] = useState<"COMPREHENSIVE" | "TPO">(
    "COMPREHENSIVE",
  );
  const [rates, setRates] = useState<MotorPremiumRates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const forceTpo = vehicleValue < 500000 || currentYear - yom > 12;

  // Use derived value if forced, otherwise use selected
  const displayedCoverType = forceTpo ? "TPO" : coverType;

  const premiumBreakdown = rates
    ? calculateMotorPremium(vehicleValue, displayedCoverType, rates!)
    : { totalPayable: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true)

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
`.trim()

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
        setIsSubmitting(false)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Vehicle Value"
          value={vehicleValue}
          disabled={isSubmitting}
          onChange={(e) => setVehicleValue(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Year of Manufacture"
          value={yom}
          disabled={isSubmitting}
          onChange={(e) => setYom(Number(e.target.value))}
        />

        <select
          value={coverType} 
          disabled={isSubmitting || forceTpo}
          onChange={(e) =>
            setCoverType(e.target.value as "COMPREHENSIVE" | "TPO")
          } 
        >
          <option value="COMPREHENSIVE">COMPREHENSIVE</option>
          <option value="TPO">TPO</option>
        </select>
        {forceTpo && (
          <p style={{ color: "red", marginTop: "4px" }}>
            Cover type is automatically set to TPO due to vehicle value or age.
          </p>
        )}
        {!rates ? <p>Loading active rates ...</p> : null}
        <button type="submit" disabled={isSubmitting || !rates}>{isSubmitting? "Saving..." : "Generate and Share Quote"}</button>
      </form>
      <p>{premiumBreakdown.totalPayable.toLocaleString("en-KE")}</p>
    </div>
  );
}
