"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { PrivateQuoteRequest } from "../validations/privateValidation";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface Props {
  register: UseFormRegister<PrivateQuoteRequest>;
  errors: FieldErrors<PrivateQuoteRequest>;
  setValue: UseFormSetValue<PrivateQuoteRequest>;
  displayedCoverType: "COMPREHENSIVE" | "TPO";
  forceTpo: boolean;
  isSubmitting: boolean;
}

export default function VehicleInputForm({
  register,
  errors,
  setValue,
  displayedCoverType,
  forceTpo,
  isSubmitting,
}: Props) {
  const currentYear = new Date().getFullYear();

  // 2. Formatters & Handlers
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const valueBefore = input.value;
    
    // Strip everything except digits
    const rawValue = valueBefore.replace(/[^0-9]/g, "");
    if (Number(rawValue) > 100000000) {
      input.value = valueBefore.slice(0, cursorPosition - 1) + valueBefore.slice(cursorPosition);
      return;
    }

    const formattedValue = rawValue ? Number(rawValue).toLocaleString("en-KE") : "";
    
    // We gracefully measure commas before and after the cursor to prevent jumping
    const commasBefore = (valueBefore.slice(0, cursorPosition).match(/,/g) || []).length;
    const commasAfter = (formattedValue.slice(0, cursorPosition).match(/,/g) || []).length;
    
    input.value = formattedValue;
    const newPosition = cursorPosition + (commasAfter - commasBefore);
    
    requestAnimationFrame(() => {
      input.setSelectionRange(newPosition, newPosition);
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 max-w-md mx-auto">
        {/* VEHICLE VALUE INPUT */}
        <div className="space-y-1.5">
          <Label htmlFor="vehicleValue" className="text-zinc-700">
            Vehicle Value
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span
                className={`font-medium ${errors.vehicleValue ? "text-destructive" : "text-muted-foreground"}`}
              >
                KES
              </span>
            </div>
            <Input
              id="vehicleValue"
              type="text"
              inputMode="numeric"
              onWheel={(e: React.WheelEvent<HTMLInputElement>) => (e.target as HTMLInputElement).blur()}
              disabled={isSubmitting}
              {...register("vehicleValue", {
                setValueAs: (v) => {
                  if (!v) return undefined;
                  const num = Number(String(v).replace(/,/g, ""));
                  return isNaN(num) ? undefined : num;
                },
                onChange: handleValueChange,
              })}
              className={`pl-14 py-6 text-lg ${
                errors.vehicleValue
                  ? "border-destructive text-destructive focus-visible:ring-destructive bg-destructive/5"
                  : "bg-zinc-50"
              }`}
              placeholder="e.g. 1,500,000"
            />
          </div>
          {/* Helper / Error Text */}
          <p
            className={`text-xs flex items-center gap-1 ${errors.vehicleValue ? "text-destructive font-medium" : "text-zinc-500"}`}
          >
            {errors.vehicleValue ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>{" "}
                {errors.vehicleValue.message}
              </>
            ) : (
              "Estimated market value of the car"
            )}
          </p>
        </div>

        {/* YEAR OF MANUFACTURE INPUT */}
        <div className="space-y-1.5">
          <Label htmlFor="yom" className="text-zinc-700">
            Year of Manufacture
          </Label>
          <Input
            id="yom"
            type="number"
            onWheel={(e: React.WheelEvent<HTMLInputElement>) => (e.target as HTMLInputElement).blur()}
            disabled={isSubmitting}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            }}
            {...register("yom", {
               setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className={`py-6 text-lg ${
              errors.yom
                ? "border-destructive text-destructive focus-visible:ring-destructive bg-destructive/5"
                : "bg-zinc-50"
            }`}
            placeholder="e.g. 2018"
          />
          {/* Helper / Error Text */}
          <p
            className={`text-xs flex items-center gap-1 ${errors.yom ? "text-destructive font-medium" : "text-zinc-500"}`}
          >
            {errors.yom ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>{" "}
                {errors.yom.message}
              </>
            ) : (
              `Must be between 1980 and ${currentYear}`
            )}
          </p>
        </div>
      </div>

      {/* COVER TYPE SELECTOR */}
      <div className="space-y-1.5 pt-2">
        <Label className="flex justify-between items-center text-zinc-700">
          <span>Cover Type</span>
          {forceTpo && (
            <span className="text-[10px] sm:text-xs text-amber-700 font-bold bg-amber-100 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Age/Value limits require TPO
            </span>
          )}
        </Label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/50">
          <button
            type="button"
            onClick={() => setValue("coverType", "COMPREHENSIVE")}
            disabled={forceTpo || isSubmitting}
            className={`py-3 text-sm font-bold rounded-lg transition-all ${
              displayedCoverType === "COMPREHENSIVE"
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-700 disabled:opacity-40"
            }`}
          >
            Comprehensive
          </button>
          <button
            type="button"
            onClick={() => setValue("coverType", "TPO")}
            disabled={isSubmitting}
            className={`py-3 text-sm font-bold rounded-lg transition-all ${
              displayedCoverType === "TPO"
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-700 disabled:opacity-40"
            }`}
          >
            Third Party Only
          </button>
        </div>
      </div>
    </div>
  );
}
