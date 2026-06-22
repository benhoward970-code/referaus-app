'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

function TwoFactorSection() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === 'verified');
    setMfaEnabled(!!verified);
    if (verified) setFactorId(verified.id);
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!supabase) return;
    setError('');
    setSuccess('');
    setEnrolling(true);

    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'ReferAus Authenticator',
    });

    if (enrollErr) {
      setError(enrollErr.message);
      setEnrolling(false);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
  };

  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !factorId) return;
    setError('');

    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      setError(challengeErr.message);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });

    if (verifyErr) {
      setError('Invalid code. Please try again.');
      setVerifyCode('');
      return;
    }

    setMfaEnabled(true);
    setEnrolling(false);
    setQrCode(null);
    setVerifyCode('');
    setSuccess('Two-factor authentication enabled successfully!');
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !factorId) return;
    setError('');

    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      setError(challengeErr.message);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: disableCode,
    });

    if (verifyErr) {
      setError('Invalid code. Please enter a valid authenticator code.');
      setDisableCode('');
      return;
    }

    const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollErr) {
      setError(unenrollErr.message);
      return;
    }

    setMfaEnabled(false);
    setDisabling(false);
    setFactorId(null);
    setDisableCode('');
    setSuccess('Two-factor authentication disabled.');
  };

  const handleCancelEnroll = async () => {
    if (supabase && factorId && !mfaEnabled) {
      await supabase.auth.mfa.unenroll({ factorId });
    }
    setEnrolling(false);
    setQrCode(null);
    setVerifyCode('');
    setFactorId(null);
    setError('');
  };

  if (loading) {
    return (
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold mb-4">Two-Factor Authentication</h2>
        <div className="animate-pulse h-8 bg-gray-100 rounded w-48" />
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-2">Two-Factor Authentication</h2>
      <p className="text-sm text-gray-500 mb-4">
        Add an extra layer of security to your account using an authenticator app.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-4"
        >
          {success}
        </motion.div>
      )}

      {mfaEnabled && !disabling && (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
            Enabled
          </span>
          <button
            onClick={() => { setDisabling(true); setSuccess(''); setError(''); }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
          >
            Disable 2FA
          </button>
        </div>
      )}

      {mfaEnabled && disabling && (
        <form onSubmit={handleDisable} className="max-w-sm space-y-3">
          <p className="text-sm text-gray-600">Enter your authenticator code to disable 2FA:</p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-center text-xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={disableCode.length !== 6}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
            >
              Confirm Disable
            </button>
            <button
              type="button"
              onClick={() => { setDisabling(false); setDisableCode(''); setError(''); }}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!mfaEnabled && !enrolling && (
        <button
          onClick={handleEnroll}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25"
        >
          Enable 2FA
        </button>
      )}

      {enrolling && qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm space-y-4"
        >
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">1. Scan this QR code with your authenticator app</p>
            <p className="text-xs text-gray-400">(Google Authenticator, Authy, 1Password, etc.)</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="2FA QR Code" width={200} height={200} />
          </div>
          <form onSubmit={handleVerifyEnrollment} className="space-y-3">
            <p className="text-sm font-medium text-gray-600">2. Enter the 6-digit code to confirm:</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-center text-xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={verifyCode.length !== 6}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                Verify & Enable
              </button>
              <button
                type="button"
                onClick={handleCancelEnroll}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </section>
  );
}

function BillingSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openPortal = async () => {
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError('Not logged in.'); setLoading(false); return; }
    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Failed to open billing portal.');
      setLoading(false);
      return;
    }
    window.location.href = json.url;
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-1">Billing & Subscription</h2>
      <p className="text-sm text-gray-500 mb-4">
        Manage your subscription, update your payment method, or view past invoices via the Stripe billing portal.
      </p>
      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600 mb-4">{error}</div>
      )}
      <button
        onClick={openPortal}
        disabled={loading}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
      >
        {loading ? 'Opening...' : 'Manage Billing →'}
      </button>
    </section>
  );
}

function NotificationPreferences() {
  const [prefs, setPrefs] = useState({ newEnquiries: true, newReviews: true, marketingUpdates: true });
  const [savedPrefs, setSavedPrefs] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('referaus_notification_prefs');
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('referaus_notification_prefs', JSON.stringify(prefs));
      setSavedPrefs(true);
      setTimeout(() => setSavedPrefs(false), 2500);
    } catch {}
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-2">Notification Preferences</h2>
      <p className="text-sm text-gray-500 mb-5">Choose what you want to be notified about.</p>
      <div className="space-y-4 max-w-md">
        {[
          { key: 'newEnquiries' as const, label: 'New Enquiries', desc: 'When a participant sends you an enquiry' },
          { key: 'newReviews' as const, label: 'New Reviews', desc: 'When a participant leaves a review on your profile' },
          { key: 'marketingUpdates' as const, label: 'Marketing Updates', desc: 'Platform news, tips, and feature announcements' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${prefs[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all">
          Save Preferences
        </button>
        {savedPrefs && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">Saved!</motion.span>
        )}
      </div>
    </section>
  );
}

function EmailSection() {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setToast({ type: 'error', msg: 'Please enter a valid email address.' });
      return;
    }
    setSaving(true);
    setToast(null);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: error.message });
    } else {
      setToast({ type: 'success', msg: 'Verification email sent to ' + trimmed + '. Click the link to confirm the change.' });
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-1">Account Email</h2>
      <p className="text-sm text-gray-500 mb-4">A verification email will be sent to your new address.</p>
      <form onSubmit={handleSave} className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {toast && (
          <div className={`p-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {toast.msg}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {saving ? 'Sending...' : 'Update Email'}
        </button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (form.newPassword.length < 8) {
      setToast({ type: 'error', msg: 'Password must be at least 8 characters.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setToast({ type: 'error', msg: "Passwords don't match." });
      return;
    }

    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: form.newPassword });
    setSaving(false);

    if (error) {
      setToast({ type: 'error', msg: error.message });
    } else {
      setToast({ type: 'success', msg: 'Password updated successfully.' });
      setForm({ newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-4">You must be logged in to change your password. No current password required.</p>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1.5">New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={e => update('newPassword', e.target.value)}
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => update('confirmPassword', e.target.value)}
            minLength={8}
            placeholder="Enter password again"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {toast && (
          <div className={`p-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {toast.msg}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  );
}

function DangerZone() {
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!supabase) return;
    setDeleting(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError('Not logged in.'); setDeleting(false); return; }
    const res = await fetch('/api/account/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      await supabase.auth.signOut();
      window.location.href = '/?deleted=1';
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Deletion failed. Please contact support@referaus.com.');
      setDeleting(false);
    }
  };

  return (
    <section className="bg-red-50 border border-red-200 rounded-xl p-6">
      <h2 className="font-bold text-red-700 mb-2">Danger Zone</h2>
      <p className="text-sm text-red-600 mb-4">
        Permanently delete your account and all personal data. This cannot be undone.
        Note: Billing records are retained for 7 years as required by Australian tax law.
      </p>
      <p className="text-sm text-red-700 font-medium mb-2">
        Type <strong>DELETE</strong> to confirm:
      </p>
      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="text"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="DELETE"
          className="px-4 py-2.5 rounded-lg border border-red-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 w-40"
        />
        <button
          onClick={handleDelete}
          disabled={confirm !== 'DELETE' || deleting}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-40"
        >
          {deleting ? 'Deleting…' : 'Delete My Account'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Account and security settings</p>

        <div className="space-y-8">
          <EmailSection />
          <PasswordSection />
          <BillingSection />
          <TwoFactorSection />
          <NotificationPreferences />

          <DangerZone />
        </div>
      </motion.div>
    </div>
  );
}
