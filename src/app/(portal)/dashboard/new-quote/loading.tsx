export default function LoadingQuote() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <h1 className="text-2xl font-medium text-gray-700">
          Calculating your quote...
        </h1>
      </div>
    </div>
  );
}