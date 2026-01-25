import { getMediaList } from '@/actions/media-actions';
import { getDictionary } from '@/components/dashboard/db';
import MediaGalleryClient from '@/components/dashboard/MediaGalleryClient';

export default async function MediaPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const dict = getDictionary(lang as any);
    const result = await getMediaList({ limit: 100 });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{dict.media || 'Galería de Medios'}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gestiona todas las imágenes y archivos multimedia
                </p>
            </div>

            <MediaGalleryClient initialMedia={result.data || []} />
        </div>
    );
}
