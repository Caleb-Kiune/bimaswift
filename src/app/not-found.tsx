import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>

      <div className="mt-8 text-center">
        <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-4 text-gray-600">
          Sorry, we could not find the page or quote you are looking for.
        </p>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
}