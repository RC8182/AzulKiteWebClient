'use client';

import { useState } from 'react';
import { updateCustomerPoints, updateCustomerRole, deleteCustomer } from '@/actions/admin-customer-actions';
import { MoreHorizontal, Star, Mail, Search, Trash2, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Customer {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    points: number;
    role: 'ADMIN' | 'USER';
    totalSpent: number;
    orderCount: number;
    createdAt: Date;
}

export default function CustomerTable({ customers }: { customers: Customer[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdatePoints = async (userId: string, points: number) => {
        setLoadingId(userId);
        try {
            await updateCustomerPoints(userId, points);
        } finally {
            setLoadingId(null);
        }
    };

    const handleUpdateRole = async (userId: string, role: 'ADMIN' | 'USER') => {
        if (role === 'ADMIN') {
            const confirmed = confirm('⚠️ ¿ESTÁS SEGURO?\n\nEstás a punto de dar privilegios de ADMINISTRADOR a este usuario. Esto le dará acceso total al sistema y al panel de control.');
            if (!confirmed) return;
        }

        setLoadingId(userId);
        try {
            await updateCustomerRole(userId, role);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) return;
        setLoadingId(userId);
        try {
            await deleteCustomer(userId);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-zinc-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Actividad</th>
                            <th className="px-6 py-4">Puntos</th>
                            <th className="px-6 py-4">Registro</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                                    No se encontraron clientes que coincidan con la búsqueda.
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-200 shadow-sm">
                                                {customer.image ? (
                                                    <img src={customer.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                                    {customer.name || 'Sin nombre'}
                                                </div>
                                                <div className="text-zinc-500 flex items-center gap-1 text-xs">
                                                    <Mail size={12} />
                                                    {customer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={customer.role}
                                            onChange={(e) => handleUpdateRole(customer.id, e.target.value as 'ADMIN' | 'USER')}
                                            disabled={loadingId === customer.id}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight border outline-none transition-all ${customer.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                                : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                                } ${loadingId === customer.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-current'}`}
                                        >
                                            <option value="USER">Usuario</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                        <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                                            {customer.totalSpent.toFixed(2)} €
                                        </div>
                                        <div className="text-xs text-zinc-400">
                                            {customer.orderCount} pedidos realizados
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                defaultValue={customer.points}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (val !== customer.points) handleUpdatePoints(customer.id, val);
                                                }}
                                                disabled={loadingId === customer.id}
                                                className="w-16 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center font-bold text-xs focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                                            />
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 text-xs">
                                        {new Date(customer.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {loadingId === customer.id ? (
                                                <Loader2 size={18} className="animate-spin text-zinc-400" />
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
