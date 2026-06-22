'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Trash2, Loader2, AlertCircle, CheckCircle, Search,
  Shield, ShieldX, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'client' | 'administrateur' | 'super_administrateur';
  statut: 'actif' | 'banni';
  created_at: string;
  commandes_count: number;
  total_depense: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { formatPrice } = useCurrency();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response: any = await adminAPI.users.getAll();
      if (response.success) {
        setUsers(Array.isArray(response.data) ? response.data : (response.data?.data || []));
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    try {
      const response: any = await adminAPI.users.delete(id);
      if (response.success) {
        setSuccess('Utilisateur supprime');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response: any = await adminAPI.users.toggleStatus(id);
      if (response.success) {
        setSuccess('Statut mis a jour');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangeRole = async (id: number, newRole: string) => {
    try {
      const response: any = await adminAPI.users.changeRole(id, newRole);
      if (response.success) {
        setSuccess('Role mis a jour');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchSearch = search === '' || 
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === '' || user.role === filterRole;
    return matchSearch && matchRole;
  }) : [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_administrateur':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Super Admin</span>;
      case 'administrateur':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Admin</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Client</span>;
    }
  };

  const getStatusBadge = (statut: string) => {
    return statut === 'actif' ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Actif</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Banni</span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-600 mt-1">{Array.isArray(users) ? users.length : 0} utilisateur(s)</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-green-700">{success}</p>
        </motion.div>
      )}

      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:pl-10"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les roles</option>
            <option value="client">Clients</option>
            <option value="administrateur">Administrateurs</option>
            <option value="super_administrateur">Super Administrateurs</option>
          </select>
        </div>
      </Card>

      {filteredUsers.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-base sm:text-lg">Aucun utilisateur trouve</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                      {user.nom?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{user.nom}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                      {user.telephone && (
                        <p className="text-xs text-gray-400 truncate">{user.telephone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.statut)}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {user.commandes_count} cmd
                    </span>
                    {user.total_depense > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {formatPrice(user.total_depense)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">Inscrit le {user.created_at}</p>

                  {user.role !== 'super_administrateur' && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        className={`w-full sm:flex-1 text-xs sm:text-sm ${user.statut === 'actif' ? 'text-orange-600' : 'text-green-600'}`}
                      >
                        {user.statut === 'actif' ? (
                          <>
                            <ShieldX className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Bannir
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Activer
                          </>
                        )}
                      </Button>

                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="w-full sm:flex-1 h-9 px-2 text-xs sm:text-sm border border-gray-200 rounded-lg"
                      >
                        <option value="client">Client</option>
                        <option value="administrateur">Admin</option>
                        <option value="super_administrateur">Super Admin</option>
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id, user.nom)}
                        className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}