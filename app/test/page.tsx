"use client";

import { useEffect } from "react";
import { calculateBasicPremium } from "@/lib/engine-test";
import { activeProducts } from "@/lib/data/insurers";

export default function TestPage() {
  useEffect(() => {
    const bands = activeProducts[0].ratingBands;

    const premium = calculateBasicPremium(800000, bands);

    // console.log("Basic premium:", premium);
  }, []);

  return (
    <div>
      <h1>Test Page</h1>
    </div>
  );
}