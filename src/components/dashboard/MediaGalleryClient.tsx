'use client';

import { useState } from 'react';
import { deleteMedia, updateMedia } from '@/actions/media-actions';
import { Trash, Edit2, X, Save } from 'lucide-react';
import MediaUpload from './MediaUpload';
import Image from 'next/image';

interface MediaGalleryClientProps {
    initialMedia: any[];
}

export default function MediaGalleryClient({ initialMedia }: MediaGalleryClientProps) {
    const [media, setMedia] = useState(initialMedia);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ altText: '', name: '' });

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

        const result = await deleteMedia(id);
        if (result.success) {
            setMedia(media.filter(m => m.id !== id));
        } else {
            alert('Error al eliminar: ' + result.error);
        }
    };

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditForm({ altText: item.altText || '', name: item.name || '' });
    };

    const saveEdit = async (id: string) => {
        const result = await updateMedia(id, editForm);
        if (result.success && result.data) {
            setMedia(media.map(m => m.id === id ? result.data : m));
            setEditingId(null);
        } else {
            alert('Error al actualizar: ' + result.error);
        }
    };

    const handleUploadComplete = (uploadedMedia: any[]) => {
        setMedia([...uploadedMedia, ...media]);
    };

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Subir Nuevas Imágenes</h2>
                <MediaUpload onUploadComplete={handleUploadComplete} />
            </div>

            {/* Gallery Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Biblioteca ({media.length} {media.length === 1 ? 'imagen' : 'imágenes'})
                </h2>

                {media.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No hay imágenes en la biblioteca</p>
                        <p className="text-sm mt-2">Sube tu primera imagen usando el formulario de arriba</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {media.map((item) => (
                            <div
                                key={item.id}
                                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all"
                            >
                                {/* Image */}
                                <Image
                                    src={item.url}
                                    alt={item.altText || item.name}
                                    fill
                                    className="object-cover"
                                />

                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => startEdit(item)}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                    <p className="text-white text-xs truncate">{item.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Editar Imagen</h3>
                            <button
                                onClick={() => setEditingId(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre del Archivo</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Texto Alternativo (Alt)</label>
                                <input
                                    type="text"
                                    value={editForm.altText}
                                    onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                                    placeholder="Descripción de la imagen para accesibilidad"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => saveEdit(editingId)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Guardar
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
