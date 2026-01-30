import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AccountSidebar from '@/components/account/AccountSidebar';

export default async function AccountLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const session = await auth();
    const { lang } = await params;

    // If not authenticated, redirect to sign in
    if (!session) {
        redirect(`/${lang}/auth/signin?callbackUrl=/${lang}/account`);
    }

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <AccountSidebar lang={lang} user={session.user} />
                    </div>
                </aside>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
