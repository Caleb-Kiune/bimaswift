import { z } from "zod";

export const commercialQuoteSchema = z.object({
  coverType: z.enum(["TPO", "COMPREHENSIVE"]),
  
  tonnage: z.number().min(0.1, "Tonnage must be greater than 0"),
  
  usageType: z.enum(["OWN_GOODS", "GENERAL_CARTAGE"]),
  isFleet: z.boolean(),
  includePLL: z.boolean(),
  
  passengerCount: z.number().optional(),
  selectedRiders: z.array(z.string()).optional(),
  sumInsured: z.number().optional(), 
})
.superRefine((data, ctx) => {
  if (data.coverType === "COMPREHENSIVE") {
    if (!data.sumInsured || data.sumInsured < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sum Insured is required for Comprehensive cover",
        path: ["sumInsured"],
      });
    }
  }

  if (data.includePLL) {
    if (!data.passengerCount || data.passengerCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passenger count is required if PLL is included",
        path: ["passengerCount"],
      });
    }
  }
});

export type CommercialQuoteFormValues = z.infer<typeof commercialQuoteSchema>;