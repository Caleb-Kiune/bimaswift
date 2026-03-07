interface QuotePageProps {
    params: {
        id: string;
    };
}

export default function QuotePage({ params }: QuotePageProps) {
    return <div>Quote: {params.id}</div>;
}