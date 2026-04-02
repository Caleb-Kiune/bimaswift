import Link from "next/link";
import QuoteForm from "@/src/features/motor-private/components/QuoteForm";
import { getActiveMotorProducts } from "@/src/features/motor-private/services/products";

export default async function MotorPrivateQuotePage() {
  const initialProducts = await getActiveMotorProducts();

  return (
    <main className="min-h-screen bg-secondary/30 py-12 px-4 sm:px-8">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        {/* Header Toggle / Back Button */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Private Motor Quote
          </h1>
          <p className="text-muted-foreground">
            Get an instant comprehensive or TPO quote for your personal vehicle.
          </p>
        </div>

        <QuoteForm initialProducts={initialProducts} />
      </div>
    </main>
  );
}
