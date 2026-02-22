import { NextResponse } from "next/server";

export async function GET (
    request: Request, 
    {params}: {params: Promise<{id: string}>}
    
) {

    const { id } = await params

    const mockQuote = {
        id: id,
        premium: 1250,
        company: "Kentab"
    }

    return  NextResponse.json(mockQuote)

}

export async function DELETE (
    request: Request,
    {params}: {params: Promise<{id: string}>}
) {

    const { id } = await params



    return NextResponse.json({message: "Quote deleted"})

}