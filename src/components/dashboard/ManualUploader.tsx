'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, Database } from 'lucide-react';
import { indexProductManuals } from '@/actions/product-actions';

interface ManualUploaderProps {
    productId?: string;
    manuals?: any[];
    manualsIndexed?: boolean;
    onManualsChange: (files: File[]) => void;
    onRemoveExisting?: (manualId: number) => void;
}

export default function ManualUploader({
    productId,
    manuals = [],
    manualsIndexed = false,
    onManualsChange,
    onRemoveExisting
}: ManualUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isIndexing, setIsIndexing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            onManualsChange([...selectedFiles, ...newFiles]);
        }
    };

    const removeSelected = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onManualsChange(newFiles);
    };

    const handleIndexManuals = async () => {
        if (!productId) return;
        setIsIndexing(true);
        try {
            await indexProductManuals(productId);
            window.location.reload(); // Refresh to update status
        } catch (error) {
            alert('Error indexing manuals: ' + error);
        } finally {
            setIsIndexing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Manuales Técnicos (PDF)</label>
                {productId && manuals.length > 0 && (
                    manualsIndexed ? (
                        <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                            <CheckCircle className="w-4 h-4" /> Indexado
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleIndexManuals}
                            disabled={isIndexing}
                            className="flex items-center gap-1 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
                        >
                            <Database className="w-4 h-4" />
                            {isIndexing ? 'Indexando...' : 'Indexar Ahora'}
                        </button>
                    )
                )}
            </div>

            <div className="space-y-3">
                {/* Existing Manuals */}
                {manuals?.map((manual: any) => (
                    <div key={manual.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-600 rounded">
                                <FileText className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{manual.attributes?.name || manual.name}</p>
                                <p className="text-xs text-gray-500">{((manual.attributes?.size || manual.size || 0) / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemoveExisting?.(manual.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {/* New Files */}
                {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-600 rounded">
                                <FileText className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-blue-500 dark:text-blue-300">New</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeSelected(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {/* Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500"
                >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Adjuntar PDF</span>
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".pdf"
                className="hidden"
            />
        </div>
    );
}
