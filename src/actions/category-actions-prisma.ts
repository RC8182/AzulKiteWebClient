'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// ========== TIPOS ==========

interface CategoryCreateData {
  slug: string;
  parentId?: string;
  translations: {
    locale: string;
    name: string;
    description?: string;
  }[];
}

interface CategoryUpdateData extends Partial<CategoryCreateData> {
  id: string;
}

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Obtener todas las categorías
 */
export async function getCategories(locale: string = 'es') {
  try {
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
        children: {
          include: {
            translations: {
              where: { locale },
              select: {
                name: true
              }
            },
            children: {
              include: {
                translations: {
                  where: { locale },
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
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
          take: 5 // Limitar productos para preview
        },
        images: true,
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

    // Transformar datos
    return categories.map(category => {
      const translation = category.translations[0] || {};
      return {
        ...category,
        name: translation.name,
        description: translation.description
      };
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Obtener árbol de categorías
 */
export async function getCategoryTree(locale: string = 'es') {
  try {
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

    return categories.map(category => {
      const translation = category.translations[0] || {};
      return {
        ...category,
        name: translation.name,
        description: translation.description
      };
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    throw error;
  }
}

/**
 * Obtener categoría por ID
 */
export async function getCategory(id: string, locale: string = 'es') {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
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
        products: {
          include: {
            translations: {
              where: { locale },
              select: {
                name: true,
                description: true,
                shortDescription: true
              }
            },
            images: true,
            variants: true,
            saleInfo: true,
            categories: {
              include: {
                translations: {
                  where: { locale },
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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
      throw new Error('Category not found');
    }

    const translation = category.translations[0] || {};
    
    return {
      ...category,
      name: translation.name,
      description: translation.description
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

/**
 * Obtener categoría por slug
 */
export async function getCategoryBySlug(slug: string, locale: string = 'es') {
  try {
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
        products: {
          include: {
            translations: {
              where: { locale },
              select: {
                name: true,
                description: true,
                shortDescription: true
              }
            },
            images: true,
            variants: true,
            saleInfo: true,
            categories: {
              include: {
                translations: {
                  where: { locale },
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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
      return null;
    }

    const translation = category.translations[0] || {};
    
    return {
      ...category,
      name: translation.name,
      description: translation.description
    };
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    throw error;
  }
}

/**
 * Crear categoría
 */
export async function createCategory(data: CategoryCreateData) {
  try {
    const { slug, parentId, translations } = data;

    // Verificar que el slug no exista
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    // Verificar que el padre existe si se proporciona
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    // Crear categoría
    const category = await prisma.category.create({
      data: {
        slug,
        parentId,
        translations: {
          create: translations.map(t => ({
            locale: t.locale,
            name: t.name,
            description: t.description
          }))
        }
      },
      include: {
        translations: true,
        parent: true,
        children: true
      }
    });

    revalidatePath('/[lang]/dashboard/categories', 'page');
    revalidatePath('/[lang]/dashboard', 'layout');
    
    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar categoría
 */
export async function updateCategory(id: string, data: CategoryUpdateData) {
  try {
    const { slug, parentId, translations } = data;

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Si se cambia el slug, verificar que no exista
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugExists) {
        throw new Error('Category with this slug already exists');
      }
    }

    // Verificar que no se cree un ciclo en la jerarquía
    if (parentId) {
      if (parentId === id) {
        throw new Error('Category cannot be its own parent');
      }

      // Verificar que el padre existe
      const parent = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        throw new Error('Parent category not found');
      }

      // Verificar ciclos recursivos
      let currentParentId = parentId;
      while (currentParentId) {
        const currentParent = await prisma.category.findUnique({
          where: { id: currentParentId },
          select: { parentId: true }
        });

        if (!currentParent) break;
        
        if (currentParent.parentId === id) {
          throw new Error('Circular reference detected in category hierarchy');
        }
        
        currentParentId = currentParent.parentId || '';
      }
    }

    // Actualizar categoría
    const category = await prisma.category.update({
      where: { id },
      data: {
        slug,
        parentId,
        translations: translations ? {
          deleteMany: {}, // Eliminar todas las traducciones existentes
          create: translations.map(t => ({
            locale: t.locale,
            name: t.name,
            description: t.description
          }))
        } : undefined
      },
      include: {
        translations: true,
        parent: true,
        children: true
      }
    });

    revalidatePath('/[lang]/dashboard/categories', 'page');
    revalidatePath(`/[lang]/dashboard/categories/${id}`, 'page');
    
    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar categoría
 */
export async function deleteCategory(id: string) {
  try {
    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: {
          take: 1
        }
      }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Verificar que no tenga hijos
    if (existingCategory.children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    // Verificar que no tenga productos
    if (existingCategory.products.length > 0) {
      throw new Error('Cannot delete category with products');
    }

    // Eliminar categoría
    await prisma.category.delete({
      where: { id }
    });

    revalidatePath('/[lang]/dashboard/categories', 'page');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener productos por categoría
 */
export async function getProductsByCategory(
  categorySlug: string,
  page: number = 1,
  pageSize: number = 25,
  locale: string = 'es'
) {
  try {
    const skip = (page - 1) * pageSize;

    // Obtener categoría
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true }
    });

    if (!category) {
      throw new Error('Category not found');
    }

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
        take: pageSize,
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
      const translation = product.translations[0] || {};
      return {
        ...product,
        name: translation.name,
        description: translation.description,
        shortDescription: translation.shortDescription
      };
    });

    return {
      category: await getCategoryBySlug(categorySlug, locale),
      products: transformedProducts,
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total
      }
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

/**
 * Obtener IDs de todas las categorías en el subárbol
 */
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

/**
 * Migrar categoría desde Strapi
 */
export async function migrateCategoryFromStrapi(strapiData: any) {
  try {
    const {
      id: strapiId,
      documentId,
      attributes
    } = strapiData;

    // Extraer datos de Strapi
    const {
      slug,
      parent: strapiParent,
      children: strapiChildren,
      name,
      description,
      locale = 'es',
      localizations = []
    } = attributes;

    // Preparar traducciones
    const translations = [
      {
        locale,
        name,
        description
      },
      ...localizations.map((loc: any) => ({
        locale: loc.locale,
        name: loc.name,
        description: loc.description
      }))
    ];

    // Obtener ID del padre si existe
    let parentId: string | undefined;
    if (strapiParent?.data?.id) {
      // Buscar categoría padre migrada
      const parentCategory = await prisma.category.findFirst({
        where: {
          slug: strapiParent.data.attributes?.slug
        },
        select: { id: true }
      });
      
      if (parentCategory) {
        parentId = parentCategory.id;
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

    return { success: true, data: category, strapiId };
  } catch (error: any) {
    console.error('Error migrating category:', error);
    return { success: false, error: error.message, strapiId: strapiData.id };
  }
}

/**
 * Obtener estadísticas de categorías
 */
export async function getCategoryStats(locale: string = 'es') {
  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: {
          where: { locale },
          select: {
            name: true
          }
        },
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    const stats = {
      total: categories.length,
      withProducts: categories.filter(c => c._count.products > 0).length,
      withChildren: categories.filter(c => c._count.children > 0).length,
      orphaned: categories.filter(c => !c.parentId && c._count.products === 0).length,
      deepestLevel: await getDeepestCategoryLevel(),
      averageProducts: categories.length > 0 
        ? categories.reduce((sum, c) => sum + c._count.products, 0) / categories.length 
        : 0
    };

    return stats;
  } catch (error) {
    console.error('Error getting category stats:', error);
    throw error;
  }
}

/**
 * Obtener el nivel más profundo de categorías
 */
async function getDeepestCategoryLevel(): Promise<number> {
  const categories = await prisma.category.findMany({
    select: { id: true, parentId: true }
  });

  const getDepth = (categoryId: string, visited = new Set<string>()): number => {
    if (visited.has(categoryId)) return 0; // Evitar ciclos
    visited.add(categoryId);

    const children = categories.filter(c => c.parentId === categoryId);
    if (children.length === 0) return 1;

    const depths = children.map(child => getDepth(child.id, visited));
    return 1 + Math.max(...depths);
  };

  const rootCategories = categories.filter(c => !c.parentId);
  const depths = rootCategories.map(root => getDepth(root.id));
  
  return depths.length > 0 ? Math.max(...depths) : 0;
}