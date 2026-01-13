export type Language = 'es' | 'en' | 'it';

export const dictionary = {
    es: {
        title: "Resumen de tu pedido",
        empty: "Tu carrito está vacío",
        continue: "Volver a la tienda",
        subtotal: "Subtotal",
        shipping: "Envío",
        free: "Gratis",
        total: "Total",
        checkout: "Finalizar Compra",
        taxes: "IVA incluido. Envío calculado al finalizar.",
        summary: "Detalles del pedido",
        processing: "Procesando...",
        success: {
            title: "¡Pago Exitoso!",
            description: "Tu pedido ha sido procesado correctamente. Recibirás un email con los detalles pronto.",
            back: "Volver a la Tienda"
        },
        cancel: {
            title: "Pago Cancelado",
            description: "El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.",
            retry: "Reintentar Compra"
        }
    },
    en: {
        title: "Order Summary",
        empty: "Your cart is empty",
        continue: "Back to shop",
        subtotal: "Subtotal",
        shipping: "Shipping",
        free: "Free",
        total: "Total",
        checkout: "Complete Purchase",
        taxes: "VAT included. Shipping calculated at checkout.",
        summary: "Order details",
        processing: "Processing...",
        success: {
            title: "Payment Successful!",
            description: "Your order has been processed correctly. You'll receive an email with details soon.",
            back: "Back to Shop"
        },
        cancel: {
            title: "Payment Cancelled",
            description: "The payment process has been cancelled. No charges have been made.",
            retry: "Retry Purchase"
        }
    },
    it: {
        title: "Riepilogo dell'ordine",
        empty: "Il tuo carrello è vuoto",
        continue: "Torna al negozio",
        subtotal: "Subtotale",
        shipping: "Spedizione",
        free: "Gratis",
        total: "Totale",
        checkout: "Completa l'Acquisto",
        taxes: "IVA inclusa. Spedizione calcolata al checkout.",
        summary: "Dettagli dell'ordine",
        processing: "In elaborazione...",
        success: {
            title: "Pagamento Riuscito!",
            description: "Il tuo ordine è stato elaborato correttamente. Riceverai presto un'email con i dettagli.",
            back: "Torna al Negozio"
        },
        cancel: {
            title: "Pagamento Annullato",
            description: "Il processo di pagamento è stato annullato. Non è stato effettuato alcun addebito.",
            retry: "Riprova l'Acquisto"
        }
    }
};

export function getDictionary(lang: string) {
    return dictionary[lang as Language] || dictionary.es;
}
