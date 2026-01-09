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
                // Acknowledge image receipt
                processedMessage += `\n\n[Imagen adjunta: ${file.name} (${file.type})]`;
            } else {
                processedMessage += `\n\n[Archivo adjunto: ${file.name} (tipo no soportado directamente)]`;
            }
        }

        const agent = agentRegistry.getAgent(role as AgentRole, sessionId);
        const response = await agent.processMessage(processedMessage, {
            ...context,
            files: files // Pass the actual File objects
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
