import React from 'react';

interface FAQ {
    question: string;
    answer: string;
}

interface FaqSectionProps {
    faqs: FAQ[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-12 container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-black text-center mb-12 uppercase italic tracking-tighter text-[#003366] dark:text-white">
                    Preguntas Frecuentes
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <details key={idx} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                <span className="font-bold text-lg text-[#003366] dark:text-white">{faq.question}</span>
                                <span className="transition-transform group-open:rotate-180 text-blue-500">▼</span>
                            </summary>
                            <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 leading-relaxed">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
