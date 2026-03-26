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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>BimaSwift</Text>
          <Text style={styles.subtitle}>Official Commercial Motor Quote</Text>
          <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* INSURER DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Underwriter Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Insurance Company:</Text>
            <Text style={styles.value}>{quote.insurerName}</Text>
          </View>
        </View>

        {/* PREMIUM BREAKDOWN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Basic Premium:</Text>
            <Text style={styles.value}>KES {quote.basicPremium.toLocaleString()}</Text>
          </View>
          
          {quote.pllCharge > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Passenger Legal Liability (PLL):</Text>
              <Text style={styles.value}>KES {quote.pllCharge.toLocaleString()}</Text>
            </View>
          )}

          {quote.riderPremiums > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Optional Riders (e.g. PVT, Excess):</Text>
              <Text style={styles.value}>KES {quote.riderPremiums.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Statutory Levies & Stamp Duty:</Text>
            <Text style={styles.value}>KES {quote.levies.toLocaleString()}</Text>
          </View>

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable Premium:</Text>
            <Text style={styles.totalValue}>KES {quote.totalPremium.toLocaleString()}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Generated securely by BimaSwift Engine • This quote is valid for 30 days and is subject to underwriter approval.
        </Text>
        
      </Page>
    </Document>
  );
}