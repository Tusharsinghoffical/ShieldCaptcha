// Centralized Technical SEO & Metadata Configuration
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://shieldcaptcha.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "ShieldCaptcha";
export const SITE_LEGAL_NAME = "ShieldCaptcha Inc.";
export const SITE_TAGLINE = "Autonomous Bot Defense & Enterprise Proof-of-Work Platform";
export const SITE_DESCRIPTION =
  "Zero-dependency, multi-modal captcha defense system combining cryptographic Proof-of-Work, anti-CV jigsaw puzzles, and biomechanical kinematics analysis.";

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "security@shieldcaptcha.dev";

// Production indexing guard: Staging and previews must NEVER be indexed
export const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

// Indexable, canonical public routes
export const CANONICAL_ROUTES = [
  { path: "", label: "Home", priority: "1.0", changefreq: "weekly" },
  { path: "demo", label: "Interactive Demo", priority: "0.9", changefreq: "weekly" },
  { path: "docs", label: "Documentation", priority: "0.9", changefreq: "weekly" },
  { path: "architecture", label: "Security Architecture", priority: "0.8", changefreq: "monthly" },
  { path: "integration", label: "Framework Integration Hub", priority: "0.8", changefreq: "monthly" },
  { path: "security", label: "Security Policy & Disclosure", priority: "0.8", changefreq: "monthly" },
  { path: "simulator", label: "Attack Simulator & Lab", priority: "0.7", changefreq: "monthly" },
  { path: "trial", label: "Enterprise Trial", priority: "0.7", changefreq: "monthly" },
  { path: "contact", label: "Enterprise Sales & Support", priority: "0.6", changefreq: "monthly" },
  { path: "privacy", label: "Privacy Policy", priority: "0.5", changefreq: "yearly" },
  { path: "terms", label: "Terms of Service", priority: "0.5", changefreq: "yearly" },
  { path: "cookies", label: "Cookie Policy", priority: "0.5", changefreq: "yearly" },
] as const;

// Private / internal paths that must never be indexed
export const PRIVATE_PATHS = [
  "/api",
  "/api-keys",
  "/dashboard",
  "/admin",
  "/login",
  "/search",
  "/internal",
] as const;
