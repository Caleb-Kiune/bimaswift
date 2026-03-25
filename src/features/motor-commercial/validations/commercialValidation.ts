import { z } from "zod";

const baseCommercialSchema = z.object({
  tonnage: z.coerce
    .number({ invalid_type_error: "Tonnage must be a number" })
    .positive("Tonnage must be greater than 0"),
  usageType: z.enum(["OWN_GOODS", "GENERAL_CARTAGE"], {
    required_error: "Please select a usage type",
  }),
  isFleet: z.boolean().default(false),
  includePLL: z.boolean().default(false),
  passengerCount: z.coerce.number().optional(),
  selectedRiders: z.array(z.string()).optional(),
});

export const commercialQuoteSchema = z.discriminatedUnion("coverType", [
  baseCommercialSchema.extend({
    coverType: z.literal("TPO"),
  }),
  baseCommercialSchema.extend({
    coverType: z.literal("COMPREHENSIVE"),
    sumInsured: z.coerce
      .number({ required_error: "Sum Insured is required for Comprehensive" })
      .min(100000, "Vehicle value must be at least Ksh 100,000 to insure"),
  }),
]);

export type CommercialQuoteFormValues = z.infer<typeof commercialQuoteSchema>;