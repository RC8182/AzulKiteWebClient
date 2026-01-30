'use client';

import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessages: Record<string, string> = {
        'Configuration': 'Hay un problema con la configuración del servidor. Por favor, contacta con soporte.',
        'AccessDenied': 'No tienes permiso para acceder a este recurso.',
        'Verification': 'El enlace de verificación ha caducado o ya ha sido utilizado.',
        'Default': 'Ha ocurrido un error inesperado en la autenticación.'
    };

    const message = errorMessages[error || 'Default'] || errorMessages['Default'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-red-900/30 p-10 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden">
                {/* Warning background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <AlertTriangle size={40} />
                </div>

                <div className="space-y-3 relative z-10">
                    <h1 className="text-2xl font-bold text-white">Oops! Algo salió mal</h1>
                    <p className="text-zinc-400">
                        {message}
                    </p>
                    {error && (
                        <div className="mt-2 px-3 py-1 bg-red-950/30 border border-red-900/30 rounded-lg inline-block">
                            <code className="text-[10px] text-red-400 uppercase font-mono tracking-tighter">ERROR_CODE: {error}</code>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                    <Link
                        href="/auth/signin"
                        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98]"
                    >
                        <RefreshCcw size={18} />
                        Intentar de nuevo
                    </Link>
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white py-2 transition-colors text-sm"
                    >
                        <Home size={16} />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
