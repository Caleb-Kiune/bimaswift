"use client";

import React, { useState } from "react";

interface Props {
  vehicleValue: number | "";
  setVehicleValue: (val: number | "") => void;
  yom: number | "";
  setYom: (val: number | "") => void;
  displayedCoverType: "COMPREHENSIVE" | "TPO";
  setCoverType: (val: "COMPREHENSIVE" | "TPO") => void;
  forceTpo: boolean;
  isSubmitting: boolean;
}

export default function VehicleInputForm({
  vehicleValue,
  setVehicleValue,
  yom,
  setYom,
  displayedCoverType,
  setCoverType,
  forceTpo,
  isSubmitting,
}: Props) {
  // 1. Track if the user has interacted with the fields for validation
  const [touchedValue, setTouchedValue] = useState(false);
  const [touchedYom, setTouchedYom] = useState(false);

  const currentYear = new Date().getFullYear();

  // 2. Formatters & Handlers
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits
    const rawValue = e.target.value.replace(/\D/g, "");
    setVehicleValue(rawValue ? Number(rawValue) : "");
  };

  const handleYomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    // Prevent typing more than 4 digits for a year
    if (rawValue.length > 4) return;
    setYom(rawValue ? Number(rawValue) : "");
  };

  // 3. Validation Logic
  const valueError =
    touchedValue &&
    vehicleValue !== "" &&
    (vehicleValue < 200000 || vehicleValue > 100000000)
      ? "Value must be between KES 200,000 and 100,000,000"
      : null;

  const yomError =
    touchedYom && yom !== "" && (yom < 1980 || yom > currentYear)
      ? `Year must be between 1980 and ${currentYear}`
      : null;

  // Format the display value with commas
  const displayValue = vehicleValue ? vehicleValue.toLocaleString("en-KE") : "";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* VEHICLE VALUE INPUT */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-700">
            Vehicle Value
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span
                className={`font-medium ${valueError ? "text-red-400" : "text-zinc-500"}`}
              >
                KES
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleValueChange}
              onBlur={() => setTouchedValue(true)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              disabled={isSubmitting}
              className={`w-full pl-14 pr-4 py-3.5 bg-zinc-50 border rounded-xl font-medium text-lg focus:bg-white focus:outline-none focus:ring-2 transition-colors disabled:opacity-60 ${
                valueError
                  ? "border-red-400 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/30"
                  : "border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
              placeholder="e.g. 1,500,000"
            />
          </div>
          {/* Helper / Error Text */}
          <p
            className={`text-xs flex items-center gap-1 ${valueError ? "text-red-500 font-medium" : "text-zinc-400"}`}
          >
            {valueError ? (
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
                {valueError}
              </>
            ) : (
              "Estimated market value of the car"
            )}
          </p>
        </div>

        {/* YEAR OF MANUFACTURE INPUT */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-700">
            Year of Manufacture
          </label>
          <input
            type="number"
            value={yom}
            onChange={handleYomChange}
            onBlur={() => setTouchedYom(true)}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            disabled={isSubmitting}
            className={`w-full px-4 py-3.5 bg-zinc-50 border rounded-xl font-medium text-lg focus:bg-white focus:outline-none focus:ring-2 transition-colors disabled:opacity-60 ${
              yomError
                ? "border-red-400 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/30"
                : "border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
            placeholder="e.g. 2018"
          />
          {/* Helper / Error Text */}
          <p
            className={`text-xs flex items-center gap-1 ${yomError ? "text-red-500 font-medium" : "text-zinc-400"}`}
          >
            {yomError ? (
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
                {yomError}
              </>
            ) : (
              `Must be 1980 or newer`
            )}
          </p>
        </div>
      </div>

      {/* COVER TYPE SELECTOR */}
      <div className="space-y-1.5 pt-2">
        <label className="text-sm font-semibold text-zinc-700 flex justify-between items-center">
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
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/50">
          <button
            type="button"
            onClick={() => setCoverType("COMPREHENSIVE")}
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
            onClick={() => setCoverType("TPO")}
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
