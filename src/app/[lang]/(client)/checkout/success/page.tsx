import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full p-10 text-center bg-white shadow-2xl rounded-[2.5rem] border border-gray-100">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
                        <CheckCircle2 size={56} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tight">
                            ¡Pago Exitoso!
                        </h1>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            Tu pedido ha sido procesado correctamente. Recibirás un email con los detalles pronto.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-14 text-lg flex items-center justify-center rounded-full transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        Volver a la Tienda
                    </Link>
                </div>
            </div>
        </main>
    );
}
