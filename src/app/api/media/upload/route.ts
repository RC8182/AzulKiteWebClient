import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const categoryId = formData.get('categoryId') as string;
    const type = (formData.get('type') as string) || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name;
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${extension}`;
    
    // Determinar subdirectorio basado en el tipo
    let subDir = 'general';
    if (productId) {
      subDir = `products/${productId}`;
    } else if (categoryId) {
      subDir = `categories/${categoryId}`;
    } else if (type) {
      subDir = type;
    }

    const filePath = join(uploadsDir, subDir, fileName);
    const publicUrl = `/uploads/${subDir}/${fileName}`;

    // Crear subdirectorio si no existe
    const subDirPath = join(uploadsDir, subDir);
    try {
      await mkdir(subDirPath, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    // Convertir File a Buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Guardar metadata en la base de datos
    const media = await prisma.media.create({
      data: {
        url: publicUrl,
        altText: originalName,
        fileName: originalName,
        fileSize: file.size,
        mimeType: file.type,
        width: 0, // Se podría extraer de la imagen
        height: 0, // Se podría extraer de la imagen
        type,
        productId: productId || null,
        categoryId: categoryId || null,
      }
    });

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        altText: media.altText,
        fileName: media.fileName,
        fileSize: media.fileSize,
        mimeType: media.mimeType,
      }
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}