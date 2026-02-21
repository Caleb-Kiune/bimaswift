import Link from "next/link";

interface DashSearchParams {
  searchParams: Promise<{ sort: string }>;
}
export default async function Dashboard({ searchParams }: DashSearchParams) {
  const { sort } = await searchParams;

  return (
    <>
      <h1>Agent Dashboard</h1>
      <Link href={"/quotes/123"}>Recent Quotes</Link>
      <Link href={"/dashboard?sort=highest-premium"}>Sort</Link>
      <h1>{sort? `Sorting by ${sort}`: 'Default sorting applied'}</h1>
    </>
  );
}
