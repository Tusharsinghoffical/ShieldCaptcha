import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Multi-Modal Defense Architecture & Cryptography",
  description:
    "Deep-dive into ShieldCaptcha four-tier defense: Proof-of-Work hash collision, AES-CBC-128 payload encryption, biomechanical kinematics, and sensor telemetry.",
  alternates: {
    canonical: "/architecture",
  },
  openGraph: {
    title: "Security Architecture & Cryptography | ShieldCaptcha",
    description:
      "Deep-dive into ShieldCaptcha four-tier defense: Proof-of-Work hash collision, AES-CBC-128 payload encryption, biomechanical kinematics, and sensor telemetry.",
    url: "/architecture",
  },
};

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
