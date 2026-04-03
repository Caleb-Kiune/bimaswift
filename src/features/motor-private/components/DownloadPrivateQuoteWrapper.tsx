"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrivateQuoteDocument from "./PrivateQuoteDocument";
import { DetailedQuoteBreakdown } from "../types";

interface Props {
  insurerName: string;
  quote: DetailedQuoteBreakdown;
}

export default function DownloadPrivateQuoteWrapper({ insurerName, quote }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsClient(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isClient) {
    return (
      <button disabled className="w-full bg-zinc-100 text-zinc-400 py-3.5 rounded-xl text-sm font-bold animate-pulse">
        Generating PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<PrivateQuoteDocument insurerName={insurerName} quote={quote} />}
      fileName={`${insurerName.replace(/\s+/g, '_')}_Quote.pdf`}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
    >
      {({ loading }) => (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {loading ? "Preparing PDF..." : "Download PDF Quote"}
        </>
      )}
    </PDFDownloadLink>
  );
}