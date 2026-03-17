import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { Quote } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
  // 1. Grab the active user's ID
  const { userId } = await auth();
  let fetchedQuotes: Quote[] = [];

  try {
    // 2. Fetch only their quotes
    if (userId) {
      fetchedQuotes = await prisma.quote.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10 // Show top 10 recent
      });
    }
  } catch (error) {
    console.error("Error getting saved quotes", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Saved Quotes
          </h1>
        </div>

        <div className="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {fetchedQuotes.length === 0 ? (
            <p className="text-sm text-gray-500">No quotes saved yet.</p>
          ) : (
            <div className="space-y-3">
              {fetchedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-blue-900">
                      {quote.insurerId}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      KES {quote.vehicleValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quote.coverType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}