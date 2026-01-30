export type Language = 'es' | 'en' | 'it';

export const dictionary = {
    es: {
        title: "Finalizar Compra",
        empty: "Tu carrito está vacío",
        continue: "Volver a la tienda",
        subtotal: "Subtotal",
        shipping: "Envío",
        free: "Gratis",
        total: "Total",
        checkout: "Pagar ahora",
        taxes: "IVA incluido. Envío calculado al finalizar.",
        summary: "Tu pedido",
        shipping_form: "Datos de Envío",
        product: "Producto",
        shipping_method: "Transporte: 14,00 €",
        payment_methods: {
            bank: "Transferencia bancaria directa",
            bank_desc: "Realiza tu pago directamente en nuestra cuenta bancaria. Por favor, usa el número del pedido como referencia de pago. Tu pedido no se procesará hasta que se haya recibido el importe en nuestra cuenta.",
            paypal: "PayPal",
            card: "Tarjeta de débito o crédito"
        },
        legal_notice: "Tus datos personales se utilizarán para procesar tu pedido, mejorar tu experiencia en esta web y otros propósitos descritos en nuestra política de privacidad.",
        place_order: "Realizar el pedido",
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
        title: "Checkout",
        empty: "Your cart is empty",
        continue: "Back to shop",
        subtotal: "Subtotal",
        shipping: "Shipping",
        free: "Free",
        total: "Total",
        checkout: "Pay now",
        taxes: "VAT included. Shipping calculated at checkout.",
        summary: "Your Order",
        shipping_form: "Shipping Details",
        product: "Product",
        shipping_method: "Shipping: 14,00 €",
        payment_methods: {
            bank: "Direct Bank Transfer",
            bank_desc: "Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.",
            paypal: "PayPal",
            card: "Debit or Credit Card"
        },
        legal_notice: "Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.",
        place_order: "Place Order",
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
        title: "Concludi l'Acquisto",
        empty: "Il tuo carrello è vuoto",
        continue: "Torna al negozio",
        subtotal: "Subtotale",
        shipping: "Spedizione",
        free: "Gratis",
        total: "Total",
        checkout: "Paga ora",
        taxes: "IVA inclusa. Spedizione calcolata al checkout.",
        summary: "Il tuo ordine",
        shipping_form: "Indirizzo di Spedizione",
        product: "Prodotto",
        shipping_method: "Spedizione: 14,00 €",
        payment_methods: {
            bank: "Bonifico bancario diretto",
            bank_desc: "Effettua il pagamento direttamente sul nostro conto bancario. Usa l'ID dell'ordine come riferimento del pagamento. Il tuo ordine non verrà spedito finché i fondi non si saranno cancellati sul nostro conto.",
            paypal: "PayPal",
            card: "Carta di debito o di credito"
        },
        legal_notice: "I tuoi dati personali verranno utilizzati per elaborare il tuo ordine, supportare la tua esperienza su questo sito web e per altri scopi descritti nella nostra privacy policy.",
        place_order: "Effettua l'ordine",
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
