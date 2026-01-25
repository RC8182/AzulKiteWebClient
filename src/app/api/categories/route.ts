import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'es';
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const tree = searchParams.get('tree') === 'true';

    if (tree) {
      // Obtener árbol de categorías
      const categories = await prisma.category.findMany({
        where: {
          parentId: null // Solo categorías raíz
        },
        include: {
          translations: {
            where: { locale },
            select: {
              name: true,
              description: true
            }
          },
          children: {
            include: {
              translations: {
                where: { locale },
                select: {
                  name: true,
                  description: true
                }
              },
              children: {
                include: {
                  translations: {
                    where: { locale },
                    select: {
                      name: true,
                      description: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          slug: 'asc'
        }
      });

      const transformedCategories = categories.map(category => {
        const translation = category.translations[0] || {};
        return {
          id: category.id,
          slug: category.slug,
          name: translation.name,
          description: translation.description,
          productCount: category._count.products,
          children: category.children.map(child => {
            const childTranslation = child.translations[0] || {};
            return {
              id: child.id,
              slug: child.slug,
              name: childTranslation.name,
              description: childTranslation.description,
              productCount: child._count?.products || 0,
              children: child.children.map(grandchild => {
                const grandchildTranslation = grandchild.translations[0] || {};
                return {
                  id: grandchild.id,
                  slug: grandchild.slug,
                  name: grandchildTranslation.name,
                  description: grandchildTranslation.description,
                  productCount: grandchild._count?.products || 0
                };
              })
            };
          })
        };
      });

      return NextResponse.json({
        success: true,
        data: transformedCategories
      });
    }

    // Obtener todas las categorías
    const categories = await prisma.category.findMany({
      include: {
        translations: {
          where: { locale },
          select: {
            name: true,
            description: true
          }
        },
        parent: {
          include: {
            translations: {
              where: { locale },
              select: {
                name: true
              }
            }
          }
        },
        children: true,
        ...(includeProducts && {
          products: {
            include: {
              translations: {
                where: { locale },
                select: {
                  name: true
                }
              },
              images: true
            },
            take: 5
          }
        }),
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      },
      orderBy: {
        slug: 'asc'
      }
    });

    const transformedCategories = categories.map(category => {
      const translation = category.translations[0] || {};
      return {
        id: category.id,
        slug: category.slug,
        name: translation.name,
        description: translation.description,
        parent: category.parent ? {
          id: category.parent.id,
          slug: category.parent.slug,
          name: category.parent.translations[0]?.name
        } : null,
        productCount: category._count.products,
        childrenCount: category._count.children,
        ...(includeProducts && {
          products: category.products?.map(product => ({
            id: product.id,
            slug: product.slug,
            name: product.translations[0]?.name,
            image: product.images[0]
          }))
        })
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, parentId, translations } = body;

    // Verificar que el slug no exista
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Verificar que el padre existe si se proporciona
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Crear categoría
    const category = await prisma.category.create({
      data: {
        slug,
        parentId,
        translations: {
          create: translations
        }
      },
      include: {
        translations: true,
        parent: true
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}