"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuoteDocument from "./QuoteDocument";
import { CommercialQuoteResult } from "../types";

interface DownloadQuoteButtonProps {
  quote: CommercialQuoteResult;
}

export default function DownloadQuoteButton({ quote }: DownloadQuoteButtonProps) {
  // 1. Hydration safeguard
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 2. Prevent server rendering of the PDF blob
  if (!isClient) {
    return <span className="text-sm text-gray-400">Loading...</span>;
  }

  return (
    <PDFDownloadLink
      document={<QuoteDocument quote={quote} />}
      fileName={`${quote.insurerName.replace(/\s+/g, "_")}_Commercial_Quote.pdf`}
      className="text-blue-600 hover:text-blue-800 font-medium text-sm underline transition"
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
    </PDFDownloadLink>
  );
}