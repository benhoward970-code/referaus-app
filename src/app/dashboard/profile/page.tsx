'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SERVICE_OPTIONS = ['Support Coordination', 'Daily Living', 'Community Access', 'Therapy', 'Allied Health', 'SIL', 'SDA', 'Transport', 'Plan Management', 'Respite', 'Employment Support', 'Early Childhood'];

export default function EditProfilePage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: 'Hunter Disability Services', contactName: 'Sarah Mitchell', email: 'admin@hunterds.com.au', phone: '02 4900 1234', abn: '12 345 678 901',
    description: 'Person-centred daily living support across Newcastle. Specialising in community access, personal care, and independent living skills development.',
    services: ['Support Coordination', 'Daily Living', 'Community Access'],
    suburb: 'Newcastle CBD', state: 'NSW', postcode: '2300',
    website: 'https://hunterds.com.au', openHours: 'Mon-Fri 8am-6pm',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleService = (s: string) => setForm(prev => ({ ...prev, services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s] }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Edit Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Update your listing details</p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="space-y-8">
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Business Information</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Business Name</label><input value={form.businessName} onChange={e => update('businessName', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Contact Name</label><input value={form.contactName} onChange={e => update('contactName', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Phone</label><input value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">ABN</label><input value={form.abn} onChange={e => update('abn', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Website</label><input value={form.website} onChange={e => update('website', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1.5">About Your Business</label><textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
              <div><label className="block text-sm font-medium mb-1.5">Opening Hours</label><input value={form.openHours} onChange={e => update('openHours', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICE_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleService(s)} className={'px-4 py-3 rounded-lg text-sm font-medium border transition-all ' + (form.services.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300')}>{s}</button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Location</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium mb-1.5">Suburb</label><input value={form.suburb} onChange={e => update('suburb', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1.5">State</label><select value={form.state} onChange={e => update('state', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option><option>SA</option><option>TAS</option><option>ACT</option><option>NT</option></select></div>
              <div><label className="block text-sm font-medium mb-1.5">Postcode</label><input value={form.postcode} onChange={e => update('postcode', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Cancel</Link>
            <div className="flex items-center gap-3">
              {saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">Saved successfully!</motion.span>}
              <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
