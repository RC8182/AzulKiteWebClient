import { getAdminCustomers } from '@/actions/admin-customer-actions';
import CustomerTable from '@/components/dashboard/CustomerTable';
import { Users } from 'lucide-react';

export default async function CustomersPage() {
    const customers = await getAdminCustomers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <Users className="text-blue-600" />
                    Clientes
                    <span className="text-sm font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        {customers.length}
                    </span>
                </h1>
            </div>

            <CustomerTable customers={customers} />
        </div>
    );
}
