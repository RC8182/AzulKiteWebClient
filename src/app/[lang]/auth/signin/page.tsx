import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";

export default async function SignInPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params;
    const session = await auth();

    // If already logged in, redirect to appropriate section
    if (session) {
        const role = (session.user as any)?.role;
        if (role === 'ADMIN') {
            redirect(`/${lang}/dashboard`);
        } else {
            redirect(`/${lang}/account`);
        }
    }

    return <SignInForm lang={lang} />;
}
