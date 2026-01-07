import { Button, Card, CardBody } from '@heroui/react';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl rounded-3xl">
                <CardBody className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <XCircle size={48} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-[var(--color-primary)] uppercase italic">
                            Pago Cancelado
                        </h1>
                        <p className="text-gray-500 text-lg">
                            El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
                        </p>
                    </div>
                    <Button
                        as={Link}
                        href="/"
                        size="lg"
                        className="w-full bg-gray-200 text-gray-700 font-bold h-14 text-lg border-2 border-transparent hover:border-[var(--color-primary)] transition-all"
                        radius="full"
                    >
                        Reintentar Compra
                    </Button>
                </CardBody>
            </Card>
        </main>
    );
}
