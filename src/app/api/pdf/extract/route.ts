import { NextRequest, NextResponse } from 'next/server';
const pdf = require('pdf-parse');

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
        // pdf-parse is a bit problematic in some Node environments
        // We use the basic version which usually works fine in Next.js Server Actions/Routes
        const data = await pdf(buffer);

        if (!data || !data.text) {
            throw new Error('No text content found in PDF');
        }

        return NextResponse.json({
            text: data.text,
            pages: data.numpages,
            info: data.info,
            metadata: data.metadata,
            version: data.version,
        });
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to extract PDF text' },
            { status: 500 }
        );
    }
}
