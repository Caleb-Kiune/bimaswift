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


import { PrivateQuoteRequest } from "../validations/privateValidation";

export function useQuoteEngine(initialProducts: InsuranceProduct[]) {
  const router = useRouter();

  const [lockedSnapshot, setLockedSnapshot] = useState<PrivateQuoteRequest | null>(null);
  const [products] = useState<InsuranceProduct[] | null>(initialProducts);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [insurerUpgrades, setInsurerUpgrades] = useState<
    Record<string, Record<string, string | boolean>>
  >({});

  const [rawComparisonQuotes, setRawComparisonQuotes] = useState<any[] | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [recalculatingInsurers, setRecalculatingInsurers] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const singleAbortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Establish the stateful tracker
  const sortTrackerRef = useRef({ signature: "", lockedRank: [] as string[] });

  // 2. Compute the raw, unsorted quotes via API backend
  const fetchQuotes = async (data: PrivateQuoteRequest) => {
    setLockedSnapshot(data);
    
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoadingQuotes(true);
    setInsurerUpgrades({}); // Reset secondary toggles on fresh lookup
    try {
      const payload = {
        ...data,
        requestMode: "MARKET_SCAN",
      };

      const res = await fetch("/api/quotes/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch quotes");
      
      const responseData = await res.json();
      setRawComparisonQuotes(responseData.quotes);
    } catch (err: any) {
      if (err.name !== "AbortError") {
         console.error(err);
      }
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const updateSingleQuote = async (insurerId: string, customCombinedRiders: Record<string, string | boolean>) => {
      if (!lockedSnapshot) return;

      if (singleAbortControllerRef.current) {
         singleAbortControllerRef.current.abort();
      }
      singleAbortControllerRef.current = new AbortController();

      setRecalculatingInsurers(p => ({ ...p, [insurerId]: true }));

      try {
        const payload = {
            ...lockedSnapshot,
            requestMode: "UPDATE_SINGLE",
            targetInsurerId: insurerId,
            selectedRiders: customCombinedRiders,
        };

        const res = await fetch("/api/quotes/private", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: singleAbortControllerRef.current.signal,
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update single quote");
        
        const responseData = await res.json();
        const updatedQuoteData = responseData.quotes[0];

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
      if (!lockedSnapshot) return;

      const combinedRiders = { 
          ...(lockedSnapshot.selectedRiders || {}), 
          ...newInsurerState 
      };

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

    if (!lockedSnapshot) return;

    const whatsappMessage = formatWhatsAppQuote(
      insurerName,
      lockedSnapshot.vehicleValue,
      lockedSnapshot.coverType,
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
    if (!lockedSnapshot) return;

    setIsSubmitting(true);
    const idempotencyKey = v4();

    const vehicleData = {
      idempotencyKey,
      vehicleValue: lockedSnapshot.vehicleValue,
      yom: lockedSnapshot.yom,
      coverType: lockedSnapshot.coverType,
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
    lockedSnapshot,
    products,
    isSubmitting,
    comparisonQuotes,
    fetchQuotes,
    isLoadingQuotes,
    recalculatingInsurers,
    handleCopyQuote,
    handleSaveQuote,
    insurerUpgrades,
    handleInsurerRiderToggle,
    handleInsurerRiderOptionChange,
  };
}
