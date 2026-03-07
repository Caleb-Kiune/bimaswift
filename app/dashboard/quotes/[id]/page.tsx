interface QuotePageProps {
    params: Promise<{ id: string }>;
}

export default async function QuotePage({ params }: QuotePageProps) {

    const { id } = await params;
    console.log(id);
    return <div>Quote: {id}</div>;
}