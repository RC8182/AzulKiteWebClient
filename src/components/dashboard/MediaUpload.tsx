'use client';

import { useState, useCallback } from 'react';
import { uploadFiles } from '@/actions/media-actions';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface MediaUploadProps {
    onUploadComplete?: (media: any[]) => void;
    maxFiles?: number;
}

export default function MediaUpload({ onUploadComplete, maxFiles = 10 }: MediaUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ name: string; status: 'uploading' | 'success' | 'error'; error?: string }[]>([]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) return;

        await uploadFilesHandler(files.slice(0, maxFiles));
    }, [maxFiles]);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        await uploadFilesHandler(files.slice(0, maxFiles));
        e.target.value = ''; // Reset input
    };

    const uploadFilesHandler = async (files: File[]) => {
        setUploading(true);
        setUploadProgress(files.map(f => ({ name: f.name, status: 'uploading' })));

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const result = await uploadFiles(formData);

            if (result.success && result.data) {
                setUploadProgress(files.map(f => ({ name: f.name, status: 'success' })));
                onUploadComplete?.(result.data);

                // Clear progress after 2 seconds
                setTimeout(() => {
                    setUploadProgress([]);
                }, 2000);
            } else {
                setUploadProgress(files.map(f => ({ name: f.name, status: 'error', error: result.error })));
            }
        } catch (error: any) {
            setUploadProgress(files.map(f => ({ name: f.name, status: 'error', error: error.message })));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                    ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
                    ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-blue-400'}
                `}
            >
                <div className="flex flex-col items-center gap-3 relative z-0">
                    <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div>
                        <p className="text-lg font-medium">
                            {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            PNG, JPG, GIF, WEBP, SVG hasta 10MB (máx. {maxFiles} archivos)
                        </p>
                    </div>
                </div>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                />
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
                <div className="space-y-2">
                    {uploadProgress.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {file.status === 'uploading' && (
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {file.status === 'success' && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {file.status === 'error' && (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                {file.error && (
                                    <p className="text-xs text-red-500">{file.error}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
