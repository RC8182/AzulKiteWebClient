import { useState } from 'react';
import { Trash, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import MediaPicker from './MediaPicker';

interface BlockRendererProps {
    block: any;
    index: number;
    onChange: (index: number, updatedBlock: any) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
    activeLocale: string;
}

export default function BlockEditorItem({ block, index, onChange, onRemove, onMove, activeLocale }: BlockRendererProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerField, setMediaPickerField] = useState<{ field: string, isConfig: boolean, index?: number, subIndex?: number } | null>(null);

    const handleContentChange = (field: string, value: any) => {
        const newBlock = { ...block };
        const transIndex = newBlock.translations.findIndex((t: any) => t.locale === activeLocale);

        if (transIndex === -1) {
            newBlock.translations.push({
                locale: activeLocale,
                content: { [field]: value }
            });
        } else {
            newBlock.translations[transIndex].content = {
                ...newBlock.translations[transIndex].content,
                [field]: value
            };
        }
        onChange(index, newBlock);
    };

    const handleConfigChange = (field: string, value: any) => {
        const newBlock = { ...block, config: { ...block.config, [field]: value } };
        onChange(index, newBlock);
    };

    const handleMediaSelect = (media: any) => {
        if (mediaPickerField) {
            const { field, isConfig, index: itemIndex, subIndex } = mediaPickerField;
            if (isConfig) {
                handleConfigChange(field, media.url);
            } else if (itemIndex !== undefined) {
                // Nested item update
                const items = [...(getContent(field) || [])];
                if (items[itemIndex]) {
                    items[itemIndex] = { ...items[itemIndex], image: media.url };
                    handleContentChange(field, items);
                }
            } else {
                handleContentChange(field, media.url);
            }
        }
        setShowMediaPicker(false);
        setMediaPickerField(null);
    };

    const getContent = (field: string) => {
        const trans = block.translations.find((t: any) => t.locale === activeLocale);
        return trans?.content?.[field] || '';
    };

    const openMediaPicker = (field: string, isConfig: boolean = false, itemIndex?: number) => {
        setMediaPickerField({ field, isConfig, index: itemIndex });
        setShowMediaPicker(true);
    };

    return (
        <>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mb-4">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <span className="font-medium uppercase text-sm tracking-wider">{block.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onMove(index, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30" title="Mover arriba">
                            <ArrowUp size={16} />
                        </button>
                        <button type="button" onClick={() => onMove(index, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30" title="Mover abajo">
                            <ArrowDown size={16} />
                        </button>
                        <button type="button" onClick={() => onRemove(index)} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Eliminar bloque">
                            <Trash size={16} />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-4 space-y-4">
                        {/* HERO */}
                        {block.type === 'hero' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título ({activeLocale})</label>
                                    <input
                                        type="text"
                                        value={getContent('title')}
                                        onChange={(e) => handleContentChange('title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Subtítulo ({activeLocale})</label>
                                    <textarea
                                        value={getContent('subtitle')}
                                        onChange={(e) => handleContentChange('subtitle', e.target.value)}
                                        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        rows={2}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Texto Botón</label>
                                        <input
                                            type="text"
                                            value={getContent('buttonText')}
                                            onChange={(e) => handleContentChange('buttonText', e.target.value)}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">URL Botón</label>
                                        <input
                                            type="text"
                                            value={getContent('buttonLink')}
                                            onChange={(e) => handleContentChange('buttonLink', e.target.value)}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                            placeholder="/products"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Imagen de Fondo (Global)</label>
                                    <div className="flex items-center gap-4">
                                        {block.config?.bgImage && (
                                            <div className="w-20 h-20 rounded border overflow-hidden">
                                                <img src={block.config.bgImage} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker('bgImage', true)}
                                            className="px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
                                        >
                                            {block.config?.bgImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RICH TEXT */}
                        {block.type === 'rich-text' && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Contenido HTML ({activeLocale})</label>
                                <textarea
                                    value={getContent('html')}
                                    onChange={(e) => handleContentChange('html', e.target.value)}
                                    className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 font-mono text-sm"
                                    rows={8}
                                />
                            </div>
                        )}

                        {/* SCROLLING BANNER */}
                        {block.type === 'scrolling-banner' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Velocidad</label>
                                        <input
                                            type="number"
                                            value={block.config?.speed || 30}
                                            onChange={(e) => handleConfigChange('speed', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Color Fondo</label>
                                        <input
                                            type="color"
                                            value={block.config?.backgroundColor || '#003366'}
                                            onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                            className="w-full h-10 p-1 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Items del Banner</label>
                                    <div className="space-y-2">
                                        {(getContent('items') || []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 border rounded bg-white">
                                                <div className="w-10 h-10 border rounded overflow-hidden shrink-0">
                                                    {item.image ? <img src={item.image} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-gray-100" />}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Texto"
                                                    value={item.text || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...(getContent('items') || [])];
                                                        newItems[idx].text = e.target.value;
                                                        handleContentChange('items', newItems);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-sm border-none focus:ring-0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => openMediaPicker('items', false, idx)}
                                                    className="p-1 text-gray-400 hover:text-blue-500"
                                                >
                                                    <ImageIcon size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newItems = (getContent('items') || []).filter((_: any, i: number) => i !== idx);
                                                        handleContentChange('items', newItems);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(getContent('items') || []), { text: '', image: '', link: '' }];
                                                handleContentChange('items', newItems);
                                            }}
                                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-100"
                                        >
                                            + Añadir Item
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INFO BLOCK */}
                        {block.type === 'info-block' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={getContent('title')}
                                        onChange={(e) => handleContentChange('title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción</label>
                                    <textarea
                                        value={getContent('description')}
                                        onChange={(e) => handleContentChange('description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 font-mono text-sm"
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Imagen</label>
                                        <div className="flex items-center gap-4">
                                            {getContent('image') && (
                                                <div className="w-16 h-16 rounded border overflow-hidden">
                                                    <img src={getContent('image')} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openMediaPicker('image', false)}
                                                className="px-3 py-2 bg-white border rounded text-sm"
                                            >
                                                Seleccionar
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Posición Imagen</label>
                                        <select
                                            value={block.config?.imagePosition || 'left'}
                                            onChange={(e) => handleConfigChange('imagePosition', e.target.value)}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <option value="left">Izquierda</option>
                                            <option value="right">Derecha</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRODUCT GRID */}
                        {block.type === 'product-grid' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={getContent('title')}
                                        onChange={(e) => handleContentChange('title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Modo</label>
                                        <select
                                            value={block.config?.mode || 'all'}
                                            onChange={(e) => handleConfigChange('mode', e.target.value)}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <option value="all">Ver Todos</option>
                                            <option value="category">Por Categoría</option>
                                            <option value="manual">Selección Manual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Layout</label>
                                        <select
                                            value={block.config?.layout || 'carousel'}
                                            onChange={(e) => handleConfigChange('layout', e.target.value)}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <option value="carousel">Carrusel</option>
                                            <option value="grid">Cuadrícula</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Límite</label>
                                        <input
                                            type="number"
                                            value={block.config?.limit || 8}
                                            onChange={(e) => handleConfigChange('limit', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            id={`showFilters-${index}`}
                                            checked={block.config?.showFilters !== false}
                                            onChange={(e) => handleConfigChange('showFilters', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`showFilters-${index}`} className="text-sm font-medium text-gray-700">Mostrar Filtros</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HERO SLIDER */}
                        {block.type === 'hero-slider' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`autoplay-${index}`}
                                            checked={block.config?.autoplay !== false}
                                            onChange={(e) => handleConfigChange('autoplay', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`autoplay-${index}`} className="text-sm font-medium text-gray-700">Autoplay</label>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Intervalo (ms)</label>
                                        <input
                                            type="number"
                                            value={block.config?.interval || 5000}
                                            onChange={(e) => handleConfigChange('interval', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Slides</label>
                                    <div className="space-y-4">
                                        {(getContent('slides') || []).map((slide: any, sIdx: number) => (
                                            <div key={sIdx} className="p-4 border rounded bg-white dark:bg-gray-900 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-400">Slide #{sIdx + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSlides = (getContent('slides') || []).filter((_: any, i: number) => i !== sIdx);
                                                            handleContentChange('slides', newSlides);
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="col-span-1">
                                                        <div className="aspect-video bg-gray-100 rounded border overflow-hidden relative cursor-pointer group" onClick={() => openMediaPicker('slides', false, sIdx)}>
                                                            {slide.backgroundImage ? (
                                                                <img src={slide.backgroundImage} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon size={20} />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                                                CAMBIAR
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Título"
                                                            value={slide.title || ''}
                                                            onChange={(e) => {
                                                                const newSlides = [...(getContent('slides') || [])];
                                                                newSlides[sIdx].title = e.target.value;
                                                                handleContentChange('slides', newSlides);
                                                            }}
                                                            className="w-full px-2 py-1 text-sm border rounded"
                                                        />
                                                        <textarea
                                                            placeholder="Descripción"
                                                            value={slide.description || ''}
                                                            onChange={(e) => {
                                                                const newSlides = [...(getContent('slides') || [])];
                                                                newSlides[sIdx].description = e.target.value;
                                                                handleContentChange('slides', newSlides);
                                                            }}
                                                            className="w-full px-2 py-1 text-xs border rounded"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Buttons editor for slide could be added here if needed */}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSlides = [...(getContent('slides') || []), { title: '', description: '', backgroundImage: '', buttons: [], textPosition: 'center' }];
                                                handleContentChange('slides', newSlides);
                                            }}
                                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-100"
                                        >
                                            + Añadir Slide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BANNER GRID */}
                        {block.type === 'banner-grid' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Columnas Grid (Desktop)</label>
                                    <select
                                        value={block.config?.gridCols || 2}
                                        onChange={(e) => handleConfigChange('gridCols', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    >
                                        <option value={1}>1 Columna</option>
                                        <option value={2}>2 Columnas</option>
                                        <option value={3}>3 Columnas</option>
                                        <option value={4}>4 Columnas</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Banners</label>
                                    <div className="space-y-4">
                                        {(getContent('banners') || []).map((banner: any, bIdx: number) => (
                                            <div key={bIdx} className="p-4 border rounded bg-white dark:bg-gray-900 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-400">Banner #{bIdx + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newBanners = (getContent('banners') || []).filter((_: any, i: number) => i !== bIdx);
                                                            handleContentChange('banners', newBanners);
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="col-span-1">
                                                        <div className="aspect-[4/3] bg-gray-100 rounded border overflow-hidden relative cursor-pointer group" onClick={() => openMediaPicker('banners', false, bIdx)}>
                                                            {banner.image ? (
                                                                <img src={banner.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon size={20} />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                                                CAMBIAR
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Título"
                                                            value={banner.title || ''}
                                                            onChange={(e) => {
                                                                const newBanners = [...(getContent('banners') || [])];
                                                                newBanners[bIdx].title = e.target.value;
                                                                handleContentChange('banners', newBanners);
                                                            }}
                                                            className="w-full px-2 py-1 text-sm border rounded"
                                                        />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="URL / Link"
                                                                value={banner.mainLink?.href || ''}
                                                                onChange={(e) => {
                                                                    const newBanners = [...(getContent('banners') || [])];
                                                                    newBanners[bIdx].mainLink = { ...(newBanners[bIdx].mainLink || {}), href: e.target.value };
                                                                    handleContentChange('banners', newBanners);
                                                                }}
                                                                className="w-full px-2 py-1 text-[10px] border rounded"
                                                            />
                                                            <select
                                                                value={banner.columns || 1}
                                                                onChange={(e) => {
                                                                    const newBanners = [...(getContent('banners') || [])];
                                                                    newBanners[bIdx].columns = parseInt(e.target.value);
                                                                    handleContentChange('banners', newBanners);
                                                                }}
                                                                className="w-full px-2 py-1 text-[10px] border rounded"
                                                            >
                                                                <option value={1}>1 Col</option>
                                                                <option value={2}>2 Cols</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newBanners = [...(getContent('banners') || []), { title: '', image: '', mainLink: { href: '', label: '' }, columns: 1 }];
                                                handleContentChange('banners', newBanners);
                                            }}
                                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-100"
                                        >
                                            + Añadir Banner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fallback para tipos desconocidos */}
                        {![
                            'hero', 'rich-text', 'scrolling-banner', 'info-block', 'product-grid',
                            'hero-slider', 'banner-grid'
                        ].includes(block.type) && (
                                <div className="text-sm text-gray-500 italic">
                                    Editor genérico para {block.type} no implementado.
                                </div>
                            )}
                    </div>
                )}
            </div>

            {/* Media Picker Modal */}
            <MediaPicker
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
                multiple={false}
            />
        </>
    );
}
