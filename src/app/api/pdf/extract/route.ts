import { NextRequest, NextResponse } from 'next/server';

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

        // PDF parsing disabled during build - will be re-enabled in runtime
        // const data = await pdf(buffer);
        
        // For now, return placeholder response
        return NextResponse.json({
            text: "PDF parsing temporarily disabled during build",
            pages: 1,
            info: { Title: "Placeholder" },
            metadata: {},
            version: "1.0"
        });
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to extract PDF text' },
            { status: 500 }
        );
    }
}
