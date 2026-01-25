'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/deepseek';
import { indexDocument, createCollection, getCollectionInfo } from '@/lib/qdrant';
// @ts-ignore
import { parsePdf } from '@/lib/pdf-server';
import { join } from 'path';
import { readFile } from 'fs/promises';

// ========== TIPOS ==========

interface ProductCreateData {
  slug: string;
  productNumber?: string;
  brand?: string;
  year?: number;
  condition?: string;
  size?: string;
  material?: string;
  accessories?: any;
  technicalDetails?: any;
  categories?: string[];
  images?: string[]; // IDs de imágenes
  translations: {
    locale: string;
    name: string;
    description?: string;
    shortDescription?: string;
  }[];
  variants?: {
    name: string;
    sku?: string;
    price: number;
    stock: number;
    attributes?: any;
  }[];
  saleInfo?: {
    onSale: boolean;
    salePrice?: number;
    saleStart?: Date;
    saleEnd?: Date;
  };
}

interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
}

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Obtener productos con paginación
 */
export async function getProducts(
  page: number = 1,
  pageSize: number = 25,
  filters?: any,
  locale: string = 'es'
) {
  try {
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Aplicar filtros básicos
    if (filters) {
      if (filters.category) {
        where.categories = {
          some: {
            slug: filters.category
          }
        };
      }

      if (filters.search) {
        where.translations = {
          some: {
            locale,
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { shortDescription: { contains: filters.search, mode: 'insensitive' } }
            ]
          }
        };
      }

      if (filters.brand) {
        where.brand = filters.brand;
      }

      if (filters.condition) {
        where.condition = filters.condition;
      }

      if (filters.year) {
        where.year = filters.year;
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          translations: {
            where: { locale },
            select: {
              id: true,
              locale: true,
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
          saleInfo: true,
          _count: {
            select: {
              categories: true,
              images: true,
              variants: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ]);

    // Transformar datos para mantener compatibilidad
    const transformedProducts = products.map(product => {
      const translation = product.translations[0] || {};

      // Transformar categorías para aplanar traducciones
      const transformedCategories = product.categories.map(cat => {
        const catTrans = cat.translations[0] || {};
        return {
          ...cat,
          name: catTrans.name || cat.slug,
          description: catTrans.description
        };
      });

      // Calcular stock total y precio base
      const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const minPrice = product.variants.length > 0
        ? Math.min(...product.variants.map(v => v.price))
        : 0;

      return {
        ...product,
        id: product.id,
        documentId: product.id, // Para compatibilidad
        stock: totalStock, // Añadir a nivel raíz
        price: minPrice, // Añadir a nivel raíz
        attributes: {
          ...product,
          name: translation.name,
          description: translation.description,
          shortDescription: translation.shortDescription,
          categories: transformedCategories, // Sobrescribir con categorías aplanadas
          locale,
          stock: totalStock, // Añadir a attributes para compatibilidad
          price: minPrice // Añadir a attributes para compatibilidad
        },
        name: translation.name,
        description: translation.description,
        shortDescription: translation.shortDescription,
        categories: transformedCategories, // Añadir a nivel raíz también
        locale
      };
    });

    return {
      data: transformedProducts,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total
        }
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Obtener producto por ID
 */
export async function getProduct(id: string, locale: string = 'es') {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: {
          where: { locale },
          select: {
            id: true,
            locale: true,
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
      throw new Error('Product not found');
    }

    const translation = product.translations[0] || {};

    // Transformar categorías para aplanar traducciones
    const transformedCategories = product.categories.map(cat => {
      const catTrans = cat.translations[0] || {};
      return {
        ...cat,
        name: catTrans.name || cat.slug,
        description: catTrans.description
      };
    });

    return {
      ...product,
      id: product.id,
      documentId: product.id, // Para compatibilidad
      attributes: {
        ...product,
        name: translation.name,
        description: translation.description,
        shortDescription: translation.shortDescription,
        categories: transformedCategories,
        locale
      },
      name: translation.name,
      description: translation.description,
      shortDescription: translation.shortDescription,
      categories: transformedCategories,
      locale
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Obtener producto por slug
 */
export async function getProductBySlug(slug: string, locale: string = 'es') {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale },
          select: {
            id: true,
            locale: true,
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
      return null;
    }

    const translation = product.translations[0] || {};

    return {
      ...product,
      id: product.id,
      documentId: product.id,
      attributes: {
        ...product,
        name: translation.name,
        description: translation.description,
        shortDescription: translation.shortDescription,
        locale
      },
      name: translation.name,
      description: translation.description,
      shortDescription: translation.shortDescription,
      locale
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    throw error;
  }
}

/**
 * Crear producto
 */
export async function createProduct(data: ProductCreateData) {
  try {
    const {
      slug,
      productNumber,
      brand,
      year,
      condition = 'new',
      size,
      material,
      accessories,
      technicalDetails,
      categories = [],
      images = [],
      translations,
      variants = [],
      saleInfo
    } = data;

    // Verificar que el slug no exista
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      throw new Error('Product with this slug already exists');
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
        accessories,
        technicalDetails,
        // Relaciones
        translations: {
          create: translations.map(t => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
            shortDescription: t.shortDescription
          }))
        },
        categories: {
          connect: categories.map(id => ({ id }))
        },
        images: {
          connect: images.map(id => ({ id }))
        },
        variants: {
          create: variants.map(v => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes
          }))
        },
        saleInfo: saleInfo ? {
          create: {
            onSale: saleInfo.onSale,
            salePrice: saleInfo.salePrice,
            saleStart: saleInfo.saleStart,
            saleEnd: saleInfo.saleEnd
          }
        } : undefined
      },
      include: {
        translations: true,
        categories: true,
        variants: true,
        saleInfo: true,
        images: true
      }
    });

    revalidatePath('/[lang]/dashboard/products', 'page');
    revalidatePath('/[lang]/dashboard', 'layout');

    return { success: true, data: product };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar producto
 */
export async function updateProduct(id: string, data: ProductUpdateData) {
  try {
    const {
      slug,
      productNumber,
      brand,
      year,
      condition,
      size,
      material,
      accessories,
      technicalDetails,
      categories,
      images,
      translations,
      variants,
      saleInfo
    } = data;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Si se cambia el slug, verificar que no exista
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug }
      });

      if (slugExists) {
        throw new Error('Product with this slug already exists');
      }
    }

    // Actualizar producto
    const product = await prisma.product.update({
      where: { id },
      data: {
        slug,
        productNumber,
        brand,
        year,
        condition,
        size,
        material,
        accessories,
        technicalDetails,
        // Actualizar categorías si se proporcionan
        categories: categories ? {
          set: categories.map(categoryId => ({ id: categoryId }))
        } : undefined,
        // Actualizar imágenes
        images: images ? {
          set: images.map(id => ({ id }))
        } : undefined,
        // Actualizar traducciones
        translations: translations ? {
          deleteMany: {}, // Eliminar todas las traducciones existentes
          create: translations.map(t => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
            shortDescription: t.shortDescription
          }))
        } : undefined,
        // Actualizar variantes
        variants: variants ? {
          deleteMany: {}, // Eliminar todas las variantes existentes
          create: variants.map(v => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes
          }))
        } : undefined,
        // Actualizar información de venta
        saleInfo: saleInfo ? {
          upsert: {
            create: {
              onSale: saleInfo.onSale,
              salePrice: saleInfo.salePrice,
              saleStart: saleInfo.saleStart,
              saleEnd: saleInfo.saleEnd
            },
            update: {
              onSale: saleInfo.onSale,
              salePrice: saleInfo.salePrice,
              saleStart: saleInfo.saleStart,
              saleEnd: saleInfo.saleEnd
            }
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

    revalidatePath('/[lang]/dashboard/products', 'page');
    revalidatePath(`/[lang]/dashboard/products/${id}`, 'page');

    return { success: true, data: product };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar múltiples productos a la vez
 */
export async function bulkUpdateProducts(ids: string[], updates: Partial<ProductCreateData>) {
  try {
    const results = await Promise.all(
      ids.map(id => updateProduct(id, { ...updates, id }))
    );

    const success = results.every(r => r.success);
    return {
      success,
      results: results.map((r, i) => ({ id: ids[i], success: r.success, error: r.error }))
    };
  } catch (error: any) {
    console.error('Error in bulk update:', error);
    return { success: false, error: error.message };
  }
}
export async function deleteProduct(id: string) {
  try {
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Eliminar producto (las relaciones se eliminan en cascada)
    await prisma.product.delete({
      where: { id }
    });

    revalidatePath('/[lang]/dashboard/products', 'page');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar stock de un producto o variante de forma rápida
 */
export async function updateProductStock(productId: string, variantIndex: number, newStock: number, isVariant: boolean) {
  try {
    if (isVariant) {
      // Obtener el producto para saber qué variante actualizar
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: { orderBy: { createdAt: 'asc' } } }
      });

      if (!product || !product.variants[variantIndex]) {
        throw new Error('Variant not found');
      }

      const variant = product.variants[variantIndex];
      await prisma.variant.update({
        where: { id: variant.id },
        data: { stock: newStock }
      });
    } else {
      // Actualizar variante por defecto o crear una si no existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true }
      });

      if (!product) throw new Error('Product not found');

      if (product.variants.length > 0) {
        await prisma.variant.update({
          where: { id: product.variants[0].id },
          data: { stock: newStock }
        });
      } else {
        // Crear variante básica
        await prisma.variant.create({
          data: {
            productId,
            name: 'Básico',
            price: 0,
            stock: newStock
          }
        });
      }
    }

    revalidatePath('/[lang]/dashboard/products', 'page');
    revalidatePath('/[lang]/dashboard/stock', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating stock action:', error);
    return { success: false, error: error.message };
  }
}

// ========== FUNCIONES DE BÚSQUEDA ==========

/**
 * Buscar productos
 */
export async function searchProducts(
  query: string,
  locale: string = 'es',
  limit: number = 10,
  page: number = 1
) {
  try {
    if (!query || query.trim() === '') {
      return { query: '', count: 0, total: 0, products: [] };
    }

    const searchQuery = query.trim();
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
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
      query: searchQuery,
      count: transformedProducts.length,
      total,
      page,
      pageCount: Math.ceil(total / limit),
      products: transformedProducts
    };
  } catch (error: any) {
    console.error('Error searching products:', error);
    return { query: '', count: 0, total: 0, products: [] };
  }
}

/**
 * Obtener sugerencias de búsqueda
 */
export async function getSearchSuggestions(
  query: string,
  locale: string = 'es',
  limit: number = 5
) {
  try {
    if (!query || query.trim() === '') {
      return { query: '', suggestions: [] };
    }

    const searchQuery = query.trim();

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          translations: {
            some: {
              locale,
              name: { contains: searchQuery, mode: 'insensitive' }
            }
          }
        },
        take: limit,
        include: {
          translations: {
            where: { locale },
            select: {
              name: true
            }
          },
          images: true
        }
      }),
      prisma.category.findMany({
        where: {
          translations: {
            some: {
              locale,
              name: { contains: searchQuery, mode: 'insensitive' }
            }
          }
        },
        take: limit,
        include: {
          translations: {
            where: { locale },
            select: {
              name: true
            }
          }
        }
      })
    ]);

    const suggestions = [
      ...products.map(product => {
        const translation = product.translations[0] || {};
        return {
          type: 'product' as const,
          name: translation.name,
          slug: product.slug,
          url: `/products/${product.slug}`
        };
      }),
      ...categories.map(category => {
        const translation = category.translations[0] || {};
        return {
          type: 'category' as const,
          name: translation.name,
          slug: category.slug,
          url: `/category/${category.slug}`
        };
      })
    ];

    return {
      query: searchQuery,
      suggestions: suggestions.slice(0, limit)
    };
  } catch (error: any) {
    console.error('Error getting search suggestions:', error);
    return { query: '', suggestions: [] };
  }
}

// ========== FUNCIONES DE AUDITORÍA ==========

/**
 * Obtener productos sin categorías
 */
export async function getUncategorizedProducts(locale: string = 'es') {
  try {
    const products = await prisma.product.findMany({
      where: {
        categories: {
          none: {}
        }
      },
      include: {
        translations: {
          where: { locale },
          select: {
            name: true,
            description: true
          }
        },
        images: true
      }
    });

    return products.map(product => {
      const translation = product.translations[0] || {};
      return {
        ...product,
        name: translation.name,
        description: translation.description
      };
    });
  } catch (error) {
    console.error('Error getting uncategorized products:', error);
    return [];
  }
}

/**
 * Obtener productos con bajo stock
 */
export async function getLowStockProducts(threshold: number = 3, locale: string = 'es') {
  try {
    const products = await prisma.product.findMany({
      where: {
        variants: {
          some: {
            stock: { lt: threshold }
          }
        }
      },
      include: {
        translations: {
          where: { locale },
          select: {
            name: true
          }
        },
        variants: true,
        images: true
      }
    });

    return products.map(product => {
      const translation = product.translations[0] || {};
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

      return {
        ...product,
        name: translation.name,
        totalStock
      };
    });
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
}

/**
 * Obtener productos sin imágenes
 */
export async function getProductsWithoutImages(locale: string = 'es') {
  try {
    const products = await prisma.product.findMany({
      where: {
        images: {
          none: {}
        }
      },
      include: {
        translations: {
          where: { locale },
          select: {
            name: true
          }
        }
      }
    });

    return products.map(product => {
      const translation = product.translations[0] || {};
      return {
        ...product,
        name: translation.name
      };
    });
  } catch (error) {
    console.error('Error getting products without images:', error);
    return [];
  }
}

// ========== FUNCIONES DE MIGRACIÓN ==========

/**
 * Migrar producto desde Strapi
 */
export async function migrateProductFromStrapi(strapiData: any) {
  try {
    const {
      id: strapiId,
      documentId,
      attributes
    } = strapiData;

    // Extraer datos de Strapi
    const {
      slug,
      productNumber,
      brand,
      year,
      condition = 'new',
      size,
      material,
      accessories,
      technicalDetails,
      categories: strapiCategories,
      images: strapiImages,
      variants: strapiVariants,
      saleInfo: strapiSaleInfo,
      name,
      description,
      shortDescription,
      locale = 'es',
      localizations = []
    } = attributes;

    // Preparar traducciones
    const translations = [
      {
        locale,
        name,
        description,
        shortDescription
      },
      ...localizations.map((loc: any) => ({
        locale: loc.locale,
        name: loc.name,
        description: loc.description,
        shortDescription: loc.shortDescription
      }))
    ];

    // Preparar categorías
    const categoryIds = strapiCategories?.data?.map((cat: any) => cat.id) || [];

    // Preparar variantes
    const variants = strapiVariants?.map((variant: any) => ({
      name: variant.name || 'Default',
      sku: variant.sku,
      price: variant.price || 0,
      stock: variant.stock || 0,
      attributes: variant.attributes
    })) || [];

    // Preparar información de venta
    const saleInfo = strapiSaleInfo ? {
      onSale: strapiSaleInfo.onSale || false,
      salePrice: strapiSaleInfo.salePrice,
      saleStart: strapiSaleInfo.saleStart ? new Date(strapiSaleInfo.saleStart) : undefined,
      saleEnd: strapiSaleInfo.saleEnd ? new Date(strapiSaleInfo.saleEnd) : undefined
    } : undefined;

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
        accessories,
        technicalDetails,
        // Relaciones
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
        } : undefined,
        // Metadata
        aiGenerated: attributes.aiGenerated || false,
        lastAiUpdate: attributes.lastAiUpdate ? new Date(attributes.lastAiUpdate) : undefined,
        manualsIndexed: attributes.manualsIndexed || false
      },
      include: {
        translations: true,
        categories: true,
        variants: true,
        saleInfo: true
      }
    });

    return { success: true, data: product, strapiId };
  } catch (error: any) {
    console.error('Error migrating product:', error);
    return { success: false, error: error.message, strapiId: strapiData.id };
  }
}

/**
 * Actualizar una traducción específica por IA
 */
export async function updateAIDescription(id: string, locale: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        translations: {
          upsert: {
            where: { productId_locale: { productId: id, locale } },
            update: {
              name: data.name,
              description: data.description,
              shortDescription: data.shortDescription || data.description?.substring(0, 197) + '...'
            },
            create: {
              locale,
              name: data.name || '',
              description: data.description,
              shortDescription: data.shortDescription || data.description?.substring(0, 197) + '...'
            }
          }
        },
        aiGenerated: true,
        lastAiUpdate: new Date()
      }
    });

    revalidatePath('/[lang]/dashboard/products', 'page');
    revalidatePath(`/[lang]/dashboard/products/${id}`, 'page');

    return { success: true, data: product };
  } catch (error: any) {
    console.error('Error updating AI description:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar masivamente traducciones por IA
 */
export async function bulkUpdateAIDescriptions(updates: any[]) {
  try {
    const results = await Promise.all(
      updates.map(u => updateAIDescription(u.id, u.language, u.data))
    );

    return { success: results.every(r => r.success), results };
  } catch (error: any) {
    console.error('Error in bulk AI update:', error);
    return { success: false, error: error.message };
  }
}
// ========== FUNCIONES DE MANTENIMIENTO ==========

/**
 * Detectar productos con problemas de estructura
 */
export async function getProductsWithStructureIssues(locale: string = 'es') {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        translations: {
          where: { locale },
          select: { name: true }
        }
      }
    });

    return products
      .map(p => {
        const issues = [];
        // Problema 1: Sin variants
        if (!p.variants || p.variants.length === 0) {
          issues.push('missing_variants');
        }
        // Problema 2: Variants sin SKU
        else if (p.variants.some(v => !v.sku)) {
          issues.push('missing_sku');
        }

        if (issues.length === 0) return null;

        const translation = p.translations[0] || {};
        return {
          id: p.id,
          documentId: p.id,
          name: translation.name || p.slug,
          issues,
          variants: p.variants
        };
      })
      .filter(p => p !== null);
  } catch (error) {
    console.error('Error finding structure issues:', error);
    return [];
  }
}

/**
 * Corregir estructura de un producto
 */
export async function fixProductStructure(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (!product) throw new Error('Product not found');

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const skuBase = `FIX-${timestamp}-${random}`;

    // Caso 1: No tiene variants -> Crear default
    if (!product.variants || product.variants.length === 0) {
      await prisma.variant.create({
        data: {
          productId: id,
          name: 'Default',
          sku: skuBase,
          price: 0,
          stock: 0
        }
      });
      return { success: true, message: 'Created default variant' };
    }

    // Caso 2: Variants sin SKU -> Generar SKUs
    const variantsWithoutSku = product.variants.filter(v => !v.sku);
    if (variantsWithoutSku.length > 0) {
      await Promise.all(variantsWithoutSku.map((v, i) =>
        prisma.variant.update({
          where: { id: v.id },
          data: { sku: `${skuBase}-${i}` }
        })
      ));
      return { success: true, message: `Fixed SKUs for ${variantsWithoutSku.length} variants` };
    }

    return { success: true, message: 'No structure issues found to fix' };
  } catch (error: any) {
    console.error('Error fixing structure:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener productos para auditoría del catálogo
 */
export async function getAuditProducts(issueType: string, locale: string = 'es') {
  try {
    let where: any = {};

    switch (issueType) {
      case 'missing_description':
        where = {
          translations: {
            some: {
              locale,
              OR: [
                { description: null },
                { description: '' }
              ]
            }
          }
        };
        break;

      case 'uncategorized':
        where = {
          categories: {
            none: {}
          }
        };
        break;

      case 'missing_images':
        where = {
          images: {
            none: {}
          }
        };
        break;

      case 'low_stock':
        where = {
          variants: {
            some: {
              stock: { lt: 3 }
            }
          }
        };
        break;

      case 'structure_issues':
        const structureIssues = await getProductsWithStructureIssues(locale);
        return structureIssues;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        translations: {
          where: { locale },
          select: { name: true, description: true }
        },
        variants: true
      }
    });

    return products.map(p => {
      const translation = p.translations[0] || {};
      return {
        ...p,
        name: translation.name,
        description: translation.description
      };
    });

  } catch (error) {
    console.error('Error auditing products:', error);
    return [];
  }
}

const COLLECTION_NAME = 'product_manuals';
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);
    startIndex += (chunkSize - overlap);
    if (endIndex === text.length) break;
  }

  return chunks;
}

/**
 * Index product manuals
 */
export async function indexProductManuals(id: string) {
  try {
    // 1. Get product and manuals
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true // En Prisma, 'images' contiene todos los Media (incluyendo PDFs)
      }
    });

    if (!product) throw new Error('Product not found');

    // Filtrar solo PDFs (manuales)
    const manuals = product.images.filter(img =>
      img.mimeType === 'application/pdf' ||
      img.url.toLowerCase().endsWith('.pdf')
    );

    if (manuals.length === 0) {
      throw new Error('No manuals to index');
    }

    // Ensure collection exists
    const collectionInfo = await getCollectionInfo(COLLECTION_NAME);
    if (!collectionInfo) {
      await createCollection(COLLECTION_NAME);
    }

    // 2. Process each manual
    for (const manual of manuals) {
      // En Prisma, 'url' es una ruta local como '/uploads/...' o una URL completa
      let buffer: Buffer;

      if (manual.url.startsWith('http')) {
        const response = await fetch(manual.url);
        if (!response.ok) throw new Error(`Failed to fetch manual: ${manual.name}`);
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        // Ruta local
        const filePath = join(process.cwd(), 'public', manual.url);
        buffer = await readFile(filePath);
      }

      // Extract text using pdf-parse via server utility
      const data = await parsePdf(buffer);
      const text = data.text;

      // Chunk text
      const textChunks = chunkText(text);

      // Generate embeddings and index each chunk
      const points = [];
      for (let i = 0; i < textChunks.length; i++) {
        const chunkTextCont = textChunks[i];
        const embedding = await generateEmbedding(chunkTextCont);

        points.push({
          id: `${id}_${manual.id}_chunk_${i}`,
          vector: embedding,
          payload: {
            productId: id,
            chunkIndex: i,
            text: chunkTextCont,
            fileName: manual.name,
          },
        });
      }

      // Index chunks
      if (points.length > 0) {
        await indexDocument(COLLECTION_NAME, points);
      }
    }

    // 3. Mark as indexed in DB
    await prisma.product.update({
      where: { id },
      data: {
        manualsIndexed: true,
        lastAiUpdate: new Date(),
      },
    });

    revalidatePath(`/[lang]/dashboard/products/${id}`, 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error indexing manuals:', error);
    return { success: false, error: error.message };
  }
}
