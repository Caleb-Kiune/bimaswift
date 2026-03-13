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
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Vehicle Value</label>
        <input
          type="number"
          placeholder="Vehicle Value"
          value={vehicleValue}
          disabled={isSubmitting}
          onChange={(e) => setVehicleValue(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Year of Manufacture</label>
        <input
          type="number"
          placeholder="Year of Manufacture"
          value={yom}
          disabled={isSubmitting}
          onChange={(e) => setYom(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        value={displayedCoverType}
        disabled={isSubmitting || forceTpo}
        onChange={(e) => setCoverType(e.target.value as "COMPREHENSIVE" | "TPO")}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="COMPREHENSIVE">COMPREHENSIVE</option>
        <option value="TPO">TPO</option>
      </select>

      {forceTpo && (
        <p className="text-sm text-red-500">
          Cover type is automatically set to TPO due to vehicle value or age.
        </p>
      )}
    </div>
  );
}