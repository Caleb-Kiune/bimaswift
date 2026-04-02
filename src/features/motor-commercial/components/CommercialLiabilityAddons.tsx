"use client";
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CommercialQuoteFormValues } from "../validations/commercialValidation";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";

interface Props {
  register: UseFormRegister<CommercialQuoteFormValues>;
  errors: FieldErrors<CommercialQuoteFormValues>;
  coverType: "TPO" | "COMPREHENSIVE";
  includePLL: boolean;
  isFleet: boolean;
  setFleet: (val: boolean) => void;
  setPLL: (val: boolean) => void;
}

export function CommercialLiabilityAddons({ 
  register, 
  errors, 
  coverType,
  includePLL,
  isFleet,
  setFleet,
  setPLL
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        3. Fleet & Liability
      </h3>

      <div className="space-y-3">
        <label className="flex items-center justify-between p-4 bg-secondary border border-border rounded-xl cursor-pointer transition-all hover:bg-secondary/80 group">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              Is this a Fleet Policy?
            </span>
          </div>
          <Switch 
            checked={isFleet} 
            onCheckedChange={setFleet} 
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-secondary border border-border rounded-xl cursor-pointer transition-all hover:bg-secondary/80 group">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              Include Passenger Legal Liability (PLL)
            </span>
          </div>
          <Switch 
            checked={includePLL} 
            onCheckedChange={setPLL} 
          />
        </label>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          includePLL ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 pl-2 border-l-2 border-primary/20 ml-4">
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="passengerCount" className="transition-inherit">
                Passenger Count
              </Label>
              <Input
                id="passengerCount"
                type="number"
                min="0"
                placeholder="e.g. 4"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                {...register("passengerCount", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                className={`bg-background ${errors.passengerCount ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.passengerCount && (
                <p className="text-destructive text-sm mt-1">
                  {errors.passengerCount.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: ADD-ONS ================= */}
      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${coverType === "COMPREHENSIVE" ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0 mt-0"}`}>
        <div className="overflow-hidden">
          <hr className="border-border mb-6" />
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1 bg-primary/10 w-max px-2 py-0.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Comprehensive Extras
              </h3>
              <p className="text-sm text-muted-foreground leading-tight">These add-ons are strictly available because you selected Comprehensive Cover.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3.5 bg-background border border-border rounded-xl cursor-pointer transition-all hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary shadow-sm">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    value="PVT"
                    {...register("selectedRiders")}
                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary focus:ring-offset-1"
                  />
                </div>
                <span className="text-sm font-semibold text-foreground leading-tight">
                  Political Violence & Terrorism
                </span>
              </label>
              
              <label className="flex items-start gap-3 p-3.5 bg-background border border-border rounded-xl cursor-pointer transition-all hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary shadow-sm">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    value="EXCESS_PROTECTOR"
                    {...register("selectedRiders")}
                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary focus:ring-offset-1"
                  />
                </div>
                <span className="text-sm font-semibold text-foreground leading-tight">
                  Excess Protector
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
