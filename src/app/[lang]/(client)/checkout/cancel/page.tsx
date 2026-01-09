import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full p-10 text-center bg-white shadow-2xl rounded-[2.5rem] border border-gray-100">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                        <XCircle size={56} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tight">
                            Pago Cancelado
                        </h1>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold h-14 text-lg flex items-center justify-center rounded-full transition-all border-2 border-transparent hover:border-[#003366]"
                    >
                        Reintentar Compra
                    </Link>
                </div>
            </div>
        </main>
    );
}
