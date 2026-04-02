"use client";
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CommercialQuoteFormValues } from "../validations/commercialValidation";

interface Props {
  register: UseFormRegister<CommercialQuoteFormValues>;
  errors: FieldErrors<CommercialQuoteFormValues>;
}

export function CommercialCoverageSelector({ register, errors }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        1. Policy Cover
      </h3>
      <div className="flex bg-secondary p-1.5 rounded-xl border border-border shadow-inner">
        <label className="flex-1 text-center relative cursor-pointer group">
          <input 
            type="radio" 
            value="TPO" 
            className="sr-only peer" 
            {...register("coverType")} 
          />
          <div className="py-2.5 rounded-lg text-sm font-semibold text-muted-foreground transition-all peer-checked:bg-background peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-background/50">
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
          <div className="py-2.5 rounded-lg text-sm font-semibold text-muted-foreground transition-all peer-checked:bg-background peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:bg-background/50">
            Comprehensive
          </div>
        </label>
      </div>
      {errors.coverType && (
        <p className="text-destructive text-sm mt-1">{errors.coverType.message}</p>
      )}
    </div>
  );
}
