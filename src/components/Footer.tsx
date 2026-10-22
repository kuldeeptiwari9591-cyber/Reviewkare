import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold text-base">
                R
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Replyo India</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous Google Review Autopilot & AI QR Code Flow designed specifically for Indian clinics, salons, restaurants, and local businesses.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Google Review Policy Compliant
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-3.5 h-3.5" /> DPDP Act 2023 Compliant (India)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                ⚡ Hosted on Mumbai Servers (Low Latency)
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Review Autopilot</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & UPI AutoPay</Link></li>
              <li><Link href="/free-audit" className="hover:text-white transition-colors">Free Competitor Audit</Link></li>
              <li><Link href="/q/sharma-dent-01" className="hover:text-white transition-colors">Interactive Customer QR</Link></li>
              <li><Link href="/a/sharma-appr-priya-01" className="hover:text-white transition-colors">1-Tap SMS Approval Demo</Link></li>
            </ul>
          </div>

          {/* Col 3: Industries */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Target Niches</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Dental & Skin Clinics</span></li>
              <li><span className="hover:text-white cursor-pointer">Hair Salons & Spas</span></li>
              <li><span className="hover:text-white cursor-pointer">Cafes & Multi-cuisine Restaurants</span></li>
              <li><span className="hover:text-white cursor-pointer">Gyms & Fitness Studios</span></li>
              <li><span className="hover:text-white cursor-pointer">Coaching & Tuition Centres</span></li>
            </ul>
          </div>

          {/* Col 4: Trust & GST */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Billing & Trust</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Plans start at ₹749/month. All plans are billed in Indian Rupees (INR) with 18% GST invoices generated for input tax credit.
            </p>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs">
              <p className="text-slate-300 font-medium mb-1">Founding Member Offer</p>
              <p className="text-slate-400 text-[11px]">First 50 clinics and salons get Growth Plan locked at ₹999/mo for life.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Replyo Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">DPDP Consent</span>
            <span className="hover:text-slate-400 cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
