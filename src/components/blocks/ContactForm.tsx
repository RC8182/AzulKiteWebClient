import React from 'react';

interface ContactFormProps {
    title?: string;
}

export default function ContactForm({ title }: ContactFormProps) {
    return (
        <section className="py-12 container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#003366] dark:text-white">
                    {title || 'Contáctanos'}
                </h2>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Asunto"
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <textarea
                        placeholder="Mensaje"
                        rows={4}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    ></textarea>
                    <button className="w-full bg-[#0051B5] text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Enviar Mensaje
                    </button>
                </form>
            </div>
        </section>
    );
}
