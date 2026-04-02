import { z } from "zod";
import { RiderType } from "../types";

export const privateQuoteSchema = z.object({
  vehicleValue: z.number().min(1, "Vehicle value must be greater than 0"),
  yom: z.number().min(1900, "Invalid year of manufacture").max(new Date().getFullYear() + 1),
  coverType: z.enum(["COMPREHENSIVE", "TPO"]),
  selectedRiderIds: z.array(z.string()).optional().default([]),
});

export type PrivateQuoteRequest = z.infer<typeof privateQuoteSchema>;
