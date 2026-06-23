'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getProviderByUserId, supabase } from '@/lib/supabase';

interface NotifSetting { id: string; label: string; description: string; email: boolean; push: boolean; controlled: boolean; }

const PUSH_NOTE = 'Push notifications are coming soon.';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [settings, setSettings] = useState<NotifSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);

  const buildSettings = useCallback((emailOn: boolean): NotifSetting[] => [
    { id: 'new_enquiry', label: 'New Enquiries', description: 'When a participant sends you an enquiry', email: emailOn, push: false, controlled: true },
    { id: 'new_review', label: 'New Reviews', description: 'When someone leaves a review on your listing', email: emailOn, push: false, controlled: true },
    { id: 'weekly_digest', label: 'Weekly Digest', description: 'Weekly summary of views, enquiries, and performance', email: emailOn, push: false, controlled: false },
    { id: 'plan_expiry', label: 'Plan Expiry', description: 'Reminder before your subscription renews or expires', email: true, push: false, controlled: false },
    { id: 'platform_updates', label: 'Platform Updates', description: 'New features and improvements to ReferAus', email: emailOn, push: false, controlled: false },
  ], []);

  useEffect(() => {
    if (!user) return;
    getProviderByUserId(user.id).then((p) => {
      if (p) {
        setProviderId(p.id);
        const on = p.email_notifications !== false; // default true
        setEmailNotifications(on);
        setSettings(buildSettings(on));
      }
      setLoading(false);
    });
  }, [user, buildSettings]);

  const toggle = (id: string, channel: 'email' | 'push') => {
    if (channel === 'push') return; // no push yet
    if (id === 'plan_expiry') return; // always on
    const newVal = !settings.find(s => s.id === id)?.email;
    // If any controlled setting changes, it controls emailNotifications
    const controlledIds = ['new_enquiry', 'new_review'];
    if (controlledIds.includes(id)) {
      setEmailNotifications(newVal);
      setSettings(buildSettings(newVal));
    } else {
      setSettings(prev => prev.map(s => s.id === id ? { ...s, email: newVal } : s));
    }
  };

  const handleSave = async () => {
    if (!providerId) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      await fetch('/api/provider', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ id: providerId, email_notifications: emailNotifications }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">Choose how you want to be notified</p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        {/* Master email toggle */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Master toggle — enables all transactional emails</p>
          </div>
          <button
            onClick={() => { setEmailNotifications(v => { const next = !v; setSettings(buildSettings(next)); return next; }); }}
            className={'w-12 h-7 rounded-full transition-colors duration-200 relative ' + (emailNotifications ? 'bg-blue-600' : 'bg-gray-200')}
            aria-label="Toggle all email notifications"
          >
            <span className={'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ' + (emailNotifications ? 'left-[26px]' : 'left-1')} />
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-[1fr_80px_80px] items-center">
            <span className="text-sm font-medium text-gray-500">Notification</span>
            <span className="text-xs font-medium text-gray-400 text-center">Email</span>
            <span className="text-xs font-medium text-gray-400 text-center">Push</span>
          </div>
          {settings.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="px-6 py-5 border-b border-gray-50 grid grid-cols-[1fr_80px_80px] items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>
                {s.id === 'plan_expiry' && <div className="text-xs text-blue-500 mt-0.5">Always enabled</div>}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => toggle(s.id, 'email')}
                  disabled={s.id === 'plan_expiry'}
                  className={'w-10 h-6 rounded-full transition-colors duration-200 relative ' + (s.email ? 'bg-blue-600' : 'bg-gray-200') + (s.id === 'plan_expiry' ? ' opacity-60 cursor-not-allowed' : '')}
                  aria-label={'Toggle email for ' + s.label}
                >
                  <span className={'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ' + (s.email ? 'left-[18px]' : 'left-0.5')} />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  disabled
                  title={PUSH_NOTE}
                  className="w-10 h-6 rounded-full bg-gray-100 relative opacity-40 cursor-not-allowed"
                  aria-label={'Push not yet available for ' + s.label}
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3">Push notifications are coming soon. Email changes apply to enquiry and review alerts.</p>

        <div className="flex items-center justify-end mt-6 gap-3">
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">
              Preferences saved!
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
