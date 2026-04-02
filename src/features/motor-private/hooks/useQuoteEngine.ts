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
  const [recalculatingInsurers, setRecalculatingInsurers] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const singleAbortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Establish the stateful tracker
  const sortTrackerRef = useRef({ signature: "", lockedRank: [] as string[] });

  // 2. Compute the raw, unsorted quotes via API backend
  const fetchQuotes = async () => {
    if (vehicleValue === "" || yom === "") return;
    
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoadingQuotes(true);
    setInsurerUpgrades({}); // Reset secondary toggles on fresh lookup
    try {
      const res = await fetch("/api/quotes/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          requestMode: "MARKET_SCAN",
          vehicleValue,
          yom,
          coverType: displayedCoverType,
          selectedRiders: globalRiders,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch quotes");
      
      const data = await res.json();
      setRawComparisonQuotes(data.quotes);
    } catch (err: any) {
      if (err.name !== "AbortError") {
         console.error(err);
      }
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const updateSingleQuote = async (insurerId: string, customCombinedRiders: Record<string, string | boolean>) => {
      if (vehicleValue === "" || yom === "") return;

      if (singleAbortControllerRef.current) {
         singleAbortControllerRef.current.abort();
      }
      singleAbortControllerRef.current = new AbortController();

      setRecalculatingInsurers(p => ({ ...p, [insurerId]: true }));

      try {
        const res = await fetch("/api/quotes/private", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: singleAbortControllerRef.current.signal,
          body: JSON.stringify({
             requestMode: "UPDATE_SINGLE",
             targetInsurerId: insurerId,
             vehicleValue,
             yom,
             coverType: displayedCoverType,
             selectedRiders: customCombinedRiders,
          }),
        });

        if (!res.ok) throw new Error("Failed to update single quote");
        
        const data = await res.json();
        const updatedQuoteData = data.quotes[0];

        if (updatedQuoteData) {
            setRawComparisonQuotes(prev => {
                if (!prev) return prev;
                return prev.map(q => q.insurerId === insurerId ? updatedQuoteData : q);
            });
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
            console.error("Update single quote error", err);
        }
      } finally {
        setRecalculatingInsurers(p => ({ ...p, [insurerId]: false }));
      }
  };

  const executeTargetedUpdate = (insurerId: string, newInsurerState: Record<string, string | boolean>) => {
      const combinedRiders = { ...globalRiders, ...newInsurerState };

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
          updateSingleQuote(insurerId, combinedRiders);
      }, 300);
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
      const newInsurerState = {
        ...currentInsurerState,
        [type]: !currentInsurerState[type],
      };
      
      executeTargetedUpdate(insurerId, newInsurerState);
      
      return {
        ...prev,
        [insurerId]: newInsurerState,
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
      const newInsurerState = {
        ...currentInsurerState,
        [type]: optionId,
      };

      executeTargetedUpdate(insurerId, newInsurerState);

      return {
        ...prev,
        [insurerId]: newInsurerState,
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
    recalculatingInsurers,
    handleCopyQuote,
    handleSaveQuote,
    globalRiders,
    insurerUpgrades,
    handleGlobalRiderToggle,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  };
}
