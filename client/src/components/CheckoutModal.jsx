import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, CreditCard, Lock, CheckCircle2, RefreshCw,
  ShieldCheck, ArrowRight, Sparkles, Zap, ExternalLink
} from 'lucide-react';
import { billingAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function CheckoutModal({ isOpen, onClose, plan, billingPeriod, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12 / 28',
    cvc: '123',
    name: 'FlowAI Test User',
  });

  if (!isOpen || !plan) return null;

  const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const annualTotal = billingPeriod === 'yearly' ? price * 12 : null;

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
    return digits;
  };

  // Direct SDK PaymentIntent checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('processing');

    try {
      const res = await billingAPI.upgrade({
        plan: plan.id,
        billing_period: billingPeriod,
        card_last4: cardForm.number.replace(/\s/g, '').slice(-4) || '4242',
        card_brand: 'Visa',
      });

      setStep('success');
      toast.success(res.data.message || 'Payment successful!');
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setStep('form');
      toast.error(err.response?.data?.message || 'Payment processing failed. Please check Stripe credentials.');
    }
  };

  // Hosted Stripe Checkout Session redirect
  const handleHostedCheckout = async () => {
    setIsRedirecting(true);
    try {
      const res = await billingAPI.createCheckoutSession({
        plan: plan.id,
        billing_period: billingPeriod,
      });

      if (res.data?.url) {
        toast.loading('Redirecting to Stripe Hosted Checkout...');
        window.location.href = res.data.url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (err) {
      setIsRedirecting(false);
      toast.error(err.response?.data?.message || 'Failed to start Stripe Checkout Session');
    }
  };

  const handleClose = () => {
    setStep('form');
    setIsRedirecting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6558f5] flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {step === 'success' ? 'Subscription Active!' : 'Stripe Test Mode Checkout'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step === 'success' ? `You're now on the ${plan.name} plan` : 'Real Stripe API SDK (Test Mode)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Success State ─────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5 bg-white">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff4f00] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 mb-1">Welcome to {plan.name}!</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Your workspace has been upgraded. All premium features are now active and ready to use.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Plan</span>
                <span className="text-slate-900 font-bold">{plan.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Amount</span>
                <span className="text-[#ff4f00] font-mono font-bold">${price}/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Billing</span>
                <span className="text-slate-900">{billingPeriod === 'yearly' ? 'Annual (Save 33%)' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active (Stripe Verified)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                handleClose();
                navigate('/app/home');
              }}
              className="btn-primary !py-2.5 !px-8 !text-xs mt-2"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── Processing State ──────────────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-[#6558f5]/10 border border-[#6558f5]/30 flex items-center justify-center text-[#6558f5] mx-auto animate-pulse">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Contacting Stripe Test API...</h4>
            <p className="text-xs text-slate-500">Creating and confirming PaymentIntent via Stripe SDK</p>
          </div>
        )}

        {/* ─── Checkout Form ─────────────────────────────────────────────────── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white">
            {/* Order Summary Bar */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ff4f00]" />
                  <span className="text-sm font-bold text-slate-900">{plan.name} Plan</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">${price}</span>
                  <span className="text-xs text-slate-500">/mo</span>
                </div>
              </div>
              {billingPeriod === 'yearly' && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-semibold">🎉 Yearly billing — Save 33%</span>
                  <span className="text-slate-500">Billed ${annualTotal}/yr</span>
                </div>
              )}
            </div>

            {/* Card Fields */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={cardForm.name}
                  onChange={(e) => setCardForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2.5 px-3.5 text-xs focus:border-[#ff4f00] outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardForm.number}
                    onChange={(e) => setCardForm(f => ({ ...f, number: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-3.5 pr-12 text-xs font-mono focus:border-[#ff4f00] outline-none placeholder:text-slate-400 tracking-wider focus:ring-1 focus:ring-orange-400/20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <div className="w-6 h-4 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-blue-600">VISA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Expiry</label>
                  <input
                    type="text"
                    required
                    placeholder="12 / 28"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                    maxLength={7}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2.5 px-3.5 text-xs font-mono focus:border-[#ff4f00] outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">CVC</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      maxLength={4}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-mono focus:border-[#ff4f00] outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Stripe Test Mode Notice */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  <strong>Stripe Test Mode Active:</strong> Direct communication with Stripe API servers. Uses standard test card (<code>4242 4242 4242 4242</code>).
                </span>
              </div>
            </div>

            {/* Footer / Submit */}
            <div className="px-6 pb-6 pt-2 space-y-2.5">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#6558f5] hover:bg-[#5245e3] text-white font-bold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Subscription — ${price}/mo</span>
              </button>

              <button
                type="button"
                disabled={isRedirecting}
                onClick={handleHostedCheckout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs border border-slate-200 transition-all duration-200"
              >
                {isRedirecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6558f5]" />
                    <span>Opening Stripe Checkout...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6558f5]" />
                    <span>Pay via Official Stripe Checkout Page</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Real Stripe SDK • 256-bit SSL encrypted • Instant activation
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
