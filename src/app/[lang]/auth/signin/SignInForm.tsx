'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, ArrowRight, Wind, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SignInForm({ lang }: { lang: string }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const result = await signIn('email', {
                email,
                redirect: false,
                callbackUrl: `/${lang}/account` // This is a default, middleware/layout will refine
            });
            if (result?.ok) {
                setIsEmailSent(true);
            }
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: `/${lang}/account` });
    };

    if (isEmailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">¡Revisa tu correo!</h1>
                    <p className="text-zinc-400">
                        Hemos enviado un enlace de acceso mágico a <span className="text-blue-400 font-medium">{email}</span>.
                        Haz clic en el enlace para entrar de forma segura.
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={() => setIsEmailSent(false)}
                            className="text-zinc-500 hover:text-white text-sm transition-colors"
                        >
                            ¿No lo recibiste? Intentar de nuevo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 relative bg-zinc-950 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full -ml-40 -mb-40"></div>

            {/* Left side: Visuals/Marketing */}
            <div className="hidden lg:flex flex-col justify-between p-12 relative z-10">
                <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Wind size={20} className="text-white" />
                    </div>
                    Azul Kiteboarding
                </Link>

                <div className="space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                        <ShieldCheck size={14} />
                        Acceso Seguro Unificado
                    </div>
                    <h2 className="text-5xl font-extrabold text-white leading-tight">
                        Todo lo que necesitas para tu sesión, <br />
                        <span className="text-blue-500">en un solo lugar.</span>
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-md">
                        Accede a tu historial de pedidos, gestiona tus puntos de fidelidad y mantente al día con las mejores condiciones.
                    </p>
                </div>

                <div className="text-zinc-500 text-sm text-left">
                    © 2026 Azul Kiteboarding. Todos los derechos reservados.
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 relative z-10">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
                        <p className="text-zinc-500">Inicia sesión para continuar.</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            Continuar con Google
                        </button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-zinc-800"></div>
                            <span className="text-zinc-600 text-xs font-medium uppercase tracking-widest">o con email</span>
                            <div className="flex-1 h-px bg-zinc-800"></div>
                        </div>

                        <form onSubmit={handleEmailSignIn} className="space-y-4 text-left">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@email.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white pl-11 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Enviar enlace de acceso
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-zinc-500 text-sm">
                        ¿No tienes cuenta? <span className="text-zinc-300">Te crearemos una automáticamente al registrarte.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
