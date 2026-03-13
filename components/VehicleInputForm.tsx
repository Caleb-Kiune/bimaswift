import React from "react";

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
  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => currentYear - i,
  );

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNumericString = e.target.value.replace(/[^0-9]/g, "");

    if (rawNumericString === "") {
      setVehicleValue("");
      return;
    }

    const numericValue = Number(rawNumericString);

    if (numericValue <= 100000000) {
      setVehicleValue(numericValue);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Vehicle Value (KES) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
            KES
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={
              vehicleValue !== "" ? vehicleValue.toLocaleString("en-KE") : ""
            }
            disabled={isSubmitting}
            onChange={handleValueChange}
            className="w-full border border-gray-300 rounded-md pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 text-blue-500"
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
          Enter the current estimated market value, not the original purchase
          price.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Year of Manufacture <span className="text-red-500">*</span>
        </label>
        <select
          value={yom === "" ? "" : yom}
          disabled={isSubmitting}
          onChange={(e) =>
            setYom(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
        >
          <option value="" disabled>
            Select Year
          </option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Cover Type <span className="text-red-500">*</span>
        </label>
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            type="button"
            disabled={isSubmitting || forceTpo}
            onClick={() => setCoverType("COMPREHENSIVE")}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              displayedCoverType === "COMPREHENSIVE"
                ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            } ${forceTpo ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Comprehensive
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setCoverType("TPO")}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              displayedCoverType === "TPO"
                ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Third Party Only
          </button>
        </div>

        {forceTpo && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            <span className="font-bold">Note:</span> Vehicle value or age
            restrictions require this quote to be Third Party Only (TPO).
          </p>
        )}
      </div>
    </div>
  );
}
