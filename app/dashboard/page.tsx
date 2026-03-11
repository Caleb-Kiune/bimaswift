import { UserButton } from "@clerk/nextjs";
import QuoteForm from "@/components/QuoteForm";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Quoting Engine Dashboard
          </h1>
          <UserButton />
        </div>

        <QuoteForm />
      </div>
    </div>
  );
}