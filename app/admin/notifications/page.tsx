// app/admin/notifications/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'promo' | 'systeme' | 'commande'>('systeme');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Notification envoyée:', { title, message, type });
    setSent(true);
    setTitle('');
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Envoyer des Notifications</h1>
        <p className="text-gray-600">Communiquez avec vos utilisateurs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Nouvelle notification</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label>Type de notification</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="systeme">Système</option>
                <option value="promo">Promotion</option>
                <option value="commande">Commande</option>
              </select>
            </div>

            <div>
              <Label>Titre</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la notification"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label>Message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contenu du message..."
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={5}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-primary to-secondary">
              <Send className="w-4 h-4" />
              Envoyer à tous les utilisateurs
            </Button>

            {sent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center"
              >
                ✓ Notification envoyée avec succès !
              </motion.div>
            )}
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">Statistiques</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Utilisateurs totaux</span>
              </div>
              <span className="font-bold text-lg">1,234</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Notifications envoyées</span>
              </div>
              <span className="font-bold text-lg">5,678</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Taux d'ouverture</span>
              </div>
              <span className="font-bold text-lg text-green-600">78%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}