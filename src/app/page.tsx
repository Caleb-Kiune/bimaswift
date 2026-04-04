"use client";

import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { buttonVariants } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen bg-secondary/30 flex justify-center py-16 px-4">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            BimaSwift Quoting Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select an insurance product line below to generate rapid, accurate market quotes instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Motor Private */}
          <Card className="rounded-2xl p-8 border border-border shadow-sm hover:border-border/80 transition-all flex flex-col justify-between bg-card text-card-foreground">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Private Motor</h2>
              <p className="text-muted-foreground leading-relaxed h-16">
                Instant quotes for personal vehicles. Access seamless TPO or comprehensive coverage with dynamic rider selection.
              </p>
            </div>

            <div className="pt-8 mt-auto">
              <Link
                href="/quote/motor-private"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full rounded-xl relative overflow-hidden group",
                  "font-medium tracking-tight",
                  "shadow-sm hover:shadow-md",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-[1px] active:translate-y-0",
                  "bg-primary text-primary-foreground"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  Get Private Quote
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </Card>

          {/* Card 2: Motor Commercial */}
          <Card className="rounded-2xl p-8 border border-border shadow-sm hover:border-border/80 transition-all flex flex-col justify-between bg-card text-card-foreground">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Commercial Motor</h2>
              <p className="text-muted-foreground leading-relaxed h-16">
                Enterprise module for heavy commercial trucks, PSV, fleet cartage, and high-value liability policies.
              </p>
            </div>

            <div className="pt-8 mt-auto">
              <Link
                href="/quote/motor-commercial"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full rounded-xl relative overflow-hidden group",
                  "font-medium tracking-tight",
                  "shadow-sm hover:shadow-md",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-[1px] active:translate-y-0",
                  "bg-primary text-primary-foreground"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  Get Commercial Quote
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}