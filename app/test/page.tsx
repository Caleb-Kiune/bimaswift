"use client";

import { useEffect } from "react";
import calculateBasicPremium from "@/lib/engine-test";

export default function TestPage() {
  useEffect(() => {
    calculateBasicPremium();
  }, []);

  return (
    <div>
      <h1>Test Page</h1>
    </div>
  );
}