import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Keys Management — Private Portal",
  description: "Secure cryptographic key vault and tenant management for ShieldCaptcha.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ApiKeysLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
