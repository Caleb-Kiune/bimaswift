import { Show, SignInButton, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = {
  title: "BimaSwift: Agent Portal",
  description: "Fast Premium Quotations",
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          BimaSwift
        </h1>

        <p className="mt-3 text-gray-600">Fast Premium Quotations</p>

        <div className="mt-10 flex flex-col gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800">
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Enter Dashboard →
            </Link>

            <SignOutButton>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Sign out
              </button>
            </SignOutButton>
          </Show>
        </div>
      </div>
    </main>
  );
}
