import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async ({ identifier, url, provider }) => {
                const { host } = new URL(url);
                // Custom Transport
                const { createTransport } = require("nodemailer");
                const transport = createTransport(provider.server);

                await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Iniciar Sesión en Azul Kiteboarding`,
                    text: `Inicia sesión en ${host}\n${url}\n\n`,
                    html: `
                    <body style="background: #f9f9f9; font-family: sans-serif; padding: 20px;">
                      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="color: #0051B5; text-align: center; margin-bottom: 20px;">Azul Kiteboarding</h2>
                        <p style="font-size: 16px; color: #333; text-align: center;">Haz clic en el botón para verificar tu cuenta e iniciar sesión:</p>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${url}" style="background-color: #0072F5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                            Verificar / Iniciar Sesión
                          </a>
                        </div>
                        <p style="font-size: 12px; color: #888; text-align: center;">Si no solicitaste este correo, puedes ignorarlo.</p>
                      </div>
                    </body>
                  `,
                });
            },
            // Extender expiración a 30 días para desarrollo
            maxAge: process.env.NODE_ENV === 'development' ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 días en dev, 1 día en prod
        }),
        // Google OAuth - configured but not used initially
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true, // Allow linking email accounts
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
        error: '/auth/error',
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // @ts-ignore
                session.user.role = user.role; // Add role to session
            }
            return session;
        },
        // En desarrollo, permitir tokens sin expiración
        async signIn({ user, account, profile, email, credentials }) {
            if (process.env.NODE_ENV === 'development') {
                return true; // Permitir cualquier login en desarrollo
            }
            return true;
        },
    },
    session: {
        strategy: "database",
        maxAge: process.env.NODE_ENV === 'development' ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 días en dev, 7 días en prod
    },
})
