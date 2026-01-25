import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (type) {
      where.type = type;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: media,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Verificar si el media existe
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Eliminar archivo físico (opcional)
    // const filePath = join(process.cwd(), 'public', media.url);
    // try {
    //   await unlink(filePath);
    // } catch (error) {
    //   console.warn('Could not delete physical file:', error);
    // }

    // Eliminar de la base de datos
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}