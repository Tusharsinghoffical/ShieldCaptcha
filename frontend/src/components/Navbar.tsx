"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ExternalLink, Zap, Info } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Live Trial", href: "/" },
    { name: "Documentation", href: "/docs" },
    { name: "Attack Simulator", href: "/simulator" },
    { name: "Add to Project", href: "/integration" },
    { name: "How it Works", href: "/architecture" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Informative Top Notification Banner */}
      <div className="w-full bg-indigo-50/70 border-b border-indigo-100/80 py-1.5 px-4 text-center text-[11px] text-indigo-900 font-medium hidden sm:flex items-center justify-center gap-2">
        <span className="font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[10px]">INFO</span>
        <span>ShieldCaptcha v4.0 is active: Protect your website from bots with zero tracking cookies and fast 1-click verification.</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.png?v=5"
                alt="ShieldCaptcha Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-contain p-0.5 transition-transform group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  ShieldCaptcha
                </span>
                <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                  v4.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-none hidden sm:block">
                Smart Human Verification System
              </p>
            </div>
          </Link>
        </div>

        {/* Informative Simple Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Status Indicator & Demo Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
            <span>Engine Active (Port 3000)</span>
          </div>

          <Link
            href="/demo"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm hover:shadow active:scale-95"
          >
            <span>Protected Sign In</span>
            <ExternalLink className="w-3 h-3 text-indigo-200" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
