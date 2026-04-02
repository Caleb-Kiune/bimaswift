import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { DetailedQuoteBreakdown } from "../types";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: "#4f46e5", paddingBottom: 10 },
  title: { fontSize: 24, color: "#312e81", fontWeight: "bold" },
  subtitle: { fontSize: 12, color: "#6b7280", marginTop: 5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", backgroundColor: "#f3f4f6", padding: 6, marginBottom: 10, color: "#374151" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 4 },
  label: { fontSize: 12, color: "#4b5563" },
  value: { fontSize: 12, color: "#111827", fontWeight: "bold" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, paddingTop: 10, borderTopWidth: 2, borderTopColor: "#111827" },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#4f46e5" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#9ca3af", fontSize: 10, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10 },
});

interface Props {
  insurerName: string;
  quote: DetailedQuoteBreakdown;
  coverType: "COMPREHENSIVE" | "TPO";
}

export default function PrivateQuoteDocument({ insurerName, quote, coverType }: Props) {
  const formatRate = (bps: number) => `${(bps / 100).toFixed(2)}%`;
  const formatNum = (num: number) => num.toLocaleString("en-KE");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>BimaSwift</Text>
          <Text style={styles.subtitle}>Private Motor Insurance Quote</Text>
          <Text style={styles.subtitle}>Reference Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Insurer:</Text>
            <Text style={styles.value}>{insurerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cover Type:</Text>
            <Text style={styles.value}>{coverType === "COMPREHENSIVE" ? "Comprehensive" : "Third Party Only"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Calculation Breakdown</Text>
          
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Basic Premium</Text>
              <Text style={{ fontSize: 9, color: "#6b7280" }}>
                Applied Rate: {formatRate(quote.basicPremium.breakdown.rateBps)}
                {quote.basicPremium.breakdown.isMinPremiumApplied && " (Minimum Premium Enforced)"}
              </Text>
            </View>
            <Text style={styles.value}>KES {formatNum(quote.basicPremium.value)}</Text>
          </View>

          {quote.calculatedRiders.map((rider) => (
            <View key={rider.id} style={styles.row}>
              <View>
                <Text style={styles.label}>{rider.name}</Text>
                <Text style={{ fontSize: 9, color: "#6b7280" }}>
                  {rider.premium.breakdown.rateType === "FREE" && "Complimentary Benefit"}
                  {rider.premium.breakdown.rateType === "FLAT" && "Flat Rate"}
                  {rider.premium.breakdown.rateType === "OPTION_SELECTION" && "Selected Tier Limit"}
                  {rider.premium.breakdown.rateType === "PERCENTAGE_BPS" && `Rate: ${formatRate(rider.premium.breakdown.rateValue)}`}
                  {rider.premium.breakdown.isMinPremiumApplied && " (Minimum Applied)"}
                </Text>
              </View>
              <Text style={styles.value}>
                {rider.premium.value > 0 ? `KES ${formatNum(rider.premium.value)}` : "FREE"}
              </Text>
            </View>
          ))}

          <View style={{ marginTop: 10, padding: 8, backgroundColor: "#f9fafb" }}>
            <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>Statutory Levies Breakdown</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Training Levy ({formatRate(quote.itl.breakdown.rateValue)})</Text>
              <Text style={styles.label}>{formatNum(quote.itl.value)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Policyholders Fund ({formatRate(quote.phcf.breakdown.rateValue)})</Text>
              <Text style={styles.label}>{formatNum(quote.phcf.value)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Stamp Duty (Flat)</Text>
              <Text style={styles.label}>{formatNum(quote.stampDuty.value)}</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable Premium:</Text>
            <Text style={styles.totalValue}>KES {formatNum(quote.totalPayable)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This is an automated quote generated via BimaSwift. Rates are based on dynamic underwriter guidelines. Underwriter Minimum Premiums were applied where necessary.
        </Text>
      </Page>
    </Document>
  );
}