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
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const skip = (page - 1) * limit;

    // Obtener categoría
    const category = await prisma.category.findUnique({
      where: { slug },
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
        children: {
          include: {
            translations: {
              where: { locale },
              select: {
                name: true
              }
            },
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        images: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const translation = category.translations[0] || {};
    const baseResponse = {
      id: category.id,
      slug: category.slug,
      name: translation.name,
      description: translation.description,
      parent: category.parent ? {
        id: category.parent.id,
        slug: category.parent.slug,
        name: category.parent.translations[0]?.name
      } : null,
      children: category.children.map(child => ({
        id: child.id,
        slug: child.slug,
        name: child.translations[0]?.name,
        productCount: child._count.products
      })),
      images: category.images,
      productCount: category._count.products,
      childrenCount: category._count.children
    };

    // Si se solicitan productos
    if (includeProducts) {
      // Obtener todos los IDs de categorías en el subárbol
      const categoryIds = await getCategorySubtreeIds(category.id);

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            categories: {
              some: {
                id: { in: categoryIds }
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
            categories: {
              some: {
                id: { in: categoryIds }
              }
            }
          }
        })
      ]);

      const transformedProducts = products.map(product => {
        const productTranslation = product.translations[0] || {};
        return {
          id: product.id,
          slug: product.slug,
          productNumber: product.productNumber,
          brand: product.brand,
          name: productTranslation.name,
          description: productTranslation.description,
          shortDescription: productTranslation.shortDescription,
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

      return NextResponse.json({
        success: true,
        data: {
          ...baseResponse,
          products: transformedProducts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: baseResponse
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
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

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const { newSlug, parentId, translations } = body;

    // Si se cambia el slug, verificar que no exista
    if (newSlug && newSlug !== slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: newSlug }
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Verificar ciclos en la jerarquía
    if (parentId) {
      if (parentId === existingCategory.id) {
        return NextResponse.json(
          { success: false, error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

      // Verificar ciclos recursivos
      let currentParentId = parentId;
      while (currentParentId) {
        const currentParent = await prisma.category.findUnique({
          where: { id: currentParentId },
          select: { parentId: true }
        });

        if (!currentParent) break;
        
        if (currentParent.parentId === existingCategory.id) {
          return NextResponse.json(
            { success: false, error: 'Circular reference detected in category hierarchy' },
            { status: 400 }
          );
        }
        
        currentParentId = currentParent.parentId || '';
      }
    }

    // Actualizar categoría
    const category = await prisma.category.update({
      where: { slug },
      data: {
        slug: newSlug || slug,
        parentId,
        translations: translations ? {
          deleteMany: {},
          create: translations
        } : undefined
      },
      include: {
        translations: true,
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
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

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        products: {
          take: 1
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Verificar que no tenga hijos
    if (existingCategory.children.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    // Verificar que no tenga productos
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with products' },
        { status: 400 }
      );
    }

    // Eliminar categoría
    await prisma.category.delete({
      where: { slug }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener IDs de todas las categorías en el subárbol
async function getCategorySubtreeIds(rootId: string): Promise<string[]> {
  const ids: string[] = [rootId];
  
  const getChildrenIds = async (parentId: string) => {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true }
    });
    
    for (const child of children) {
      ids.push(child.id);
      await getChildrenIds(child.id);
    }
  };
  
  await getChildrenIds(rootId);
  return ids;
}