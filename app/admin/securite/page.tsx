'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, ShieldAlert, ShieldCheck, Ban, Activity, 
  Loader2, AlertCircle, CheckCircle, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';

export default function SecurityPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blockIP, setBlockIP] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response: any = await adminAPI.security.dashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockIP || !blockReason) return;

    try {
      const response: any = await adminAPI.security.blockIP(blockIP, blockReason, blockDuration);
      if (response.success) {
        setSuccess('IP bloquee avec succes');
        setBlockIP('');
        setBlockReason('');
        fetchStats();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    if (!confirm('Debloquer l IP ' + ip + ' ?')) return;

    try {
      const response: any = await adminAPI.security.unblockIP(ip);
      if (response.success) {
        setSuccess('IP debloquee');
        fetchStats();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCleanLogs = async () => {
    if (!confirm('Nettoyer les anciens logs ?')) return;

    try {
      const response: any = await adminAPI.security.cleanLogs();
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && !stats) {
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            Securite
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Surveillance en temps reel</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="gap-2 w-full sm:w-auto">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-red-700 mb-1">IPs bloquees</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900">{stats?.blocked_ips || 0}</p>
            </div>
            <Ban className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-blue-700 mb-1">Tentatives 24h</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats?.total_attempts_24h || 0}</p>
            </div>
            <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-amber-700 mb-1">Suspects</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-900">{stats?.suspicious_events_24h || 0}</p>
            </div>
            <ShieldAlert className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600" />
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          Bloquer une IP
        </h2>
        <form onSubmit={handleBlockIP} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Adresse IP</Label>
              <Input
                value={blockIP}
                onChange={(e) => setBlockIP(e.target.value)}
                placeholder="192.168.1.1"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Raison</Label>
              <Input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Attaque detectee"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Duree (minutes)</Label>
              <Input
                type="number"
                value={blockDuration}
                onChange={(e) => setBlockDuration(Number(e.target.value))}
                min="1"
                required
                className="mt-1"
              />
            </div>
          </div>
          <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            Bloquer l IP
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          Top IPs attaquantes (24h)
        </h2>
        {stats?.top_attacking_ips && stats.top_attacking_ips.length > 0 ? (
          <div className="space-y-2">
            {stats.top_attacking_ips.map((item: any, index: number) => (
              <motion.div
                key={item.ip_address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                  <div>
                    <p className="font-mono font-semibold text-gray-900 text-sm sm:text-base break-all">{item.ip_address}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{item.attempts} tentatives</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setBlockIP(item.ip_address); }}
                  className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                >
                  <Ban className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Bloquer
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">Aucune attaque detectee</p>
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            IPs recemment bloquees
          </h2>
          <Button variant="outline" size="sm" onClick={handleCleanLogs} className="gap-2 w-full sm:w-auto">
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Nettoyer logs
          </Button>
        </div>
        {stats?.recent_blocks && stats.recent_blocks.length > 0 ? (
          <div className="space-y-2">
            {stats.recent_blocks.map((block: any) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-semibold text-gray-900 text-sm sm:text-base break-all">{block.ip_address}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{block.reason}</p>
                  <p className="text-xs text-gray-500">
                    Jusqu a {new Date(block.blocked_until).toLocaleString('fr-FR')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblockIP(block.ip_address)}
                  className="text-green-600 hover:bg-green-50 w-full sm:w-auto"
                >
                  Debloquer
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">Aucune IP bloquee</p>
        )}
      </Card>
    </div>
  );
}