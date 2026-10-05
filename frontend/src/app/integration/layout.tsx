import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration Hub — SDKs for React, Next.js, Node.js & Python",
  description:
    "Zero-dependency integration code samples and copy-paste packages for Next.js, React, Node.js, Express, Python FastAPI, and HTML scripts.",
  alternates: {
    canonical: "/integration",
  },
  openGraph: {
    title: "Integration Hub | ShieldCaptcha",
    description:
      "Zero-dependency integration code samples and copy-paste packages for Next.js, React, Node.js, Express, Python FastAPI, and HTML scripts.",
    url: "/integration",
  },
};

export default function IntegrationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
