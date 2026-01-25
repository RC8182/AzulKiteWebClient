import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'es';

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale },
          select: {
            name: true,
            description: true,
            shortDescription: true
          }
        },
        categories: {
          include: {
            translations: {
              where: { locale },
              select: {
                name: true,
                description: true
              }
            }
          }
        },
        images: true,
        variants: true,
        saleInfo: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const translation = product.translations[0] || {};
    const transformedProduct = {
      id: product.id,
      slug: product.slug,
      productNumber: product.productNumber,
      brand: product.brand,
      year: product.year,
      condition: product.condition,
      size: product.size,
      material: product.material,
      name: translation.name,
      description: translation.description,
      shortDescription: translation.shortDescription,
      price: product.variants[0]?.price || 0,
      stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      images: product.images,
      variants: product.variants,
      saleInfo: product.saleInfo,
      categories: product.categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.translations[0]?.name,
        description: cat.translations[0]?.description
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params;
    const body = await request.json();

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const {
      productNumber,
      brand,
      year,
      condition,
      size,
      material,
      translations,
      categoryIds,
      variants,
      saleInfo
    } = body;

    // Actualizar producto
    const product = await prisma.product.update({
      where: { slug },
      data: {
        productNumber,
        brand,
        year,
        condition,
        size,
        material,
        translations: translations ? {
          deleteMany: {},
          create: translations
        } : undefined,
        categories: categoryIds ? {
          set: categoryIds.map((id: string) => ({ id }))
        } : undefined,
        variants: variants ? {
          deleteMany: {},
          create: variants
        } : undefined,
        saleInfo: saleInfo ? {
          upsert: {
            create: saleInfo,
            update: saleInfo
          }
        } : undefined
      },
      include: {
        translations: true,
        categories: true,
        variants: true,
        saleInfo: true
      }
    });

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Eliminar producto
    await prisma.product.delete({
      where: { slug }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}