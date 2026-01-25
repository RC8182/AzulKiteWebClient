import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const locale = searchParams.get('locale') || 'es';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro por categoría
    if (category) {
      where.categories = {
        some: {
          slug: category
        }
      };
    }

    // Filtro de búsqueda
    if (search) {
      where.translations = {
        some: {
          locale,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } }
          ]
        }
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
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
                  name: true
                }
              }
            }
          },
          images: true,
          variants: true,
          saleInfo: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ]);

    // Transformar productos
    const transformedProducts = products.map(product => {
      const translation = product.translations[0] || {};
      return {
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
          name: cat.translations[0]?.name
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      productNumber,
      brand,
      year,
      condition = 'new',
      size,
      material,
      translations,
      categoryIds = [],
      variants = [],
      saleInfo
    } = body;

    // Verificar que el slug no exista
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        slug,
        productNumber,
        brand,
        year,
        condition,
        size,
        material,
        translations: {
          create: translations
        },
        categories: {
          connect: categoryIds.map((id: string) => ({ id }))
        },
        variants: {
          create: variants
        },
        saleInfo: saleInfo ? {
          create: saleInfo
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
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}