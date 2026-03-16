import { useState, useEffect } from "react";
import calculateMotorPremium from "@/lib/engine";
import { InsuranceProduct, QuoteBreakdown } from "@/types";
import { formatWhatsAppQuote } from "@/lib/utils/formatters";
import { UNDERWRITING_RULES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";

export function useQuoteEngine() {
  const router = useRouter();

  const [vehicleValue, setVehicleValue] = useState<number | "">("");
  const [yom, setYom] = useState<number | "">("");
  const [coverType, setCoverType] = useState<"COMPREHENSIVE" | "TPO">(
    "COMPREHENSIVE",
  );
  const [products, setProducts] = useState<InsuranceProduct[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalRiders, setGlobalRiders] = useState<Record<string, boolean>>({});

  const [insurerUpgrades, setInsurerUpgrades] = useState<
    Record<string, Record<string, string | boolean>>
  >({});

  useEffect(() => {
    async function fetchRates() {
      const res = await fetch("/api/rates/active");
      const data = await res.json();
      setProducts(data);
    }
    fetchRates();
  }, []);

  const currentYear = new Date().getFullYear();
  const forceTpo =
    (vehicleValue !== "" &&
      vehicleValue < UNDERWRITING_RULES.MIN_COMPREHENSIVE_VALUE_KES) ||
    (yom !== "" &&
      currentYear - yom > UNDERWRITING_RULES.MAX_COMPREHENSIVE_AGE_YEARS);
  const displayedCoverType = forceTpo ? "TPO" : coverType;

  const comparisonQuotes =
    products && vehicleValue !== "" && yom !== ""
      ? products.map((product) => {
          const combinedRidersForThisCard = {
            ...globalRiders,
            ...(insurerUpgrades[product.insurerId] || {}),
          };

          const productSpecificRiderIds = product.riders
            .filter((rider) => {
              if (combinedRidersForThisCard[rider.type]) return true;

              const activeBand = rider.bands.find(
                (b) =>
                  vehicleValue >= b.minVehicleValue &&
                  vehicleValue <= b.maxVehicleValue,
              );

              if (activeBand && activeBand.rateType === "FREE") {
                return true;
              }

              return false;
            })
            .map((rider) => {
              const selectedValue = combinedRidersForThisCard[rider.type];
              if (typeof selectedValue === "string") return selectedValue;
              return rider.id;
            });

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

  const handleGlobalRiderToggle = (type: string) => {
    setGlobalRiders((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleInsurerRiderToggle = (insurerId: string, type: string) => {
    setInsurerUpgrades((prev) => {
      const currentInsurerState = prev[insurerId] || {};
      return {
        ...prev,
        [insurerId]: {
          ...currentInsurerState,
          [type]: !currentInsurerState[type], // Flip it on/off
        },
      };
    });
  };

  const handleInsurerRiderOptionChange = (
    insurerId: string,
    type: string,
    optionId: string,
  ) => {
    setInsurerUpgrades((prev) => {
      const currentInsurerState = prev[insurerId] || {};
      return {
        ...prev,
        [insurerId]: {
          ...currentInsurerState,
          [type]: optionId,
        },
      };
    });
  };

  const handleSelectQuote = async (
    insurerId: string,
    quoteBreakdown: QuoteBreakdown,
    riderIds: string[],
  ) => {
    setIsSubmitting(true);
    const idempotencyKey = v4();

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

      router.refresh();

      await res.json();

      const selectedProduct = products?.find((p) => p.insurerId === insurerId);
      const insurerName = selectedProduct?.insurerName || "Selected Insurer";

      const whatsappMessage = formatWhatsAppQuote(
        insurerName,
        vehicleValue,
        displayedCoverType,
        quoteBreakdown,
      );

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

  return {
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
    insurerUpgrades,
    handleGlobalRiderToggle,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  };
}
