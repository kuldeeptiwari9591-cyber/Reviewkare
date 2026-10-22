'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  QrCode,
  TrendingUp,
  Settings,
  CreditCard,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_LOCATION } from '@/lib/store/db';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'All Reviews', href: '/app/reviews', icon: MessageSquare },
    {
      name: 'Held Approvals',
      href: '/app/approvals',
      icon: AlertTriangle,
      badge: '2',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { name: 'QR Studio', href: '/app/qr', icon: QrCode },
    { name: 'Growth & Competitors', href: '/app/growth', icon: TrendingUp },
    { name: 'Settings & Tone', href: '/app/settings', icon: Settings },
    { name: 'Billing & Plans', href: '/app/billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0">
        <div>
          {/* Active Business Selector */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                D
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-xs text-slate-900 truncate">
                  {INITIAL_LOCATION.name}
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  {INITIAL_LOCATION.area}, {INITIAL_LOCATION.city}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Google Business Profile Connected
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-white text-emerald-800' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quick Links */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/q/sharma-dent-01"
            target="_blank"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            Open Customer QR <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <div className="text-[10px] text-center text-slate-400">
            Autopilot: <span className="text-emerald-600 font-bold">ACTIVE (4-5★)</span>
          </div>
        </div>
      </aside>

      {/* Main App Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
