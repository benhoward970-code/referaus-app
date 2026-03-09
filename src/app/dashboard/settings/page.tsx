'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ email: 'admin@hunterds.com.au', currentPassword: '', newPassword: '', confirmPassword: '', timezone: 'Australia/Sydney', language: 'en' });
  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Account and security settings</p>

        <div className="space-y-8">
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Account Email</h2>
            <div><label className="block text-sm font-medium mb-1.5">Email Address</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full max-w-md px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div><label className="block text-sm font-medium mb-1.5">Current Password</label><input type="password" value={form.currentPassword} onChange={e => update('currentPassword', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1.5">New Password</label><input type="password" value={form.newPassword} onChange={e => update('newPassword', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1.5">Confirm New Password</label><input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Preferences</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-md">
              <div><label className="block text-sm font-medium mb-1.5">Timezone</label><select value={form.timezone} onChange={e => update('timezone', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Australia/Sydney">Sydney (AEST)</option><option value="Australia/Melbourne">Melbourne (AEST)</option><option value="Australia/Brisbane">Brisbane (AEST)</option><option value="Australia/Perth">Perth (AWST)</option></select></div>
              <div><label className="block text-sm font-medium mb-1.5">Language</label><select value={form.language} onChange={e => update('language', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="en">English</option></select></div>
            </div>
          </section>

          <section className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="font-bold text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all">Delete Account</button>
          </section>

          <div className="flex items-center justify-end gap-3">
            {saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">Settings saved!</motion.span>}
            <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all">Save Settings</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
