import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse/lib/pdf-parse';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF
        const data = await pdf(buffer);
        const text = data.text;

        return NextResponse.json({
            text,
            pages: data.numpages,
            info: data.info,
        });
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        return NextResponse.json(
            { error: 'Failed to extract PDF text' },
            { status: 500 }
        );
    }
}
