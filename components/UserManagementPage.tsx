import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { PlusIcon, CheckCircleIcon, PencilIcon, TrashIcon } from './icons/Icons';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import * as db from '../db';

interface UserManagementPageProps {
    // Props might change if we handle state internally, but for now we keep them compatible or ignore them if we fetch internally
    // Actually, it's better if this page manages its own state now since it fetches from DB
}

const UserManagementPage: React.FC<UserManagementPageProps> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadUsers = async () => {
        setIsLoading(true);
        const data = await db.fetchUsers();
        setUsers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddUser = async (newUser: Omit<User, 'id'>) => {
        const addedUser = await db.addUser(newUser);
        if (addedUser) {
            setUsers([...users, addedUser]);
            setIsAddModalOpen(false);
        } else {
            alert('Gagal menambahkan user');
        }
    };

    const handleUpdateUser = async (updatedUser: User) => {
        const success = await db.updateUser(updatedUser);
        if (success) {
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            setEditingUser(null);
        } else {
            alert('Gagal mengupdate user');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            const success = await db.deleteUser(userId);
            if (success) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                alert('Gagal menghapus user');
            }
        }
    };

    const handleApproveUser = async (user: User) => {
        const updatedUser = { ...user, akunStatus: 'Aktif' as const };
        const success = await db.updateUser(updatedUser);
        if (success) {
            setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        } else {
            alert('Gagal menyetujui user');
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading users...</div>;
    }

    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 h-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b space-y-4 sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        Kelola User Registrasi
                    </h2>
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Cari User..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
                        />
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition-colors duration-300 shadow whitespace-nowrap"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Tambah User Manual
                        </button>
                    </div>
                </div>

                <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ maxHeight: '600px', overflow: 'auto' }}>
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0 z-10">
                            <tr>
                                {['Nama Lengkap', 'Status', 'Alamat', 'Telepon', 'Username', 'Status Akun', 'Konfirmasi'].map((header) => (
                                    <th key={header} className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{user.namaLengkap}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{user.status}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{user.alamat}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{user.telepon}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{user.username}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${user.akunStatus === 'Aktif'
                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                : 'bg-gray-100 text-gray-800 border-gray-300'
                                                }`}
                                        >
                                            {user.akunStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleApproveUser(user)}
                                                className="text-green-500 hover:text-green-700"
                                                aria-label="Confirm user"
                                                title="Setujui"
                                                disabled={user.akunStatus === 'Aktif'}
                                            >
                                                <CheckCircleIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-blue-500 hover:text-blue-700"
                                                aria-label="Edit user"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-500 hover:text-red-700"
                                                aria-label="Delete user"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        {searchQuery ? 'Tidak ada user yang ditemukan.' : 'Tidak ada data user.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAddModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddUser}
                />
            )}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateUser}
                />
            )}
        </>
    );
};

export default UserManagementPage;
