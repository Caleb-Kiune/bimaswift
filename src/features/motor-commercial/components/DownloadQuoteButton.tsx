"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import QuoteDocument from "./QuoteDocument";
import { CommercialQuoteResult } from "../types";

interface DownloadQuoteButtonProps {
  quote: CommercialQuoteResult;
}

export default function DownloadQuoteButton({ quote }: DownloadQuoteButtonProps) {
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