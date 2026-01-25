import { NextRequest, NextResponse } from 'next/server';
import { agentRegistry } from '@/lib/agents/registry';
import { AgentRole } from '@/lib/agents/types';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const message = formData.get('message') as string;
        const role = formData.get('role') as string;
        const sessionId = formData.get('sessionId') as string;
        const contextStr = formData.get('context') as string;
        const files = formData.getAll('file') as File[];

        const context = contextStr ? JSON.parse(contextStr) : { language: 'es' };

        if (!role || !sessionId) {
            return NextResponse.json(
                { error: 'Missing required fields: role or sessionId' },
                { status: 400 }
            );
        }

        let processedMessage = message || '';

        const uploadedImageIds: number[] = [];

        // Handle files if present
        for (const file of files) {
            if (file.type === 'application/pdf') {
                try {
                    const pdf = require('pdf-parse');
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const data = await pdf(buffer);
                    processedMessage += `\n\n[Contenido del PDF: ${file.name}]\n${data.text}`;
                } catch (pdfError) {
                    console.error('Error parsing PDF in agent:', pdfError);
                    processedMessage += `\n\n[Error al leer el PDF: ${file.name}]`;
                }
            } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
                const jsonText = await file.text();
                processedMessage += `\n\n[Contenido del JSON: ${file.name}]\n${jsonText}`;
            } else if (file.type.startsWith('image/')) {
                // Upload image to Strapi to get an ID for the agent to use
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('files', file);

                    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
                        method: 'POST',
                        body: uploadFormData,
                    });

                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        const imageId = uploadData[0].id;
                        uploadedImageIds.push(imageId);
                        processedMessage += `\n\n[Imagen subida: ${file.name} (ID: ${imageId})]`;
                    } else {
                        console.error('Failed to upload image to Strapi:', await uploadRes.text());
                        processedMessage += `\n\n[Error al subir imagen: ${file.name}]`;
                    }
                } catch (err) {
                    console.error('Error uploading image in agent route:', err);
                    processedMessage += `\n\n[Error excepción subir imagen: ${file.name}]`;
                }
            } else {
                processedMessage += `\n\n[Archivo adjunto: ${file.name} (tipo no soportado directamente)]`;
            }
        }

        const agent = agentRegistry.getAgent(role as AgentRole, sessionId);
        const response = await agent.processMessage(processedMessage, {
            ...context,
            files: files, // Pass the actual File objects
            uploadedImageIds: uploadedImageIds // Pass the Strapi upload IDs
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in Agent API:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { sessionId } = await request.json();
        if (sessionId) {
            agentRegistry.clearSession(sessionId);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
    }
}
