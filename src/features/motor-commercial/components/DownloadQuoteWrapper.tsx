"use client";

import dynamic from "next/dynamic";
import { CommercialQuoteResult } from "../types";

// Because this file has "use client", ssr: false is perfectly legal here!
const DynamicDownloadButton = dynamic(
  () => import("./DownloadQuoteButton"),
  { 
    ssr: false,
    loading: () => <span className="text-sm text-gray-400">Loading...</span>
  }
);

interface DownloadQuoteWrapperProps {
  quote: CommercialQuoteResult;
}

export default function DownloadQuoteWrapper({ quote }: DownloadQuoteWrapperProps) {
  return <DynamicDownloadButton quote={quote} />;
}