import { prisma } from "@/src/lib/prisma";
import { SavedQuote } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import PrivateQuoteCard from "@/src/features/motor-private/components/PrivateQuoteCard";
import CommercialQuoteCard from "@/src/features/motor-commercial/components/CommercialQuoteCard";
import { DetailedQuoteBreakdown } from "@/src/features/motor-private/types";
import { CommercialQuoteResult } from "@/src/features/motor-commercial/types";
import { EmptyState } from "@/src/components/ui/empty-state";

export default async function Dashboard() {
  const { userId } = await auth();
  let fetchedQuotes: SavedQuote[] = [];

  try {
    if (userId) {
      fetchedQuotes = await prisma.savedQuote.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }
  } catch (error) {
    console.error("Error getting saved quotes", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 md:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Saved Quotes</h1>
            <p className="text-muted-foreground text-sm mt-1">Review and download your historical quote documents.</p>
          </div>
        </div>

        {fetchedQuotes.length === 0 ? (
          <EmptyState 
            title="No Saved Quotes" 
            description="You haven't saved any commercial or private vehicle quotes to your dashboard yet." 
          />
        ) : (
          <div className="space-y-6">
            {fetchedQuotes.map((savedEntity) => {
              // Distinguish and Render
              if (savedEntity.module === "MOTOR_PRIVATE") {
                const quoteData = savedEntity.quoteData as unknown as DetailedQuoteBreakdown;
                return (
                  <div key={savedEntity.id} className="relative">
                     <span className="absolute -top-3 left-4 z-10 bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                       Motor Private
                     </span>
                     <PrivateQuoteCard
                       insurerId={savedEntity.insurerId}
                       insurerName={savedEntity.insurerName}
                       quote={quoteData}
                       isHistoryView={true}
                     />
                  </div>
                );
              }
              
              if (savedEntity.module === "MOTOR_COMMERCIAL") {
                const quoteData = savedEntity.quoteData as unknown as CommercialQuoteResult;
                return (
                  <div key={savedEntity.id} className="relative">
                     <span className="absolute -top-3 left-4 z-10 bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                       Motor Commercial
                     </span>
                     <CommercialQuoteCard
                       quote={quoteData}
                       isHistoryView={true}
                     />
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
