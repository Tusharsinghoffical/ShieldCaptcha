"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  BookOpen,
  Cpu,
  Flame,
  Layers,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";


export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Live Trial", href: "/" },
    { name: "API & Keys", href: "/api-keys", badge: "v4.2" },
    { name: "Docs", href: "/docs" },
    { name: "Simulator", href: "/simulator" },
    { name: "Integration", href: "/integration" },
    { name: "Architecture", href: "/architecture" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.png?v=5"
                alt="ShieldCaptcha Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                ShieldCaptcha
              </span>
              <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                v4.2
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1 rounded bg-indigo-100 text-indigo-700 leading-tight">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Live Engine Online Dot */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/90 text-slate-600 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-700">Online</span>
              <span className="text-[10px] text-slate-500 font-mono">Defense Active</span>
            </div>


            {/* CTA Button */}
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow transition-all active:scale-95"
            >
              <span>Sign In Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/demo"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-xs"
            >
              Demo
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Engine Status: Operational (Active)</span>
          </div>

          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/api-keys"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Get API Keys &amp; Tokens</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
