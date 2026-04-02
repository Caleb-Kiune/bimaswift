"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commercialQuoteSchema,
  CommercialQuoteFormValues,
} from "../validations/commercialValidation";
import { CommercialQuoteResult, CommercialVehicleRequest } from "../types";

import { CommercialCoverageSelector } from "./CommercialCoverageSelector";
import { CommercialVehicleDetails } from "./CommercialVehicleDetails";
import { CommercialLiabilityAddons } from "./CommercialLiabilityAddons";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";

interface CommercialQuoteFormProps {
  setQuoteResults: (quoteResults: CommercialQuoteResult[] | null) => void;
  setQuoteRequest: (quoteRequest: CommercialVehicleRequest | null) => void;
}

export default function CommercialQuoteForm({
  setQuoteRequest,
  setQuoteResults,
}: CommercialQuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommercialQuoteFormValues>({
    resolver: zodResolver(commercialQuoteSchema),
    defaultValues: {
      coverType: "TPO",
      tonnage: 0,
      usageType: "OWN_GOODS",
      isFleet: false,
      includePLL: false,
    },
  });

  const coverType = watch("coverType");
  const includePLL = watch("includePLL");
  const isFleet = watch("isFleet");

  const onSubmit = async (data: CommercialQuoteFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("SENDING DATA TO API:", data);

      const response = await fetch("/api/quotes/commercial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }

      const result = await response.json();

      setQuoteResults(result.quotes);
      setQuoteRequest(data);

      console.log("PREMIUM RESULT FROM API:", result.quotes);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl mx-auto space-y-8 bg-card text-card-foreground p-6 sm:p-8 rounded-2xl shadow-sm border border-border"
    >
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Commercial Quote
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your vehicle details to get a customized commercial insurance quote.
        </p>
      </div>

      <div className="space-y-8">
        <CommercialCoverageSelector register={register} errors={errors} />

        <hr className="border-border" />

        <CommercialVehicleDetails 
          register={register} 
          errors={errors} 
          coverType={coverType} 
        />

        <hr className="border-border" />

        <CommercialLiabilityAddons 
          register={register}
          errors={errors}
          coverType={coverType}
          includePLL={includePLL}
          isFleet={isFleet || false}
          setFleet={(val) => setValue("isFleet", val)}
          setPLL={(val) => setValue("includePLL", val)}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 flex justify-end border-t border-border mt-8">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full relative flex items-center justify-center gap-2 group rounded-xl shadow-sm"
        >
          {isSubmitting && <Spinner size="sm" className="mr-2 text-primary-foreground" />}
          <span>{isSubmitting ? "Calculating..." : "Get Quote"}</span>
          {!isSubmitting && (
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          )}
        </Button>
      </div>
    </form>
  );
}
