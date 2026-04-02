import { useState, useRef, useMemo } from "react";
import calculatePremium from "@/src/features/motor-private/engine/calculator";
import {
  generateQuoteSignature,
  computePriceBasedRank,
  sortQuotesByLockedRank,
} from "@/src/features/motor-private/engine/sorting";
import {
  InsuranceProduct,
  DetailedQuoteBreakdown,
} from "@/src/features/motor-private/types";
import { formatWhatsAppQuote } from "@/src/features/motor-private/utils/formatters";
import { UNDERWRITING_RULES } from "@/src/features/motor-private/utils/constants";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";


export function useQuoteEngine(initialProducts: InsuranceProduct[]) {
  const router = useRouter();

  const [vehicleValue, setVehicleValue] = useState<number | "">("");
  const [yom, setYom] = useState<number | "">("");
  const [coverType, setCoverType] = useState<"COMPREHENSIVE" | "TPO">(
    "COMPREHENSIVE",
  );
  const [products] = useState<InsuranceProduct[] | null>(initialProducts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalRiders, setGlobalRiders] = useState<Record<string, boolean>>({});

  const [insurerUpgrades, setInsurerUpgrades] = useState<
    Record<string, Record<string, string | boolean>>
  >({});

  const currentYear = new Date().getFullYear();
  const forceTpo =
    (vehicleValue !== "" &&
      vehicleValue < UNDERWRITING_RULES.MIN_COMPREHENSIVE_VALUE_KES) ||
    (yom !== "" &&
      currentYear - yom > UNDERWRITING_RULES.MAX_COMPREHENSIVE_AGE_YEARS);
  const displayedCoverType = forceTpo ? "TPO" : coverType;

  const [rawComparisonQuotes, setRawComparisonQuotes] = useState<any[] | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // 1. Establish the stateful tracker
  const sortTrackerRef = useRef({ signature: "", lockedRank: [] as string[] });

  // 2. Compute the raw, unsorted quotes via API backend
  const fetchQuotes = async () => {
    if (vehicleValue === "" || yom === "") return;
    
    setIsLoadingQuotes(true);
    try {
      const selectedRiderIds = Object.keys(globalRiders).filter(k => globalRiders[k]);
      
      const res = await fetch("/api/quotes/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleValue,
          yom,
          coverType: displayedCoverType,
          selectedRiderIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch quotes");
      
      const data = await res.json();
      setRawComparisonQuotes(data.quotes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuotes(false);
    }
  };


  // 3. Apply the pure functions against the stateful tracker
  const comparisonQuotes = useMemo(() => {
    if (!rawComparisonQuotes || rawComparisonQuotes.length === 0) return null;

    const currentSignature = generateQuoteSignature(rawComparisonQuotes);

    if (currentSignature !== sortTrackerRef.current.signature) {
      sortTrackerRef.current.signature = currentSignature;
      sortTrackerRef.current.lockedRank =
        computePriceBasedRank(rawComparisonQuotes);
    }

    return sortQuotesByLockedRank(
      rawComparisonQuotes,
      sortTrackerRef.current.lockedRank,
    );
  }, [rawComparisonQuotes]);

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
          [type]: !currentInsurerState[type],
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

  const handleCopyQuote = async (
    insurerId: string,
    quoteBreakdown: DetailedQuoteBreakdown,
  ) => {
    const selectedProduct = products?.find((p) => p.insurerId === insurerId);
    const insurerName = selectedProduct?.insurerName || "Selected Insurer";

    const whatsappMessage = formatWhatsAppQuote(
      insurerName,
      vehicleValue as number,
      displayedCoverType,
      quoteBreakdown,
    );

    try {
      await navigator.clipboard.writeText(whatsappMessage);
      alert("Quote copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      alert("Failed to copy quote.");
    }
  };

  const handleSaveQuote = async (insurerId: string, riderIds: string[]) => {
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

      if (!res.ok) {
        throw new Error("Failed to save quote");
      }

      await res.json();
      router.refresh();
      alert("Quote successfully saved to your Dashboard!");
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
    fetchQuotes,
    isLoadingQuotes,
    handleCopyQuote,
    handleSaveQuote,
    globalRiders,
    insurerUpgrades,
    handleGlobalRiderToggle,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  };
}
