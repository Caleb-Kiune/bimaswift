"use client";
import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { CommercialQuoteFormValues } from "../validations/commercialValidation";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface Props {
  register: UseFormRegister<CommercialQuoteFormValues>;
  errors: FieldErrors<CommercialQuoteFormValues>;
  coverType: "TPO" | "COMPREHENSIVE";
}

export function CommercialVehicleDetails({ register, errors, coverType }: Props) {
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

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        2. Vehicle Details
      </h3>

      <div className="space-y-1.5 focus-within:text-primary transition-colors">
        <Label htmlFor="tonnage" className="transition-inherit">
          Tonnage
        </Label>
        <Input
          id="tonnage"
          type="number"
          min="0"
          placeholder="e.g. 3"
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") e.preventDefault();
          }}
          {...register("tonnage", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
          className={`bg-secondary ${errors.tonnage ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        {errors.tonnage && (
          <p className="text-destructive text-sm mt-1">{errors.tonnage.message}</p>
        )}
      </div>

      <div className="space-y-1.5 focus-within:text-primary transition-colors">
        <Label className="transition-inherit mt-2">
          Usage Type
        </Label>
        <div className="flex bg-secondary p-1.5 rounded-xl border border-border shadow-inner">
          <label className="flex-1 text-center relative cursor-pointer group">
            <input 
              type="radio" 
              value="OWN_GOODS" 
              className="sr-only peer" 
              {...register("usageType")} 
            />
            <div className="py-2.5 rounded-lg text-sm font-semibold text-muted-foreground transition-all peer-checked:bg-background peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-background/50">
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
            <div className="py-2.5 rounded-lg text-sm font-semibold text-muted-foreground transition-all peer-checked:bg-background peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-background/50">
              General Cartage
            </div>
          </label>
        </div>
        {errors.usageType && (
          <p className="text-destructive text-sm mt-1">{errors.usageType.message}</p>
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
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="sumInsured" className="transition-inherit">
                Sum Insured (KES)
              </Label>
              <Input
                id="sumInsured"
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
                className={`bg-secondary ${errors.sumInsured ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.sumInsured && (
                <p className="text-destructive text-sm mt-1">
                  {errors.sumInsured.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
