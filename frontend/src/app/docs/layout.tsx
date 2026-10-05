import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation & Developer API Reference",
  description:
    "Complete developer integration guides, client SDK setup, REST verification endpoints, and deployment architecture for ShieldCaptcha.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Developer Documentation & API | ShieldCaptcha",
    description:
      "Complete developer integration guides, client SDK setup, REST verification endpoints, and deployment architecture for ShieldCaptcha.",
    url: "/docs",
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
