"use client"

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold">Not Found</h2>
            <p className="text-lg">Could not find the requested page</p>
            <Link href="/dashboard" className="text-blue-500 hover:underline mt-4">Return to Dashboard</Link>
        </div>
    )
}   