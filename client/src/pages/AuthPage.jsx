import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import {
  Eye, EyeOff, Lock, Mail, User, ArrowRight,
  Check, ShieldCheck, RefreshCw, Sparkles, Cpu, Layers, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLogin = mode === 'login';

  const defaultEmail = searchParams.get('email') || '';
  const [form, setForm] = useState({ email: defaultEmail, password: '', full_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const unlockInputs = () => { if (isReadOnly) setIsReadOnly(false); };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back to FlowAI! 🎉');
      } else {
        await register(form.email, form.password, form.full_name);
        toast.success('Account created! Welcome to FlowAI 🚀');
      }
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      navigate(redirectUrl);
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Natural Language Prompt Builder',
      desc: 'Describe your pipeline in plain English and let FlowAI generate the steps.',
      icon: Sparkles,
    },
    {
      title: 'Zapier-Style Visual Canvas',
      desc: 'Sequential trigger and action blocks with custom condition branching.',
      icon: Layers,
    },
    {
      title: 'Real-Time Audit Telemetry',
      desc: 'Sub-millisecond execution logs, JSON payload inspection, and instant retry.',
      icon: Cpu,
    },
  ];

  const inputStyle = (field) => ({
    background: '#ffffff',
    border: `1px solid ${focusedField === field ? '#f97316' : '#e2e8f0'}`,
    color: '#0f172a',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(249,115,22,0.12)' : '0 1px 2px rgba(0,0,0,0.05)',
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-50 relative overflow-hidden">
      {/* Subtle warm ambient blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10">

        {/* Left: storytelling column */}
        <div className="lg:col-span-6 space-y-8 text-left hidden lg:block pr-4">
          <Link to="/" className="inline-block transition-transform hover:scale-[1.01]">
            <BrandLogo size="lg" showText={true} showSubtitle={true} />
          </Link>

          <div className="space-y-4">
            <h1 className="text-[38px] lg:text-[44px] font-black tracking-[-0.03em] leading-[1.1] text-slate-900">
              Intelligent workflow automation for modern{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #f97316 0%, #fb923c 60%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                developers &amp; teams.
              </span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Connect webhooks, email triggers, databases, and third-party APIs into visual pipelines
              in seconds with Zapier-style simplicity.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all duration-200 group cursor-default"
              >
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-orange-50 border border-orange-100 text-orange-500 group-hover:scale-110 transition-transform">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {['Free developer tier', 'PostgreSQL · ACID storage', 'Server-side Gemini AI'].map(badge => (
              <span key={badge} className="flex items-center gap-1 text-[10px] font-semibold text-orange-500">
                <Check className="w-3 h-3 stroke-[2.5]" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Right: auth card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Orange top accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

            <div className="p-8 sm:p-10">
              {/* Mobile brand */}
              <div className="lg:hidden flex justify-center mb-7">
                <BrandLogo size="md" showText={true} showSubtitle={true} />
              </div>

              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                    {isLogin ? 'Workspace Login' : 'Create Account'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                  {isLogin ? 'Sign in to FlowAI' : 'Create developer account'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-[13px] mt-2">
                  {isLogin ? "Don't have an account yet? " : 'Already have an account? '}
                  <Link
                    to={isLogin ? '/register' : '/login'}
                    className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    {isLogin ? 'Get started free' : 'Sign in here'}
                  </Link>
                </p>
              </div>

              {/* Error banner */}
              {errors.general && (
                <div className="mb-5 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
                  <span>⚠</span>
                  {errors.general}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                {/* Anti-autofill honeypots */}
                <input type="text" name="fake_user_name" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" autoComplete="off" />
                <input type="password" name="fake_password" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" autoComplete="new-password" />

                {/* Full Name – register only */}
                {!isLogin && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        onFocus={() => { unlockInputs(); setFocusedField('full_name'); }}
                        onBlur={() => setFocusedField(null)}
                        onMouseEnter={unlockInputs}
                        onClick={unlockInputs}
                        readOnly={isReadOnly}
                        placeholder="Jane Doe"
                        required
                        autoComplete="off"
                        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-300 transition-all duration-200"
                        style={inputStyle('full_name')}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => { unlockInputs(); setFocusedField('email'); }}
                      onBlur={() => setFocusedField(null)}
                      onMouseEnter={unlockInputs}
                      onClick={unlockInputs}
                      readOnly={isReadOnly}
                      placeholder="name@company.com"
                      required
                      autoComplete="off"
                      className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-300 transition-all duration-200"
                      style={inputStyle('email')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => toast('Password reset — contact support')}
                        className="text-[10px] font-semibold text-orange-400 hover:text-orange-600 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => { unlockInputs(); setFocusedField('password'); }}
                      onBlur={() => setFocusedField(null)}
                      onMouseEnter={unlockInputs}
                      onClick={unlockInputs}
                      readOnly={isReadOnly}
                      placeholder={isLogin ? '••••••••••••' : 'Minimum 8 characters'}
                      required
                      minLength={isLogin ? 1 : 8}
                      autoComplete={isLogin ? 'off' : 'new-password'}
                      className="w-full rounded-xl py-3 pl-10 pr-11 text-sm outline-none placeholder:text-slate-300 transition-all duration-200"
                      style={inputStyle('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group"
                  style={{
                    background: loading ? '#fdba74' : 'linear-gradient(135deg, #f97316 0%, #fb923c 60%, #f59e0b 100%)',
                    boxShadow: loading ? 'none' : '0 4px 20px -4px rgba(249,115,22,0.5)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(249,115,22,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(249,115,22,0.5)'; }}
                >
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...</>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust footer */}
              <div className="mt-7 pt-5 text-center border-t border-slate-100">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  End-to-end encrypted • Server-side API key isolation
                </p>
              </div>
            </div>
          </div>

          {/* Below-card legal note */}
          <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-slate-500 hover:text-orange-500 cursor-pointer transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="text-slate-500 hover:text-orange-500 cursor-pointer transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
