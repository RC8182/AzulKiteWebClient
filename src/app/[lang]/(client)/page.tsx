import { fetchData } from "@/lib/strapi";
import BlockRenderer from "@/components/blocks/BlockRenderer";

async function getPageData(slug: string) {
  try {
    const data = await fetchData("pages", {
      filters: { slug: { $eq: slug } },
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
                  populate: ['image', 'link']
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
              populate: ['image']
            }
          }
        }
      }
    });

    return data?.data?.[0];
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

export default async function Home() {
  const page = await getPageData("home");

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

  const demoBlocks = [
    {
      __component: 'blocks.banner-grid',
      gridCols: 2,
      banners: [
        {
          id: 1,
          title: "Kites 2024",
          image: { url: "https://images.unsplash.com/photo-1544621932-9011933c02af?q=80&w=1000" },
          link: { href: "#", label: "Ver Colección" },
          columns: 1
        },
        {
          id: 2,
          title: "Tablas Foil",
          image: { url: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1000" },
          link: { href: "#", label: "Explorar Tablas" },
          columns: 1
        }
      ]
    },
    {
      __component: 'blocks.info-block',
      title: "Nuestra Filosofía",
      description: "<p>En Azul Kiteboarding no solo vendemos equipo, compartimos una forma de vida. Nuestra selección está curada por expertos con más de 15 años en el agua.</p><p>Ubicados en el corazón de la bahía, ofrecemos test de material y asesoramiento personalizado para que tu progresión sea imparable.</p>",
      image: { url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1000" },
      imagePosition: 'right'
    }
  ];

  const finalBlocks = page ? [...page.blocks, ...demoBlocks] : demoBlocks;

  return (
    <main className="min-h-screen">
      <BlockRenderer blocks={finalBlocks} />
    </main>
  );
}
