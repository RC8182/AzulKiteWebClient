import { useState } from 'react';
import { Plus } from 'lucide-react';
import BlockEditorItem from './BlockEditorItem';

interface BlockManagerProps {
    blocks: any[];
    onChange: (blocks: any[]) => void;
    activeLocale: string;
}

export default function BlockManager({ blocks, onChange, activeLocale }: BlockManagerProps) {
    const handleAddBlock = (type: string) => {
        const newBlock = {
            type,
            config: {},
            translations: [
                { locale: 'es', content: {} },
                { locale: 'en', content: {} },
                { locale: 'it', content: {} }
            ]
        };
        onChange([...blocks, newBlock]);
    };

    const handleUpdateBlock = (index: number, updatedBlock: any) => {
        const newBlocks = [...blocks];
        newBlocks[index] = updatedBlock;
        onChange(newBlocks);
    };

    const handleRemoveBlock = (index: number) => {
        onChange(blocks.filter((_, i) => i !== index));
    };

    const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        onChange(newBlocks);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Bloques de Contenido</h3>

            <div className="space-y-2">
                {blocks.map((block, index) => (
                    <BlockEditorItem
                        key={index}
                        index={index}
                        block={block}
                        activeLocale={activeLocale}
                        onChange={handleUpdateBlock}
                        onRemove={handleRemoveBlock}
                        onMove={handleMoveBlock}
                    />
                ))}
            </div>

            {blocks.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500">
                    No hay bloques añadidos.
                </div>
            )}

            <div className="flex gap-2 justify-center pt-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => handleAddBlock('hero')}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Hero
                </button>
                <button
                    type="button"
                    onClick={() => handleAddBlock('rich-text')}
                    className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded border border-purple-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Rich Text
                </button>
                <button
                    type="button"
                    onClick={() => handleAddBlock('hero-slider')}
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Hero Slider
                </button>
                <button
                    type="button"
                    onClick={() => handleAddBlock('banner-grid')}
                    className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded border border-green-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Banner Grid
                </button>
                <button
                    type="button"
                    onClick={() => handleAddBlock('product-grid')}
                    className="flex items-center gap-1 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded border border-orange-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Product Grid
                </button>
                <button
                    type="button"
                    onClick={() => handleAddBlock('info-block')}
                    className="flex items-center gap-1 px-3 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded border border-teal-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Info Block
                </button>
                <button
                    type="button"
                    onClick={() => handleAddBlock('scrolling-banner')}
                    className="flex items-center gap-1 px-3 py-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded border border-pink-200 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Scrolling Banner
                </button>
            </div>
        </div>
    );
}
