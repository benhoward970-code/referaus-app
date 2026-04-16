"use client";
import { LogoMark } from "../../components/Logo";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, isConfigured, submitWaitlist, supabase } from "@/lib/supabase";
import { categories, locations } from "@/lib/providers";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function getPasswordStrength(password: string): { score: number; label: string; color: string; barColor: string } {
  if (!password) return { score: 0, label: "", color: "", barColor: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "text-red-500", barColor: "bg-red-500" };
  if (score === 2) return { score, label: "Fair", color: "text-orange-500", barColor: "bg-orange-500" };
  if (score === 3 || score === 4) return { score, label: "Good", color: "text-yellow-500", barColor: "bg-yellow-500" };
  return { score, label: "Strong", color: "text-green-600", barColor: "bg-green-500" };
}

const PROVIDER_CATEGORIES = categories.filter((c) => c !== "All");
const SERVICE_AREAS = locations.filter((l) => l !== "All Locations");

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
};

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">Step {step} of {total}</span>
        <span className="text-xs font-semibold text-blue-600">{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`text-[10px] font-medium ${i + 1 <= step ? "text-blue-600" : "text-gray-300"}`}
          >
            {["Account", "Business", "Services"][i]}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderMultiStepForm({ initialEmail }: { initialEmail?: string }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1: Email + Password
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Business Name + ABN + Phone
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [phone, setPhone] = useState("");

  // Step 3: Category + Service Area
  const [category, setCategory] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    goNext();
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!businessName.trim()) { setError("Business name is required."); return; }
    goNext();
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!category) { setError("Please select a category."); return; }
    setLoading(true);

    if (!isConfigured()) {
      await submitWaitlist(email, "provider");
      setSuccess(true);
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, { name: businessName, role: "provider" });
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (supabase) {
      const newUser = result.data?.user;
      if (newUser) {
        const slug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const { error: insertErr } = await supabase.from("providers").insert({
          user_id: newUser.id,
          name: businessName,
          slug,
          email,
          phone: phone || null,
          abn: abn || null,
          plan: "free",
          category: category || "Daily Living",
          location: serviceArea || null,
          services: [],
        });
        if (insertErr) {
          console.error("[register] Provider profile insert error:", insertErr.message);
        } else {
          try {
            await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "SYSTEM",
                email: "noreply@referaus.com",
                message: `New provider signup: ${businessName} (${email}). ABN: ${abn || "not provided"}. Category: ${category}. Area: ${serviceArea || "not set"}. Please review at referaus.com/admin`,
                type: "provider-signup",
              }),
            });
          } catch { /* Non-blocking */ }
        }
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!supabase || !email) return;
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setResending(false);
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-black mb-2">Application received!</h2>
        <p className="text-gray-500 text-sm mb-6">
          {!isConfigured()
            ? "We have added you to the waitlist. We will be in touch soon!"
            : "Check your email to verify your account. Your provider profile will be reviewed by our team and approved within 24 hours."}
        </p>
        {isConfigured() && (
          <div className="mb-4">
            {resent ? (
              <p className="text-green-600 text-sm font-medium">Verification email resent!</p>
            ) : (
              <button onClick={handleResendVerification} disabled={resending} className="text-blue-600 hover:text-blue-500 text-sm font-medium underline disabled:opacity-50">
                {resending ? "Sending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}
        <Link href="/login" className="text-blue-600 text-sm hover:text-blue-700">Go to sign in</Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4"><LogoMark /></div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Create Provider Account</h1>
        <p className="text-sm text-gray-500">Join the ReferAus NDIS directory</p>
      </div>
      <div className="glass rounded-2xl p-8">
        <StepIndicator step={step} total={3} />
        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 mb-4">{error}</div>}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.form
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
                onSubmit={handleStep1}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-4">Account credentials</p>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com.au"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.barColor : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</p>
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
                  Continue →
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
                onSubmit={handleStep2}
                className="space-y-4"
              >
                <p className="text-sm font-semibold text-gray-700 mb-4">Business details</p>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Business Name <span className="text-red-400">*</span></label>
                  <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Sunrise Support Services"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">ABN <span className="text-gray-300">(optional)</span></label>
                  <input type="text" value={abn} onChange={e => setAbn(e.target.value)} placeholder="e.g. 12 345 678 901"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone <span className="text-gray-300">(optional)</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 02 1234 5678"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all">
                    ← Back
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
                    Continue →
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
                onSubmit={handleStep3}
                className="space-y-4"
              >
                <p className="text-sm font-semibold text-gray-700 mb-4">Your services</p>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Primary Category <span className="text-red-400">*</span></label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40">
                    <option value="">Select a category…</option>
                    {PROVIDER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Service Area <span className="text-gray-300">(optional)</span></label>
                  <select value={serviceArea} onChange={e => setServiceArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40">
                    <option value="">Select an area…</option>
                    {SERVICE_AREAS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25">
                    {loading ? "Creating…" : "Create Account"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700">Sign in</Link></p>
        </div>
      </div>
    </motion.div>
  );
}

function RegisterFormInner() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "provider" ? "provider" : "participant";
  const [role, setRole] = useState<"participant" | "provider">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const passwordStrength = getPasswordStrength(password);

  // If provider, delegate to multi-step form
  if (role === "provider") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
        <div className="w-full max-w-md relative z-10 text-center mb-4">
          <div className="flex rounded-xl bg-gray-50 p-1 mb-4 max-w-xs mx-auto" role="radiogroup" aria-label="Account type">
            <button onClick={() => setRole("participant")} role="radio" aria-checked={false} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-500">Participant</button>
            <button onClick={() => setRole("provider")} role="radio" aria-checked={true} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-blue-600 text-white">Provider</button>
          </div>
        </div>
        <ProviderMultiStepForm initialEmail={email} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isConfigured()) {
      await submitWaitlist(email, role);
      setSuccess(true);
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, { name, role });
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!supabase || !email) return;
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setResending(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black mb-2">You are in!</h2>
          <p className="text-gray-500 text-sm mb-6">
            {!isConfigured()
              ? "We have added you to the waitlist. We will be in touch soon!"
              : "Check your email to verify your account. Once verified, you can sign in and start using ReferAus."}
          </p>
          {isConfigured() && (
            <div className="mb-4">
              {resent ? (
                <p className="text-green-600 text-sm font-medium">Verification email resent! Check your inbox.</p>
              ) : (
                <button onClick={handleResendVerification} disabled={resending} className="text-blue-600 hover:text-blue-500 text-sm font-medium underline disabled:opacity-50">
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}
          <Link href="/login" className="text-blue-600 text-sm hover:text-blue-700">Go to sign in</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4"><LogoMark /></div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Create your account</h1>
          <p className="text-sm text-gray-500">Join ReferAus today</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <div className="flex rounded-xl bg-gray-50 p-1 mb-6" role="radiogroup" aria-label="Account type">
            <button onClick={() => setRole("participant")} role="radio" aria-checked={true} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 bg-blue-600 text-white">Participant</button>
            <button onClick={() => setRole("provider")} role="radio" aria-checked={false} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 text-gray-500">Provider</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.barColor : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</p>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
              {loading ? "Creating account..." : "Sign Up Free"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700">Sign in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RegisterForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <RegisterFormInner />
    </Suspense>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}
