import React from "react";

interface Props {
  selectedRiderTypes: string[];
  handleRiderToggle: (type: string) => void;
}

export default function UniversalRiderToggles({ selectedRiderTypes, handleRiderToggle }: Props) {
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Optional Riders</h4>
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedRiderTypes.includes("PVT")}
            onChange={() => handleRiderToggle("PVT")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Political Violence & Terrorism (PVT)</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedRiderTypes.includes("EXCESS_PROTECTOR")}
            onChange={() => handleRiderToggle("EXCESS_PROTECTOR")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Excess Protector</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedRiderTypes.includes("LOSS_OF_USE")}
            onChange={() => handleRiderToggle("LOSS_OF_USE")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Loss of Use / Courtesy Car</span>
        </label>
      </div>
    </div>
  );
}