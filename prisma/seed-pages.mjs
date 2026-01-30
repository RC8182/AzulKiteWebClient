import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    const pages = [
        {
            slug: 'about',
            title: 'Sobre Nosotros',
            translations: [
                { locale: 'es', title: 'Sobre Nosotros' },
                { locale: 'en', title: 'About Us' },
                { locale: 'it', title: 'Su di Noi' }
            ],
            blocks: [
                {
                    type: 'hero',
                    translations: [
                        { locale: 'es', content: { title: 'Nuestra Pasión es el Kite', subtitle: 'Conoce la historia de Azul Kiteboarding' } },
                        { locale: 'en', content: { title: 'Our Passion is Kite', subtitle: 'Discover the story of Azul Kiteboarding' } },
                        { locale: 'it', content: { title: 'La nostra Passione è il Kite', subtitle: 'Scopri la storia di Azul Kiteboarding' } }
                    ]
                },
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<p>Llevamos más de 10 años ofreciendo el mejor material de kitesurf y wingfoil. Nuestra tienda nació en el corazón de El Médano...</p>' } },
                        { locale: 'en', content: { html: '<p>We have been offering the best kitesurfing and wingfoil gear for over 10 years. Our store was born in the heart of El Médano...</p>' } },
                        { locale: 'it', content: { html: '<p>Offriamo la migliore attrezzatura per il kitesurf e il wingfoil da oltre 10 anni. Il nostro negozio è nato nel cuore di El Médano...</p>' } }
                    ]
                },
                {
                    type: 'features-list',
                    translations: [
                        {
                            locale: 'es', content: {
                                features: [
                                    { icon: '⭐', title: 'Calidad Premium', description: 'Solo trabajamos con las mejores marcas del mercado.' },
                                    { icon: '🚀', title: 'Envío Rápido', description: 'Recibe tu material en tiempo récord.' },
                                    { icon: '🤝', title: 'Soporte Experto', description: 'Te asesoramos para que elijas el equipo ideal.' }
                                ]
                            }
                        },
                        {
                            locale: 'en', content: {
                                features: [
                                    { icon: '⭐', title: 'Premium Quality', description: 'We only work with the best brands in the market.' },
                                    { icon: '🚀', title: 'Fast Shipping', description: 'Receive your gear in record time.' },
                                    { icon: '🤝', title: 'Expert Support', description: 'We advise you to choose the ideal equipment.' }
                                ]
                            }
                        },
                        {
                            locale: 'it', content: {
                                features: [
                                    { icon: '⭐', title: 'Qualità Premium', description: 'Lavoriamo solo con le migliori marche sul mercato.' },
                                    { icon: '🚀', title: 'Spedizione Veloce', description: 'Ricevi la tua attrezzatura a tempo di record.' },
                                    { icon: '🤝', title: 'Supporto Esperto', description: 'Ti consigliamo per scegliere l\'attrezzatura ideale.' }
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            slug: 'contact',
            title: 'Contacto',
            translations: [
                { locale: 'es', title: 'Contacto' },
                { locale: 'en', title: 'Contact' },
                { locale: 'it', title: 'Contatto' }
            ],
            blocks: [
                {
                    type: 'hero',
                    translations: [
                        { locale: 'es', content: { title: '¿En qué podemos ayudarte?', subtitle: 'Estamos aquí para resolver tus dudas' } },
                        { locale: 'en', content: { title: 'How can we help you?', subtitle: 'We are here to answer your questions' } },
                        { locale: 'it', content: { title: 'Come possiamo aiutarti?', subtitle: 'Siamo qui per rispondere alle tue domande' } }
                    ]
                },
                {
                    type: 'contact-form',
                    translations: [
                        { locale: 'es', content: { title: 'Envíanos un mensaje' } },
                        { locale: 'en', content: { title: 'Send us a message' } },
                        { locale: 'it', content: { title: 'Inviaci un messaggio' } }
                    ],
                    config: {}
                },
                {
                    type: 'info-block',
                    translations: [
                        { locale: 'es', content: { title: 'Nuestra Ubicación', description: 'Calle Principal, 12, El Médano, Tenerife. Tel: +34 922 000 000' } },
                        { locale: 'en', content: { title: 'Our Location', description: 'Main Street, 12, El Médano, Tenerife. Tel: +34 922 000 000' } },
                        { locale: 'it', content: { title: 'La nostra Posizione', description: 'Via Principale, 12, El Médano, Tenerife. Tel: +34 922 000 000' } }
                    ],
                    config: { image: 'https://images.unsplash.com/photo-1541013719417-093f433b8a4a?auto=format&fit=crop&q=80&w=800' }
                }
            ]
        },
        {
            slug: 'help',
            title: 'Centro de Ayuda',
            translations: [
                { locale: 'es', title: 'Centro de Ayuda' },
                { locale: 'en', title: 'Help Center' },
                { locale: 'it', title: 'Centro Assistenza' }
            ],
            blocks: [
                {
                    type: 'hero',
                    translations: [
                        { locale: 'es', content: { title: 'Resolvemos tus dudas', subtitle: 'Toda la información que necesitas sobre tus pedidos' } },
                        { locale: 'en', content: { title: 'We solve your doubts', subtitle: 'All the information you need about your orders' } },
                        { locale: 'it', content: { title: 'Risolviamo i tuoi dubbi', subtitle: 'Tutte le informazioni di cui hai bisogno sui tuoi ordini' } }
                    ]
                },
                {
                    type: 'faq-section',
                    translations: [
                        {
                            locale: 'es', content: {
                                faqs: [
                                    { question: '¿Cuánto tarda el envío?', answer: 'Los envíos a Canarias tardan 24-48h, a Península 3-5 días hábiles.' },
                                    { question: '¿Cómo puedo devolver un producto?', answer: 'Tienes 30 días para devoluciones desde el área de usuario.' },
                                    { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos Tarjeta, PayPal y Transferencia Bancaria.' }
                                ]
                            }
                        },
                        {
                            locale: 'en', content: {
                                faqs: [
                                    { question: 'How long does shipping take?', answer: 'Shipping to Canary Islands takes 24-48h, to Mainland Spain 3-5 business days.' },
                                    { question: 'How can I return a product?', answer: 'You have 30 days for returns from the user area.' },
                                    { question: 'What payment methods do you accept?', answer: 'We accept Card, PayPal and Bank Transfer.' }
                                ]
                            }
                        },
                        {
                            locale: 'it', content: {
                                faqs: [
                                    { question: 'Quanto tempo impiega la spedizione?', answer: 'Le spedizioni alle Isole Canarie richiedono 24-48 ore, in Spagna continentale 3-5 giorni lavorativi.' },
                                    { question: 'Come posso restituire un prodotto?', answer: 'Hai 30 giorni per i resi dall\'area utente.' },
                                    { question: 'Quali metodi di pagamento accettate?', answer: 'Accettiamo Carte, PayPal e Bonifico Bancario.' }
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            slug: 'privacy',
            title: 'Política de Privacidad',
            translations: [
                { locale: 'es', title: 'Política de Privacidad' },
                { locale: 'en', title: 'Privacy Policy' },
                { locale: 'it', title: 'Politica sulla Privacy' }
            ],
            blocks: [
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<h1>Política de Privacidad</h1><p>En cumplimiento del RGPD, informamos que sus datos serán tratados para...</p>' } },
                        { locale: 'en', content: { html: '<h1>Privacy Policy</h1><p>In compliance with GDPR, we inform you that your data will be processed for...</p>' } },
                        { locale: 'it', content: { html: '<h1>Politica sulla Privacy</h1><p>In conformità con il GDPR, ti informiamo che i tuoi dati saranno trattati per...</p>' } }
                    ]
                }
            ]
        },
        {
            slug: 'terms',
            title: 'Términos y Condiciones',
            translations: [
                { locale: 'es', title: 'Términos y Condiciones' },
                { locale: 'en', title: 'Terms and Conditions' },
                { locale: 'it', title: 'Termini e Condizioni' }
            ],
            blocks: [
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<h1>Términos y Condiciones</h1><p>Al utilizar este sitio web usted acepta los siguientes términos...</p>' } },
                        { locale: 'en', content: { html: '<h1>Terms and Conditions</h1><p>By using this website you accept the following terms...</p>' } },
                        { locale: 'it', content: { html: '<h1>Termini e Condizioni</h1><p>Utilizzando questo sito web accetti i seguenti termini...</p>' } }
                    ]
                }
            ]
        },
        {
            slug: 'cookies',
            title: 'Política de Cookies',
            translations: [
                { locale: 'es', title: 'Política de Cookies' },
                { locale: 'en', title: 'Cookies Policy' },
                { locale: 'it', title: 'Politica sui Cookie' }
            ],
            blocks: [
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<h1>Política de Cookies</h1><p>Utilizamos cookies para mejorar su experiencia...</p>' } },
                        { locale: 'en', content: { html: '<h1>Cookies Policy</h1><p>We use cookies to improve your experience...</p>' } },
                        { locale: 'it', content: { html: '<h1>Politica sui Cookie</h1><p>Utilizziamo i cookie per migliorare la tua esperienza...</p>' } }
                    ]
                }
            ]
        },
        {
            slug: 'legal',
            title: 'Aviso Legal',
            translations: [
                { locale: 'es', title: 'Aviso Legal' },
                { locale: 'en', title: 'Legal Notice' },
                { locale: 'it', title: 'Note Legali' }
            ],
            blocks: [
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<h1>Aviso Legal</h1><p>Datos de la empresa: Azul Kiteboarding SL, Calle Principal...</p>' } },
                        { locale: 'en', content: { html: '<h1>Legal Notice</h1><p>Company data: Azul Kiteboarding SL, Main Street...</p>' } },
                        { locale: 'it', content: { html: '<h1>Note Legali</h1><p>Dati aziendali: Azul Kiteboarding SL, Via Principale...</p>' } }
                    ]
                }
            ]
        },
        {
            slug: 'return-policy',
            title: 'Política de Devoluciones',
            translations: [
                { locale: 'es', title: 'Política de Devoluciones' },
                { locale: 'en', title: 'Return Policy' },
                { locale: 'it', title: 'Politica di Reso' }
            ],
            blocks: [
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<h1>Política de Devoluciones</h1><p>Aceptamos devoluciones en un plazo de 30 días...</p>' } },
                        { locale: 'en', content: { html: '<h1>Return Policy</h1><p>We accept returns within 30 days...</p>' } },
                        { locale: 'it', content: { html: '<h1>Politica di Reso</h1><p>Accettiamo resi entro 30 giorni...</p>' } }
                    ]
                }
            ]
        },
        {
            slug: 'payment',
            title: 'Métodos de Pago',
            translations: [
                { locale: 'es', title: 'Métodos de Pago' },
                { locale: 'en', title: 'Payment Methods' },
                { locale: 'it', title: 'Metodi di Pagamento' }
            ],
            blocks: [
                {
                    type: 'features-list',
                    translations: [
                        {
                            locale: 'es', content: {
                                features: [
                                    { icon: '💳', title: 'Tarjeta', description: 'Visa, Mastercard, AMEX' },
                                    { icon: '🅿️', title: 'PayPal', description: 'Pago seguro y rápido' },
                                    { icon: '🏦', title: 'Transferencia', description: 'Ideal para pedidos de gran volumen' }
                                ]
                            }
                        },
                        {
                            locale: 'en', content: {
                                features: [
                                    { icon: '💳', title: 'Card', description: 'Visa, Mastercard, AMEX' },
                                    { icon: '🅿️', title: 'PayPal', description: 'Safe and fast payment' },
                                    { icon: '🏦', title: 'Bank Transfer', description: 'Ideal for high volume orders' }
                                ]
                            }
                        },
                        {
                            locale: 'it', content: {
                                features: [
                                    { icon: '💳', title: 'Carta', description: 'Visa, Mastercard, AMEX' },
                                    { icon: '🅿️', title: 'PayPal', description: 'Pagamento sicuro e veloce' },
                                    { icon: '🏦', title: 'Bonifico', description: 'Ideale per ordini di grandi volumi' }
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            slug: 'home',
            title: 'Inicio',
            translations: [
                { locale: 'es', title: 'Inicio - Azul Kiteboarding' },
                { locale: 'en', title: 'Home - Azul Kiteboarding' },
                { locale: 'it', title: 'Home - Azul Kiteboarding' }
            ],
            blocks: [
                {
                    type: 'hero-slider',
                    translations: [
                        { locale: 'es', content: { slides: [{ title: 'Temporada 2026', description: 'Lo último en Wingfoil y Kitesurf ya está aquí.', backgroundImage: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=1200' }] } },
                        { locale: 'en', content: { slides: [{ title: '2026 Season', description: 'The latest in Wingfoil and Kitesurfing is here.', backgroundImage: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=1200' }] } },
                        { locale: 'it', content: { slides: [{ title: 'Stagione 2026', description: 'L\'ultimo arrivato in Wingfoil e Kitesurf è qui.', backgroundImage: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=1200' }] } }
                    ],
                    config: { autoplay: true, interval: 5000 }
                },
                {
                    type: 'scrolling-banner',
                    translations: [
                        { locale: 'es', content: { items: [{ text: 'Envío Gratis +150€' }, { text: 'Asesoramiento Experto' }, { text: 'Tienda Física en Tenerife' }] } },
                        { locale: 'en', content: { items: [{ text: 'Free Shipping over 150€' }, { text: 'Expert Advice' }, { text: 'Physical Store in Tenerife' }] } },
                        { locale: 'it', content: { items: [{ text: 'Spedizione Gratuita oltre 150€' }, { text: 'Consulenza Esperta' }, { text: 'Negozio Fisico a Tenerife' }] } }
                    ],
                    config: { speed: 30, backgroundColor: '#003366' }
                },
                {
                    type: 'banner-grid',
                    translations: [
                        { locale: 'es', content: { banners: [{ title: 'Kitesurf', image: 'https://images.unsplash.com/photo-1516245556508-7d60d4ff0f39?auto=format&fit=crop&q=80&w=600' }, { title: 'Wingfoil', image: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=600' }] } },
                        { locale: 'en', content: { banners: [{ title: 'Kitesurfing', image: 'https://images.unsplash.com/photo-1516245556508-7d60d4ff0f39?auto=format&fit=crop&q=80&w=600' }, { title: 'Wingfoil', image: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=600' }] } },
                        { locale: 'it', content: { banners: [{ title: 'Kitesurf', image: 'https://images.unsplash.com/photo-1516245556508-7d60d4ff0f39?auto=format&fit=crop&q=80&w=600' }, { title: 'Wingfoil', image: 'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=600' }] } }
                    ],
                    config: { gridCols: 2 }
                },
                {
                    type: 'product-grid',
                    translations: [
                        { locale: 'es', content: { title: 'Novedades' } },
                        { locale: 'en', content: { title: 'New Arrivals' } },
                        { locale: 'it', content: { title: 'Nuovi Arrivi' } }
                    ],
                    config: { mode: 'all', limit: 4, layout: 'grid' }
                },
                {
                    type: 'features-list',
                    translations: [
                        {
                            locale: 'es', content: {
                                features: [
                                    { icon: '🏖️', title: 'Base en El Médano', description: 'Ven a probar el material a nuestra tienda.' },
                                    { icon: '🚚', title: 'Envío Rápido', description: 'Entrega en 24/48h en Canarias.' },
                                    { icon: '💳', title: 'Pago Seguro', description: 'Paga con tarjeta, PayPal o transferencia.' }
                                ]
                            }
                        },
                        {
                            locale: 'en', content: {
                                features: [
                                    { icon: '🏖️', title: 'Base in El Médano', description: 'Come try the gear at our store.' },
                                    { icon: '🚚', title: 'Fast Shipping', description: '24/48h delivery in Canary Islands.' },
                                    { icon: '💳', title: 'Secure Payment', description: 'Pay by card, PayPal or transfer.' }
                                ]
                            }
                        },
                        {
                            locale: 'it', content: {
                                features: [
                                    { icon: '🏖️', title: 'Base a El Médano', description: 'Vieni a provare l\'attrezzatura nel nostro negozio.' },
                                    { icon: '🚚', title: 'Spedizione Veloce', description: 'Consegna in 24/48 ore nelle Canarie.' },
                                    { icon: '💳', title: 'Pagamento Sicuro', description: 'Paga con carta, PayPal o bonifico.' }
                                ]
                            }
                        }
                    ]
                },
                {
                    type: 'testimonials',
                    translations: [
                        { locale: 'es', content: { testimonials: [{ name: 'Juan M.', text: 'El mejor asesoramiento en material de Kite. Volveré seguro.', role: 'Kiter avanzado' }] } },
                        { locale: 'en', content: { testimonials: [{ name: 'John D.', text: 'The best advice on Kite gear. I will definitely be back.', role: 'Advanced Kiter' }] } },
                        { locale: 'it', content: { testimonials: [{ name: 'Giovanni M.', text: 'Il miglior consiglio sull\'attrezzatura da Kite. Tornerò di sicuro.', role: 'Kiter avanzato' }] } }
                    ]
                }
            ]
        },
        {
            slug: 'blog',
            title: 'Noticias y Blog',
            translations: [
                { locale: 'es', title: 'Noticias y Blog' },
                { locale: 'en', title: 'News and Blog' },
                { locale: 'it', title: 'Notizie e Blog' }
            ],
            blocks: [
                {
                    type: 'hero',
                    translations: [
                        { locale: 'es', content: { title: 'Azul Kite Blog', subtitle: 'Próximamente noticias del mundo del Kitesurf' } },
                        { locale: 'en', content: { title: 'Azul Kite Blog', subtitle: 'Coming soon news from the world of Kitesurfing' } },
                        { locale: 'it', content: { title: 'Blog Azul Kite', subtitle: 'Prossimamente notizie dal mondo del Kitesurf' } }
                    ]
                },
                {
                    type: 'rich-text',
                    translations: [
                        { locale: 'es', content: { html: '<p>Estamos preparando el mejor contenido para ti. Vuelve pronto para leer las últimas novedades.</p>' } },
                        { locale: 'en', content: { html: '<p>We are preparing the best content for you. Come back soon to read the latest news.</p>' } },
                        { locale: 'it', content: { html: '<p>Stiamo preparando i migliori contenuti per te. Torna presto per leggere le ultime novità.</p>' } }
                    ]
                }
            ]
        }
    ];

    for (const pageData of pages) {
        console.log(`Upserting page: ${pageData.slug}`);

        // Find if page exists
        const existingPage = await prisma.page.findUnique({
            where: { slug: pageData.slug }
        });

        if (existingPage) {
            // Delete blocks and translations to re-create them fresh
            await prisma.pageBlock.deleteMany({ where: { pageId: existingPage.id } });
            await prisma.pageTranslation.deleteMany({ where: { pageId: existingPage.id } });

            await prisma.page.update({
                where: { id: existingPage.id },
                data: {
                    translations: {
                        create: pageData.translations
                    },
                    blocks: {
                        create: pageData.blocks.map((b, idx) => ({
                            type: b.type,
                            order: idx,
                            config: b.config || {},
                            translations: {
                                create: b.translations
                            }
                        }))
                    }
                }
            });
        } else {
            await prisma.page.create({
                data: {
                    slug: pageData.slug,
                    title: pageData.title,
                    published: true,
                    translations: {
                        create: pageData.translations
                    },
                    blocks: {
                        create: pageData.blocks.map((b, idx) => ({
                            type: b.type,
                            order: idx,
                            config: b.config || {},
                            translations: {
                                create: b.translations
                            }
                        }))
                    }
                }
            });
        }
    }

    console.log('Seed finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
