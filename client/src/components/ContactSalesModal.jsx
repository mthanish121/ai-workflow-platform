import React, { useState } from 'react';
import { X, Mail, Building, User, Sparkles, CheckCircle2, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactSalesModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    taskVolume: '100k - 500k',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('Inquiry submitted! Our solutions engineer will contact you within 4 hours.');
    }, 800);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', company: '', taskVolume: '100k - 500k', notes: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-[#ff4f00] text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#ff4f00]" />
              FlowAI Enterprise Solutions
            </div>
            <h3 className="text-xl font-black text-slate-900">Contact Enterprise Sales</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Custom SLA, dedicated VPC hosting, and high-volume Gemini AI execution.
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">We've received your request!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out, <span className="font-semibold text-slate-900">{form.name || 'valued partner'}</span>. Our technical architecture team will review your specifications and send a tailored plan to <span className="font-mono text-[#ff4f00] font-medium">{form.email}</span> within 4 hours.
            </p>
            <button
              onClick={handleResetAndClose}
              className="btn-primary !py-2.5 !px-6 !text-xs mt-4"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-[#ff4f00] focus:bg-white outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-[#ff4f00] focus:bg-white outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-[#ff4f00] focus:bg-white outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Tasks / Mo</label>
                <select
                  value={form.taskVolume}
                  onChange={e => setForm(f => ({ ...f, taskVolume: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-3 text-xs focus:border-[#ff4f00] focus:bg-white outline-none focus:ring-1 focus:ring-orange-400/20"
                >
                  <option value="50k - 100k">50k – 100k tasks/mo</option>
                  <option value="100k - 500k">100k – 500k tasks/mo</option>
                  <option value="500k - 2M">500k – 2M tasks/mo</option>
                  <option value="2M+">2M+ tasks/mo (Custom Scale)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Requirements & Timeline</label>
              <textarea
                rows={3}
                placeholder="Describe your workflow scale, self-hosted PostgreSQL requirements, or custom integrations..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:border-[#ff4f00] focus:bg-white outline-none placeholder:text-slate-400 resize-none focus:ring-1 focus:ring-orange-400/20"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                NDA & SOC2 compliant
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary !py-2.5 !px-6 !text-xs flex items-center gap-2"
              >
                {submitting ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                ) : (
                  <><span>Send Request</span> <Send className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
