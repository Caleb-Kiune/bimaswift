interface QuoteParam {
    params: Promise<{quoteId: string}>
}
export default async function QuoteId(
    {params}: QuoteParam
) {

    const { quoteId } = await params
    if (quoteId === 'crash') {
        throw new Error(
            "underwriting API offline"
        )
    }


  return <h1>Viewing Underwriting Data for Quote: {quoteId}</h1>;
}