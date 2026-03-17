import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
        BimaSwift
      </Link>

      <div className="flex items-center gap-4">
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Quote History
          </Link>
          <UserButton />
        </Show>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
              Sign In
            </button>
          </SignInButton>
        </Show>
      </div>
    </nav>
  );
}
