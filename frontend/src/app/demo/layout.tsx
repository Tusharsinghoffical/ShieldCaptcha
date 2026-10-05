import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Demo & Security Check",
  description:
    "Test 1-Click autonomous Proof-of-Work verification and anti-CV magnetic jigsaw puzzles in real time.",
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    title: "Interactive Captcha Demo | ShieldCaptcha",
    description:
      "Test 1-Click autonomous Proof-of-Work verification and anti-CV magnetic jigsaw puzzles in real time.",
    url: "/demo",
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
