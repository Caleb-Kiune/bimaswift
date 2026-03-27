import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { CommercialQuoteResult } from "../types";


const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb", 
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 6,
    marginBottom: 10,
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 4,
  },
  label: {
    fontSize: 12,
    color: "#4b5563",
  },
  value: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#111827",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

interface QuoteDocumentProps {
  quote: CommercialQuoteResult;
}


export default function QuoteDocument({ quote }: QuoteDocumentProps) {
  const formatRate = (bps: number) => `${(bps / 100).toFixed(2)}%`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>BimaSwift</Text>
          <Text style={styles.subtitle}>Official Commercial Motor Quote</Text>
          <Text style={styles.subtitle}>Reference Date: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* RISK SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Insurer:</Text>
            <Text style={styles.value}>{quote.insurerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vehicle Sum Insured:</Text>
            <Text style={styles.value}>KES {quote.sumInsured?.toLocaleString() ?? "N/A"}</Text>
          </View>
        </View>

        {/* CALCULATION DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Calculation Breakdown</Text>
          
          {/* Base Premium Section */}
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Basic Premium</Text>
              <Text style={{ fontSize: 9, color: "#6b7280" }}>
                Applied Rate: {formatRate(quote.basePremiumDetails.rateValue)} 
                {quote.basePremiumDetails.minimumApplied && " (Minimum Premium Enforced)"}
              </Text>
            </View>
            <Text style={styles.value}>KES {quote.basicPremium.toLocaleString()}</Text>
          </View>
          
          {/* Riders Section */}
          {quote.riderDetails.map((rider) => (
            <View key={rider.riderId} style={styles.row}>
              <View>
                <Text style={styles.label}>{rider.name}</Text>
                <Text style={{ fontSize: 9, color: "#6b7280" }}>
                  {rider.rateType === "FREE" ? "Complimentary Benefit" : `Applied Rate: ${formatRate(rider.rateValue)}`}
                </Text>
              </View>
              <Text style={styles.value}>
                {rider.premium > 0 ? `KES ${rider.premium.toLocaleString()}` : "FREE"}
              </Text>
            </View>
          ))}

          {/* Levies Breakdown Section */}
          <View style={{ marginTop: 10, padding: 8, backgroundColor: "#f9fafb" }}>
            <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>Statutory Levies Breakdown</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Training Levy ({formatRate(quote.levyDetails.trainingLevy.rateValueBps)})</Text>
              <Text style={styles.label}>{quote.levyDetails.trainingLevy.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Policyholders Fund ({formatRate(quote.levyDetails.policyholdersFund.rateValueBps)})</Text>
              <Text style={styles.label}>{quote.levyDetails.policyholdersFund.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Stamp Duty (Flat)</Text>
              <Text style={styles.label}>{quote.levyDetails.stampDuty.amount.toLocaleString()}</Text>
            </View>
          </View>

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable Premium:</Text>
            <Text style={styles.totalValue}>KES {quote.totalPremium.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This is an automated quote generated via BimaSwift. All rates are based on the latest underwriter guidelines[cite: 1, 4, 21]. Underwriter Minimum Premiums were applied where necessary to ensure compliance[cite: 2, 4, 12].
        </Text>
      </Page>
    </Document>
  );
}