import React from "react";

interface Props {
  selectedRiderTypes: Record<string, any>;
  handleRiderToggle: (type: string) => void;
  handleRiderOptionChange: (type: string, optionId: string) => void;
}

export default function UniversalRiderToggles({
  selectedRiderTypes,
  handleRiderToggle,
  handleRiderOptionChange,
}: Props) {
  const isLouSelected = !!selectedRiderTypes["LOSS_OF_USE"];
  const currentLouOption =
    typeof selectedRiderTypes["LOSS_OF_USE"] === "string"
      ? selectedRiderTypes["LOSS_OF_USE"]
      : "lou_10";

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Optional Riders
      </h4>
      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!selectedRiderTypes["PVT"]}
            onChange={() => handleRiderToggle("PVT")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Political Violence & Terrorism (PVT)
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!selectedRiderTypes["EXCESS_PROTECTOR"]}
            onChange={() => handleRiderToggle("EXCESS_PROTECTOR")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Excess Protector</span>
        </label>

        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLouSelected}
              onChange={() => {
                handleRiderToggle("LOSS_OF_USE");

                if (!isLouSelected) {
                  handleRiderOptionChange("LOSS_OF_USE", "lou_10");
                }
              }}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Loss of Use / Courtesy Car
            </span>
          </label>

          {isLouSelected && (
            <div className="ml-7 pl-2 border-l-2 border-blue-200 transition-all duration-300">
              <select
                value={currentLouOption}
                onChange={(e) =>
                  handleRiderOptionChange("LOSS_OF_USE", e.target.value)
                }
                className="mt-1 block w-full pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md shadow-sm"
              >
                <option value="lou_10">10 Days Cover</option>
                <option value="lou_20">20 Days Cover</option>
                <option value="lou_30">30 Days Cover</option>
              </select>
              <p className="mt-1 text-[10px] text-gray-500">
                Note: If an insurer doesn't support the selected tier, it will
                default to their standard limit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
