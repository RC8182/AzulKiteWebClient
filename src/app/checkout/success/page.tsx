import { Button, Card, CardBody } from '@heroui/react';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl rounded-3xl">
                <CardBody className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-[var(--color-primary)] uppercase italic">
                            ¡Pago Exitoso!
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Tu pedido ha sido procesado correctamente. Recibirás un email con los detalles pronto.
                        </p>
                    </div>
                    <Button
                        as={Link}
                        href="/"
                        size="lg"
                        className="w-full bg-[var(--color-primary)] text-white font-bold h-14 text-lg"
                        radius="full"
                    >
                        Volver a la Tienda
                    </Button>
                </CardBody>
            </Card>
        </main>
    );
}
