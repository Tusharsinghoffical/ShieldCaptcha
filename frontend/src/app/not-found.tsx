import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldAlert, ArrowLeft, Home, FileText, Sliders } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The requested security verification resource could not be found.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-2xl mx-auto w-full">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
          HTTP 404 Error
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Resource Not Located
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
          The requested page or endpoint does not exist or has been relocated within the ShieldCaptcha defense infrastructure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <Link
            href="/"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/demo"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all min-h-[44px]"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Try Demo</span>
          </Link>
          <Link
            href="/docs"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all min-h-[44px]"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Documentation</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
