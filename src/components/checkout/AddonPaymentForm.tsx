'use client';

import { useEffect, useRef } from 'react';

interface AddonPaymentFormProps {
    url: string;
    params: string;
    signature: string;
    version: string;
}

export default function AddonPaymentForm({ url, params, signature, version }: AddonPaymentFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (formRef.current) {
            formRef.current.submit();
        }
    }, []);

    return (
        <form ref={formRef} action={url} method="POST" className="hidden">
            <input type="hidden" name="Ds_SignatureVersion" value={version} />
            <input type="hidden" name="Ds_MerchantParameters" value={params} />
            <input type="hidden" name="Ds_Signature" value={signature} />
        </form>
    );
}
