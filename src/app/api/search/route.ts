import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const locale = searchParams.get('locale') || 'es';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          query: '',
          count: 0,
          total: 0,
          products: [],
          categories: []
        }
      });
    }

    const searchQuery = query.trim();
    const skip = (page - 1) * limit;

    // Buscar productos
    const [products, productsTotal] = await Promise.all([
      prisma.product.findMany({
        where: {
          translations: {
            some: {
              locale,
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { shortDescription: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          }
        },
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
      prisma.product.count({
        where: {
          translations: {
            some: {
              locale,
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { shortDescription: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          }
        }
      })
    ]);

    // Buscar categorías
    const categories = await prisma.category.findMany({
      where: {
        translations: {
          some: {
            locale,
            name: { contains: searchQuery, mode: 'insensitive' }
          }
        }
      },
      take: 5,
      include: {
        translations: {
          where: { locale },
          select: {
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    // Transformar productos
    const transformedProducts = products.map(product => {
      const translation = product.translations[0] || {};
      return {
        id: product.id,
        slug: product.slug,
        productNumber: product.productNumber,
        brand: product.brand,
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
        }))
      };
    });

    // Transformar categorías
    const transformedCategories = categories.map(category => {
      const translation = category.translations[0] || {};
      return {
        id: category.id,
        slug: category.slug,
        name: translation.name,
        description: translation.description,
        productCount: category._count.products
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        query: searchQuery,
        count: transformedProducts.length + transformedCategories.length,
        total: productsTotal + categories.length,
        products: transformedProducts,
        categories: transformedCategories,
        pagination: {
          page,
          limit,
          total: productsTotal,
          pages: Math.ceil(productsTotal / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}