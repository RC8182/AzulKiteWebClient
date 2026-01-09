'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    images?: any[];
    onImagesChange: (files: File[]) => void;
    onRemoveExisting?: (imageId: number) => void;
}

export default function ImageUploader({
    images = [],
    onImagesChange,
    onRemoveExisting
}: ImageUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));

            setSelectedFiles(prev => [...prev, ...newFiles]);
            setPreviews(prev => [...prev, ...newPreviews]);

            onImagesChange([...selectedFiles, ...newFiles]);
        }
    };

    const removeSelected = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        // Revoke object URL to avoid memory leaks
        URL.revokeObjectURL(previews[index]);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        onImagesChange(newFiles);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Imágenes</label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {images?.map((img: any) => {
                    const attrs = img.attributes || img;
                    const thumbnailUrl = attrs.formats?.thumbnail?.url || attrs.url;

                    return (
                        <div key={img.id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${thumbnailUrl}`}
                                alt="Product"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveExisting?.(img.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                {/* New Previews */}
                {previews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={preview}
                            alt="New upload"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeSelected(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded badge">New</div>
                    </div>
                ))}

                {/* Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Subir Imágenes</span>
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
