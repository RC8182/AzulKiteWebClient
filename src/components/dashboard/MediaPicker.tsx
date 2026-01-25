'use client';

import { useState, useEffect } from 'react';
import { getMediaList } from '@/actions/media-actions';
import { X, Check } from 'lucide-react';
import MediaUpload from './MediaUpload';
import Image from 'next/image';

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: any) => void;
    multiple?: boolean;
}

export default function MediaPicker({ isOpen, onClose, onSelect, multiple = false }: MediaPickerProps) {
    const [media, setMedia] = useState<any[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadMedia();
        }
    }, [isOpen]);

    const loadMedia = async () => {
        setLoading(true);
        const result = await getMediaList({ limit: 100 });
        if (result.success) {
            setMedia(result.data);
        }
        setLoading(false);
    };

    const handleSelect = (item: any) => {
        if (multiple) {
            const newSelected = new Set(selected);
            if (newSelected.has(item.id)) {
                newSelected.delete(item.id);
            } else {
                newSelected.add(item.id);
            }
            setSelected(newSelected);
        } else {
            onSelect(item);
            onClose();
        }
    };

    const handleConfirmMultiple = () => {
        const selectedMedia = media.filter(m => selected.has(m.id));
        onSelect(selectedMedia);
        onClose();
    };

    const handleUploadComplete = (uploadedMedia: any[]) => {
        setMedia([...uploadedMedia, ...media]);
        if (!multiple && uploadedMedia.length > 0) {
            // Automatically select the first uploaded image and close
            handleSelect(uploadedMedia[0]);
        } else {
            setActiveTab('library');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Seleccionar Imagen</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'library'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Biblioteca
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'upload'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Subir Nuevas
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'library' && (
                        <>
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : media.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No hay imágenes en la biblioteca</p>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className="mt-4 text-blue-600 hover:underline"
                                    >
                                        Subir tu primera imagen
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {media.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className={`
                                                relative aspect-square rounded-lg overflow-hidden cursor-pointer
                                                border-2 transition-all hover:scale-105
                                                ${selected.has(item.id) ? 'border-blue-500 ring-2 ring-blue-500' : 'border-transparent hover:border-gray-300'}
                                            `}
                                        >
                                            <Image
                                                src={item.url}
                                                alt={item.altText || item.name}
                                                fill
                                                className="object-cover"
                                            />
                                            {selected.has(item.id) && (
                                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'upload' && (
                        <MediaUpload onUploadComplete={handleUploadComplete} />
                    )}
                </div>

                {/* Footer */}
                {multiple && selected.size > 0 && (
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600">
                            {selected.size} imagen{selected.size !== 1 ? 'es' : ''} seleccionada{selected.size !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={handleConfirmMultiple}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Confirmar Selección
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
