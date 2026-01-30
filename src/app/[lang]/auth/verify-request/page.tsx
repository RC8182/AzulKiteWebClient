'use client';

import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <CheckCircle2 size={40} />
                </div>

                <div className="space-y-3 relative z-10">
                    <h1 className="text-3xl font-bold text-white">¡Correo enviado!</h1>
                    <p className="text-zinc-400">
                        Hemos enviado un enlace de confirmación a tu dirección de correo electrónico.
                    </p>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 text-sm text-zinc-300 leading-relaxed relative z-10">
                    Por favor, revisa tu bandeja de entrada (y la carpeta de spam si es necesario) y haz clic en el botón para iniciar sesión.
                </div>

                <div className="pt-4 relative z-10">
                    <Link
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
