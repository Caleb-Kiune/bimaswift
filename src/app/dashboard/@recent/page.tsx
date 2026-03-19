import Link from "next/link";

export default function Recent() {
  const mockQuotes = [
    { id: "BS-123", client: "Alice" },
    { id: "BS-456", client: "Bob" },
    { id: "BS-789", client: "Charlie" },
    { id: "BS-012", client: "David" },
    { id: "BS-345", client: "Eve" },
  ];

  return (
    <>
      <div>Recent Quotes Slot</div>
      {mockQuotes.map((quote) => (
        <Link href={`/dashboard/quotes/${quote.id}`} key={quote.id}>
          <div>
            {quote.id} - {quote.client}
          </div>
        </Link>
      ))}
    </>
  );
}
