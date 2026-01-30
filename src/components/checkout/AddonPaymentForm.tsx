'use client';

import { useEffect, useRef } from 'react';

interface AddonPaymentFormProps {
    url: string;
    fields: Record<string, string>;
}

export default function AddonPaymentForm({ url, fields }: AddonPaymentFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const initiatedRef = useRef(false);

    useEffect(() => {
        if (!initiatedRef.current && formRef.current) {
            initiatedRef.current = true;
            formRef.current.submit();
        }
    }, [url]);

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center mb-6">
                <p className="mb-4 text-lg">Redirigiendo a la pasarela de pago segura...</p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">No cierres esta ventana.</p>
            </div>

            <form
                ref={formRef}
                action={url}
                method="POST"
                className="hidden" // Hidden form, auto-submitted
            >
                {Object.entries(fields).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                ))}
            </form>

            <button
                onClick={() => formRef.current?.submit()}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors mt-4"
            >
                Haz clic aquí si no se redirige automáticamente
            </button>
        </div>
    );
}
