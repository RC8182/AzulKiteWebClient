import { getUserProfile } from '@/actions/user-actions';
import ProfileForm from '@/components/account/ProfileForm';

export default async function ProfilePage() {
    const profile = await getUserProfile();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
                <p className="text-zinc-500">
                    Gestiona tu información personal para obtener mejores recomendaciones.
                </p>
            </div>

            <ProfileForm user={profile?.user} profile={profile} />
        </div>
    );
}
