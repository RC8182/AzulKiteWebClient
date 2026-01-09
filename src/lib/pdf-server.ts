'use server';

// @ts-ignore
export async function parsePdf(buffer: Buffer) {
    const pdf = require('pdf-parse');
    return pdf(buffer);
}
