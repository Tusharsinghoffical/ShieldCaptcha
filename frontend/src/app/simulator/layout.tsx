import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attack Simulator & Bot Defense Lab",
  description:
    "Simulate headless browsers, linear mouse sweeps, teleportation exploits, and synthetic events against ShieldCaptcha defense layers in real time.",
  alternates: {
    canonical: "/simulator",
  },
  openGraph: {
    title: "Attack Simulator & Lab | ShieldCaptcha",
    description:
      "Simulate headless browsers, linear mouse sweeps, teleportation exploits, and synthetic events against ShieldCaptcha defense layers in real time.",
    url: "/simulator",
  },
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
