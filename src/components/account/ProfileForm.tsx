'use client';

import { useState, useTransition } from 'react';
import { updateUserProfile } from '@/actions/user-actions';
import { Save, Loader2, User, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfilePageProps {
    user: any;
    profile: any;
}

export default function ProfileForm({ user, profile }: ProfilePageProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        weight: profile?.weight || '',
        height: profile?.height || '',
        age: profile?.age || '',
        skillLevel: profile?.skillLevel || 'beginner',
        locationName: profile?.locationName || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await updateUserProfile({
                    ...formData,
                    weight: formData.weight ? parseFloat(formData.weight) : undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                    age: formData.age ? parseInt(formData.age) : undefined,
                });
                router.refresh();
            } catch (error) {
                console.error('Failed to update profile', error);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <User className="text-blue-600" />
                    Datos Físicos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Peso (kg)
                        </label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="Ej: 75"
                            className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Altura (cm)
                        </label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="Ej: 180"
                            className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Edad
                        </label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Ej: 30"
                            className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Nivel de Kitesurf
                        </label>
                        <select
                            name="skillLevel"
                            value={formData.skillLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="beginner">Principiante</option>
                            <option value="intermediate">Intermedio</option>
                            <option value="advanced">Avanzado</option>
                            <option value="expert">Experto</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm opacity-50 pointer-events-none">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    Ubicación Principal (Próximamente)
                </h2>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Ciudad / Spot
                    </label>
                    <input
                        type="text"
                        name="locationName"
                        value={formData.locationName}
                        onChange={handleChange}
                        placeholder="Ej: Tarifa, España"
                        className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                        disabled
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                >
                    {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Guardar Cambios
                </button>
            </div>
        </form>
    );
}
