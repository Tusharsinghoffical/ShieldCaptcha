"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Code2,
  Lock,
  Cpu,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface FaqItem {
  id: string;
  category: "overview" | "api" | "security" | "troubleshooting";
  question: string;
  answer: string;
  tags: string[];
}

const FAQS: FaqItem[] = [
  {
    id: "what-is-shieldcaptcha",
    category: "overview",
    question: "What is ShieldCaptcha and how does it work?",
    answer:
      "ShieldCaptcha is a high-performance, open-source autonomous bot defense platform and free CAPTCHA alternative. It combines client-side cryptographic Proof-of-Work (PoW), anti-computer-vision jigsaw puzzles, and biomechanical drag kinematics to differentiate genuine human users from automated bots, crawlers, and AI solvers without tracking private user data or requiring invasive cookies.",
    tags: ["shield captcha", "shieldcaptcha", "how captcha works", "proof of work", "bot defense"],
  },
  {
    id: "is-shieldcaptcha-free",
    category: "overview",
    question: "Is ShieldCaptcha completely free to use for websites and apps?",
    answer:
      "Yes! ShieldCaptcha provides a 100% free CAPTCHA service with zero monthly limits for public APIs. You can self-host the core engine using Docker, Node.js, or Python, or use our free cloud-hosted embeddable widgets with instant client keys and server verification secrets.",
    tags: ["free captcha", "free captcha service", "free captcha api", "open source free captcha", "best free captcha for website"],
  },
  {
    id: "shieldcaptcha-vs-recaptcha-turnstile",
    category: "overview",
    question: "Why choose ShieldCaptcha over Google reCAPTCHA and Cloudflare Turnstile?",
    answer:
      "Legacy CAPTCHA solutions like Google reCAPTCHA track browsing habits across domains and frequently lock out legitimate users with frustrating multi-step image grids. Cloudflare Turnstile requires proprietary vendor lock-in. ShieldCaptcha offers transparent open-source code, self-hosting autonomy, GDPR/CCPA privacy compliance, and instant sub-200ms human verification.",
    tags: ["recaptcha alternative", "turnstile alternative", "google captcha free limit", "privacy captcha", "best captcha to use"],
  },
  {
    id: "how-to-integrate-api",
    category: "api",
    question: "How do I integrate ShieldCaptcha with free API keys in React, Next.js, and HTML?",
    answer:
      "Integration takes less than 3 minutes. In HTML/JS, load captcha.js and place `<div id='shield-captcha' data-sitekey='YOUR_KEY'></div>`. In React and Next.js, import our lightweight widget component and handle the onVerify callback. Finally, verify the signed HMAC-SHA256 token on your backend server via POST /api/siteverify.",
    tags: ["shield captcha api", "shield captcha react", "free captcha nextjs", "shield captcha html", "free captcha code example"],
  },
  {
    id: "server-side-verification",
    category: "api",
    question: "What is the difference between client-side and server-side CAPTCHA verification?",
    answer:
      "Client-side CAPTCHA widgets validate user interaction and compute Proof-of-Work puzzles directly in the browser, issuing a cryptographically signed HMAC token. Server-side verification ensures that your backend independently validates this token with your private SITE_SECRET to prevent client-side bypasses or spoofed requests.",
    tags: ["client side captcha", "server side verification", "shield captcha token", "shield captcha verification", "captcha verification free"],
  },
  {
    id: "can-bots-bypass-solvers",
    category: "security",
    question: "Can automated bot solvers, OCR scripts, or AI bypass ShieldCaptcha?",
    answer:
      "Standard automated scripts (Selenium, Puppeteer, Playwright) and headless bots are stopped at multiple layers: 1) Hardware concurrency and canvas fingerprint analysis; 2) Dynamic Proof-of-Work difficulty scaling; 3) Micro-jitter drag kinematic curves that AI and headless scripts cannot replicate; 4) Strict 300-second token replay expiration.",
    tags: ["free captcha solver", "ai captcha solver", "can free captcha be automated", "anti captcha", "captcha solver proxy"],
  },
  {
    id: "brute-force-ddos-protection",
    category: "security",
    question: "Can ShieldCaptcha prevent brute force attacks, credential stuffing, and DDoS?",
    answer:
      "Yes. Every time a client fails or submits high-frequency requests, ShieldCaptcha progressively elevates the cryptographic Proof-of-Work difficulty from 16 bits to 22 bits, forcing attacker CPUs to burn exponential compute cycles and making large-scale distributed brute force attacks economically unviable.",
    tags: ["can free captcha prevent brute force attack", "does captcha prevent ddos", "why should organization implement captcha", "cybersecurity"],
  },
  {
    id: "troubleshoot-verification-failed",
    category: "troubleshooting",
    question: "How to fix 'ShieldCaptcha verification failed' or 'Captcha missing / invalid' issues?",
    answer:
      "Common solutions: 1) Verify that your frontend SITE_KEY matches the backend SITE_SECRET; 2) Ensure system clocks are synchronized (tokens expire in 300 seconds); 3) Confirm your backend reverse proxy (NGINX/Vercel) forwards the true client IP via X-Forwarded-For; 4) Ensure cookies or adblockers are not blocking the local API route /api/verify.",
    tags: ["shield captcha verification failed", "shield captcha not working", "shield captcha problem solution", "shield captcha invalid", "shield captcha error"],
  },
  {
    id: "what-is-shield-captcha-meaning",
    category: "troubleshooting",
    question: "What is ShieldCaptcha meaning in Hindi (Shield Captcha kya hota hai)?",
    answer:
      "ShieldCaptcha ek aadhunik security tool hai jo websites aur online forms ko automated bots, fake spam registrations aur hackers se surakshit (protect) rakhta hai. Yeh user ke device par bina kisi pareshani ke ek halka cryptographic test execute karta hai taaki pata chal sake ki user asli insaan hai ya computer bot.",
    tags: ["shield captcha meaning in hindi", "shield captcha kya hota hai", "shield captcha kaise bhare", "captcha kya hai"],
  },
];

export function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "what-is-shieldcaptcha": true,
    "is-shieldcaptcha-free": true,
  });

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="faq" className="scroll-mt-24 mb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/90 pb-3 mb-8 gap-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Search &amp; Knowledge Base</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions &amp; Technical Reference
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Everything about ShieldCaptcha bot defense, free API implementation &amp; solver resistance
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, keywords (e.g., 'free api', 'react', 'solvers', 'brute force')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Topics" },
            { id: "overview", label: "Overview & Free Alternative" },
            { id: "api", label: "APIs & Integration" },
            { id: "security", label: "Security & Solvers" },
            { id: "troubleshooting", label: "Troubleshooting & Hindi" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching questions found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching for &quot;free captcha&quot;, &quot;api&quot;, or &quot;react&quot;
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 bg-indigo-50 text-indigo-600" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p className="mb-3.5 text-slate-700">{faq.answer}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        Keywords:
                      </span>
                      {faq.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Call to Action & Docs Footnote */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-950/10">
        <div>
          <h3 className="font-black text-base sm:text-lg tracking-tight">
            Ready to protect your website with ShieldCaptcha?
          </h3>
          <p className="text-xs text-indigo-200/80 mt-1">
            Free forever for open web projects. Zero tracking, zero subscription fees.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/demo"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Demo</span>
          </Link>
          <Link
            href="/docs"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow"
          >
            <span>Read Documentation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
