import { fetchData } from "@/lib/strapi";
import BlockRenderer from "@/components/blocks/BlockRenderer";

async function getPageData(slug: string, locale: string) {
  console.log(`[getPageData] Starting fetch for slug: ${slug}, locale: ${locale}`);
  try {
    // Skip irrelevant requests caught by the dynamic [lang] route
    if (locale === 'favicon.ico' || locale.includes('.')) return null;

    const data = await fetchData("pages", {
      filters: { slug: { $eq: slug } },
      locale,
      populate: {
        blocks: {
          on: {
            'blocks.hero-slider': {
              populate: {
                slides: {
                  populate: ['backgroundImage', 'buttons']
                }
              }
            },
            'blocks.banner-grid': {
              populate: {
                banners: {
                  populate: ['image', 'links']
                }
              }
            },
            'blocks.product-grid': {
              populate: {
                products: {
                  populate: '*'
                }
              }
            },
            'blocks.hero-section': {
              populate: ['backgroundImage', 'cta']
            },
            'blocks.info-block': {
              populate: '*'
            }
          }
        }
      }
    });

    console.log(`[getPageData] Response received. Found ${data?.data?.length || 0} items for slug: ${slug}`);

    if (data?.data?.length > 0) {
      console.log(`[getPageData] Page ID: ${data.data[0].id}, DocumentID: ${data.data[1]?.documentId || data.data[0].documentId}`);
    }

    return data?.data?.[0];
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

interface HomeProps {
  params: Promise<{ lang: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { lang } = await params;
  const page = await getPageData("home", lang);

  if (!page) {
    // Basic fallback UI if no data is found in Strapi
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-24 bg-[var(--color-primary)] text-white">
        <h1 className="text-6xl font-bold mb-4">Azul Kiteboarding</h1>
        <p className="text-2xl mb-8 opacity-80 underline underline-offset-8">Pronto en el agua...</p>
        <div className="bg-[var(--color-accent)] px-8 py-4 rounded-full font-bold text-xl shadow-xl animate-pulse">
          Sincronizando con Strapi
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
