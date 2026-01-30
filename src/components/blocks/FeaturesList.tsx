import React from 'react';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

interface FeaturesListProps {
    features: Feature[];
}

export default function FeaturesList({ features }: FeaturesListProps) {
    if (!features || features.length === 0) return null;

    return (
        <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-5 md:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 text-xl md:text-2xl">
                                <span>{feature.icon || '✓'}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-[#003366] dark:text-white">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
