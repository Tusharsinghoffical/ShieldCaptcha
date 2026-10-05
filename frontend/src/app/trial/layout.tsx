import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free Enterprise Trial",
  description:
    "Launch ShieldCaptcha in your environment in under 5 minutes with full access to multi-modal PoW, jigsaw puzzles, and threat analytics.",
  alternates: {
    canonical: "/trial",
  },
  openGraph: {
    title: "Start Enterprise Trial | ShieldCaptcha",
    description:
      "Launch ShieldCaptcha in your environment in under 5 minutes with full access to multi-modal PoW, jigsaw puzzles, and threat analytics.",
    url: "/trial",
  },
};

export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
