import { fetchData } from "@/lib/strapi";
import BlockRenderer from "@/components/blocks/BlockRenderer";

async function getPageData(slug: string) {
  try {
    const data = await fetchData("pages", {
      filters: { slug: { $eq: slug } },
      populate: {
        blocks: {
          populate: "*",
        },
      },
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

  return (
    <main className="min-h-screen">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
