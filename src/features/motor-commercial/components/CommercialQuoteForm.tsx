"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commercialQuoteSchema,
  CommercialQuoteFormValues,
} from "../validations/commercialValidation";
import { CommercialQuoteResult, CommercialVehicleRequest } from "../types";

interface CommercialQuoteFormProps {
  setQuoteResults: (quoteResults: CommercialQuoteResult[] | null) => void;
  setQuoteRequest: (quoteRequest: CommercialVehicleRequest | null) => void;
}

export default function CommercialQuoteForm({
  setQuoteRequest,
  setQuoteResults,
}: CommercialQuoteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
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

  const handleSumInsuredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const valueBefore = input.value;
    
    const rawValue = valueBefore.replace(/[^0-9]/g, "");
    if (Number(rawValue) > 100000000) {
      input.value = valueBefore.slice(0, cursorPosition - 1) + valueBefore.slice(cursorPosition);
      return;
    }

    const formattedValue = rawValue ? Number(rawValue).toLocaleString("en-US") : "";
    
    // We gracefully measure commas before and after the cursor to prevent jumping
    const commasBefore = (valueBefore.slice(0, cursorPosition).match(/,/g) || []).length;
    const commasAfter = (formattedValue.slice(0, cursorPosition).match(/,/g) || []).length;
    
    input.value = formattedValue;
    const newPosition = cursorPosition + (commasAfter - commasBefore);
    
    requestAnimationFrame(() => {
      input.setSelectionRange(newPosition, newPosition);
    });
  };

  const onSubmit = async (data: CommercialQuoteFormValues) => {
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-gray-100"
    >
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Commercial Quote
        </h2>
        <p className="text-sm text-gray-500">
          Enter your vehicle details to get a customized commercial insurance quote.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* ================= SECTION 1: COVERAGE ================= */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            1. Policy Cover
          </h3>
          <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-100 shadow-inner">
            <label className="flex-1 text-center relative cursor-pointer group">
              <input 
                type="radio" 
                value="TPO" 
                className="sr-only peer" 
                {...register("coverType")} 
              />
              <div className="py-2.5 rounded-lg text-sm font-semibold text-gray-600 transition-all peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-[0_2px_8px_-2px_rgba(37,99,235,0.2)] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 hover:bg-white/50">
                Third Party Only
              </div>
            </label>
            <label className="flex-1 text-center relative cursor-pointer group">
              <input 
                type="radio" 
                value="COMPREHENSIVE" 
                className="sr-only peer" 
                {...register("coverType")} 
              />
              <div className="py-2.5 rounded-lg text-sm font-semibold text-gray-600 transition-all peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-[0_2px_8px_-2px_rgba(37,99,235,0.2)] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 hover:bg-white/50">
                Comprehensive
              </div>
            </label>
          </div>
          {errors.coverType && (
            <p className="text-red-500 text-sm mt-1">{errors.coverType.message}</p>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* ================= SECTION 2: VEHICLE DETAILS ================= */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            2. Vehicle Details
          </h3>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="block text-sm font-semibold text-gray-700 transition-inherit">
              Tonnage
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 3"
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") e.preventDefault();
              }}
              {...register("tonnage", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            />
            {errors.tonnage && (
              <p className="text-red-500 text-sm mt-1">{errors.tonnage.message}</p>
            )}
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="block text-sm font-semibold text-gray-700 transition-inherit mt-2">
              Usage Type
            </label>
            <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-100 shadow-inner">
              <label className="flex-1 text-center relative cursor-pointer group">
                <input 
                  type="radio" 
                  value="OWN_GOODS" 
                  className="sr-only peer" 
                  {...register("usageType")} 
                />
                <div className="py-2.5 rounded-lg text-sm font-semibold text-gray-600 transition-all peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-[0_2px_8px_-2px_rgba(37,99,235,0.2)] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 hover:bg-white/50">
                  Own Goods
                </div>
              </label>
              <label className="flex-1 text-center relative cursor-pointer group">
                <input 
                  type="radio" 
                  value="GENERAL_CARTAGE" 
                  className="sr-only peer" 
                  {...register("usageType")} 
                />
                <div className="py-2.5 rounded-lg text-sm font-semibold text-gray-600 transition-all peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-[0_2px_8px_-2px_rgba(37,99,235,0.2)] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 hover:bg-white/50">
                  General Cartage
                </div>
              </label>
            </div>
            {errors.usageType && (
              <p className="text-red-500 text-sm mt-1">{errors.usageType.message}</p>
            )}
          </div>

          {/* Conditional Sum Insured */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              coverType === "COMPREHENSIVE" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-2">
                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                  <label className="block text-sm font-semibold text-gray-700 transition-inherit">
                    Sum Insured (KES)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1,500,000"
                    {...register("sumInsured", {
                      setValueAs: (v) => {
                        if (!v) return undefined;
                        const num = Number(String(v).replace(/,/g, ""));
                        return isNaN(num) ? undefined : num;
                      },
                      onChange: handleSumInsuredChange,
                    })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                  {errors.sumInsured && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.sumInsured.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ================= SECTION 3: LIABILITY ================= */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            3. Fleet & Liability
          </h3>

          <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition-all hover:bg-white has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30 has-[:checked]:ring-1 has-[:checked]:ring-blue-600">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                {...register("isFleet")}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600 focus:ring-offset-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Is this a Fleet Policy?
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition-all hover:bg-white has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30 has-[:checked]:ring-1 has-[:checked]:ring-blue-600">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                {...register("includePLL")}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600 focus:ring-offset-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Include Passenger Legal Liability (PLL)
              </span>
            </div>
          </label>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              includePLL ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-2 pl-2 border-l-2 border-blue-100 ml-4">
                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                  <label className="block text-sm font-semibold text-gray-700 transition-inherit">
                    Passenger Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                    {...register("passengerCount", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                  />
                  {errors.passengerCount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.passengerCount.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: ADD-ONS ================= */}
        <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${coverType === "COMPREHENSIVE" ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0 mt-0"}`}>
          <div className="overflow-hidden">
            <hr className="border-gray-100 mb-6" />
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mb-1 bg-blue-50/50 w-max px-2 py-0.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Comprehensive Extras
                </h3>
                <p className="text-sm text-gray-500 leading-tight">These add-ons are strictly available because you selected Comprehensive Cover.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30 has-[:checked]:ring-1 has-[:checked]:ring-blue-600 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      value="PVT"
                      {...register("selectedRiders")}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 focus:ring-offset-1"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 leading-tight">
                    Political Violence & Terrorism
                  </span>
                </label>
                
                <label className="flex items-start gap-3 p-3.5 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30 has-[:checked]:ring-1 has-[:checked]:ring-blue-600 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      value="EXCESS_PROTECTOR"
                      {...register("selectedRiders")}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 focus:ring-offset-1"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 leading-tight">
                    Excess Protector
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full relative flex items-center justify-center gap-2 group bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-4 px-6 rounded-xl shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        >
          <span>Get Quote</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 group-active:translate-x-2 transition-transform duration-200"
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
        </button>
      </div>
    </form>
  );
}
