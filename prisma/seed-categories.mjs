import { PrismaClient } from '@prisma/client';
import { CATEGORY_HIERARCHY, CATEGORY_TRANSLATIONS } from '../../wordpressProductsImport/config/config.mjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed: Initializing Categories...');

    // 1. Identify all canonical slugs from translations
    const slugs = Object.keys(CATEGORY_TRANSLATIONS);

    // 2. Create categories in order of hierarchy (parents first)
    // We can just iterate multiple times or sort by dependency
    const created = new Set();
    let remaining = [...slugs];

    while (remaining.length > 0) {
        const startLen = remaining.length;
        const toProcess = [];
        const nextRemaining = [];

        for (const slug of remaining) {
            const parentSlug = CATEGORY_HIERARCHY[slug];
            if (!parentSlug || created.has(parentSlug)) {
                toProcess.push(slug);
            } else {
                nextRemaining.push(slug);
            }
        }

        for (const slug of toProcess) {
            console.log(`- ${slug}`);
            const parentSlug = CATEGORY_HIERARCHY[slug];
            let parentId = null;

            if (parentSlug) {
                const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
                parentId = parent?.id || null;
            }

            const translations = CATEGORY_TRANSLATIONS[slug];

            await prisma.category.upsert({
                where: { slug },
                update: {
                    parentId: parentId
                },
                create: {
                    slug,
                    parentId: parentId,
                    translations: {
                        create: Object.entries(translations).map(([locale, name]) => ({
                            locale,
                            name
                        }))
                    }
                }
            });

            // Ensure translations exist if upsert skipped creation
            for (const [locale, name] of Object.entries(translations)) {
                const cat = await prisma.category.findUnique({ where: { slug } });
                await prisma.categoryTranslation.upsert({
                    where: { categoryId_locale: { categoryId: cat.id, locale } },
                    update: { name },
                    create: { categoryId: cat.id, locale, name }
                });
            }

            created.add(slug);
        }

        remaining = nextRemaining;
        if (remaining.length === startLen && startLen > 0) {
            console.error('Circular dependency detected in CATEGORY_HIERARCHY or missing parents!');
            break;
        }
    }

    console.log('Seed: Categories finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
