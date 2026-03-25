"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commercialQuoteSchema,
  CommercialQuoteFormValues,
} from "../validations/commercialValidation";
import calculatePremium from "../engine/calculator";
import { activeCommercialProducts } from "../data/rates";
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
    resolver: zodResolver(commercialQuoteSchema)
    defaultValues: {
      coverType: "TPO",
      tonnage: 0,
      usageType: "OWN_GOODS",
      isFleet: false,
      includePLL: false,
      // sumInsured is omitted here because our default is TPO!
    },
  });

  const coverType = watch("coverType");

  const onSubmit = (data: CommercialQuoteFormValues) => {
    console.log("ZOD APPROVED DATA:", data);
    const generatedQuotes = calculatePremium(activeCommercialProducts, data);
    setQuoteResults(generatedQuotes);
    console.log("PREMIUM RESULT:", generatedQuotes);
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

        {/* Sum Insured - conditional */}
        {coverType === "COMPREHENSIVE" && (
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              Sum Insured
            </label>
            <input
              type="number"
              {...register("sumInsured")}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.sumInsured && (
              <p className="text-red-500 text-sm mt-1">
                {errors.sumInsured.message}
              </p>
            )}
          </div>
        )}

        {/* Tonnage */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Tonnage</label>
          <input
            type="number"
            {...register("tonnage")}
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
