import React from 'react';

interface TextBlockProps {
    title?: string;
    content: string;
    showTitle?: boolean;
}

export default function TextBlock({ title, content, showTitle = true }: TextBlockProps) {
    return (
        <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                {showTitle && title && (
                    <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-8 text-center">
                        {title}
                    </h1>
                )}
                <div 
                    className="text-gray-700 space-y-4"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </section>
    );
}