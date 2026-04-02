import { z } from "zod";


export const privateQuoteSchema = z.object({
  requestMode: z.enum(["MARKET_SCAN", "UPDATE_SINGLE"]),
  vehicleValue: z.number().min(1, "Vehicle value must be greater than 0"),
  yom: z.number().min(1900, "Invalid year of manufacture").max(new Date().getFullYear() + 1),
  coverType: z.enum(["COMPREHENSIVE", "TPO"]),
  targetInsurerId: z.string().optional(),
  selectedRiders: z.record(z.string(), z.union([z.boolean(), z.string()])).optional(),
});

export type PrivateQuoteRequest = z.infer<typeof privateQuoteSchema>;
