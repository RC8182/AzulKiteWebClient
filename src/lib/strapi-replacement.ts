import { prisma } from './prisma';

// Replacement for Strapi fetchData function
export async function fetchData(
  collection: string,
  options?: {
    filters?: Record<string, any>;
    locale?: string;
    populate?: any;
  }
) {
  const { filters, locale = 'es', populate } = options || {};

  try {
    switch (collection) {
      case 'pages': {
        const where: any = {};

        if (filters?.slug?.$eq) {
          where.slug = filters.slug.$eq;
        }

        const pages = await prisma.page.findMany({
          where,
          include: {
            translations: {
              where: { locale },
              select: {
                title: true,
                content: true,
              }
            },
            blocks: {
              include: {
                translations: {
                  where: { locale },
                  select: {
                    content: true,
                  }
                }
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        });

        return {
          data: (pages as any[]).map(page => ({
            id: page.id,
            slug: page.slug,
            locale,
            ...page.translations[0],
            blocks: page.blocks.map(block => ({
              id: block.id,
              type: block.type,
              config: block.config,
              content: block.translations[0]?.content || {}
            }))
          }))
        };
      }

      case 'products': {
        const where: any = {};

        if (filters?.slug?.$eq) {
          where.slug = filters.slug.$eq;
        }

        const products = await prisma.product.findMany({
          where,
          include: {
            translations: {
              where: { locale },
              select: {
                name: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
              }
            },
            images: {
              include: {
                media: true
              }
            },
            categories: {
              include: {
                category: {
                  include: {
                    translations: {
                      where: { locale },
                      select: { name: true }
                    }
                  }
                }
              }
            },
            variants: true
          }
        });

        return {
          data: (products as any[]).map(product => ({
            id: product.id,
            slug: product.slug,
            price: product.price,
            salePrice: product.salePrice,
            stock: product.stock,
            locale,
            ...product.translations[0],
            images: {
              data: product.images.map(img => ({
                id: img.media.id,
                attributes: {
                  url: img.media.url,
                  alternativeText: img.media.altText,
                  width: img.media.width,
                  height: img.media.height
                }
              }))
            },
            categories: {
              data: product.categories.map(cat => ({
                id: cat.category.id,
                attributes: {
                  name: cat.category.translations[0]?.name,
                  slug: cat.category.slug
                }
              }))
            }
          }))
        };
      }

      case 'categories': {
        const where: any = {};

        if (filters?.slug?.$eq) {
          where.slug = filters.slug.$eq;
        }

        const categories = await prisma.category.findMany({
          where,
          include: {
            translations: {
              where: { locale },
              select: {
                name: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
              }
            },
            children: {
              include: {
                translations: {
                  where: { locale },
                  select: { name: true }
                }
              }
            }
          }
        });

        return {
          data: (categories as any[]).map(category => ({
            id: category.id,
            slug: category.slug,
            locale,
            ...category.translations[0],
            children: {
              data: category.children.map(child => ({
                id: child.id,
                attributes: {
                  name: child.translations[0]?.name,
                  slug: child.slug
                }
              }))
            }
          }))
        };
      }

      case 'global': {
        // Use findMany and take 1 to avoid potential findFirst payload issues with some prisma versions/adapters
        const globalConfigs = await prisma.globalConfig.findMany({
          take: 1,
          include: {
            translations: {
              where: { locale },
              select: {
                siteName: true,
                footerText: true,
                metaTitle: true,
                metaDescription: true,
              }
            }
          }
        });
        const globalConfig = globalConfigs[0];

        const translation = (globalConfig as any)?.translations[0];

        return {
          data: {
            siteName: translation?.siteName || 'Azul Kiteboarding',
            footerText: translation?.footerText || 'La mejor tienda y escuela de kitesurf.',
            ...translation
          }
        };
      }

      default:
        throw new Error(`Collection ${collection} not supported`);
    }
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    return { data: [] };
  }
}