"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commercialQuoteSchema,
  CommercialQuoteFormValues,
} from "../validations/commercialValidation";
import { CommercialQuoteResult } from "../types";

interface CommercialQuoteFormProps {
  setQuoteResults: (quoteResults: CommercialQuoteResult[] | null) => void;
}

export default function CommercialQuoteForm({
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

      console.log("PREMIUM RESULT FROM API:", result.quotes);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 p-6 border border-gray-200 rounded-md max-w-lg mx-auto bg-white shadow-sm"
      >
        {/* Cover Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Cover Type</label>
          <select
            {...register("coverType")}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="TPO">Third Party Only</option>
            <option value="COMPREHENSIVE">Comprehensive</option>
          </select>
          {errors.coverType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.coverType.message}
            </p>
          )}
        </div>

        {/* Sum Insured & Riders - conditional */}
        {coverType === "COMPREHENSIVE" && (
          <div className="flex flex-col gap-4 border-t border-gray-200 mt-4 pt-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Sum Insured
              </label>
              <input
                type="number"
                {...register("sumInsured", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.sumInsured && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sumInsured.message}
                </p>
              )}
            </div>

            {/* UNIVERSAL RIDERS */}
            <div className="flex flex-col gap-2">
              <p className="font-medium text-gray-700 mb-1">
                Optional Add-ons (Riders)
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="PVT"
                  {...register("selectedRiders")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                />
                <label className="text-gray-700 text-sm">
                  Political Violence & Terrorism (PVT)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="EXCESS_PROTECTOR"
                  {...register("selectedRiders")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                />
                <label className="text-gray-700 text-sm">
                  Excess Protector
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tonnage */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Tonnage</label>
          <input
            type="number"
            {...register("tonnage", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.tonnage && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tonnage.message}
            </p>
          )}
        </div>

        {/* Usage Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Usage Type</label>
          <select
            {...register("usageType")}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="OWN_GOODS">Own Goods</option>
            <option value="GENERAL_CARTAGE">General Cartage</option>
          </select>
          {errors.usageType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.usageType.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("isFleet")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-gray-700 font-medium">
            Is this a Fleet Policy?
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("includePLL")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-gray-700 font-medium">
            Include Passenger Legal Liability (PLL)?
          </label>
        </div>

        {includePLL && (
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              Passenger Count
            </label>
            <input
              type="number"
              {...register("passengerCount", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.passengerCount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.passengerCount.message}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Get Quote
        </button>
      </form>
    </>
  );
}
