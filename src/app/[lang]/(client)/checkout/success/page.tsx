import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { getDictionary } from '../db';

interface SuccessPageProps {
    params: Promise<{ lang: string }>;
}

export default function SuccessPage({ params }: SuccessPageProps) {
    const { lang } = use(params);
    const dict = getDictionary(lang).success;

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full p-10 text-center bg-white shadow-2xl rounded-[2.5rem] border border-gray-100">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
                        <CheckCircle2 size={56} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tight">
                            {dict.title}
                        </h1>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            {dict.description}
                        </p>
                    </div>
                    <Link
                        href={`/${lang}`}
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-14 text-lg flex items-center justify-center rounded-full transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        {dict.back}
                    </Link>
                </div>
            </div>
        </main>
    );
}
