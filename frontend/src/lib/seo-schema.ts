import {
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SITE_DESCRIPTION,
  CONTACT_EMAIL,
} from "./seo-config";

export function generateSiteSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: CONTACT_EMAIL,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ShieldCaptcha Enterprise",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Cloud, Linux, Node.js, Python, Edge Runtime",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    softwareVersion: "4.2.0",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return [organizationSchema, websiteSchema, softwareSchema];
}

export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path.startsWith("/") ? "" : "/"}${item.path}`,
    })),
  };
}
