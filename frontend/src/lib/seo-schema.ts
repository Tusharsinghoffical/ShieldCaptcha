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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is ShieldCaptcha and how does it work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ShieldCaptcha is an open-source, zero-dependency autonomous bot defense platform. It combines cryptographic Proof-of-Work (PoW), anti-computer-vision jigsaw puzzles, and client biomechanical kinematics analysis to prevent automated bots, scrapers, and credential stuffing attacks without tracking private user data.",
        },
      },
      {
        "@type": "Question",
        name: "Is ShieldCaptcha free to use for websites and developers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, ShieldCaptcha is 100% free and open-source. Developers can self-host the backend engine via Docker, Node.js, or Python, or use free client-side embeddable widgets with zero monthly subscription fees.",
        },
      },
      {
        "@type": "Question",
        name: "How does ShieldCaptcha compare to Google reCAPTCHA and Cloudflare Turnstile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Unlike Google reCAPTCHA, ShieldCaptcha does not require third-party cookies, tracking IDs, or vendor lock-in. Unlike Cloudflare Turnstile, ShieldCaptcha is completely self-hostable with full on-premises and private cloud control, providing transparent Proof-of-Work challenges.",
        },
      },
      {
        "@type": "Question",
        name: "How can developers integrate ShieldCaptcha API into React, Next.js, and HTML?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ShieldCaptcha can be added with a single script tag or React component. Simply embed <div id='shield-captcha' data-sitekey='YOUR_KEY'></div> or use the npm package @shieldcaptcha/react, followed by server-side verification using HMAC-SHA256 tokens on /api/verify.",
        },
      },
      {
        "@type": "Question",
        name: "Why should an organization implement ShieldCaptcha for web security?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Implementing ShieldCaptcha protects registration forms, login portals, payment gateways, and API routes from automated DDoS attacks, brute-force password guessing, ticket scalping, and AI scraper bots while maintaining a seamless user experience.",
        },
      },
      {
        "@type": "Question",
        name: "Can automated bot solvers or headless browsers bypass ShieldCaptcha?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. ShieldCaptcha uses multi-layer detection: dynamic cryptographic SHA-256 Proof-of-Work difficulty scaling, canvas fingerprint validation, drag acceleration kinematics, and tamper-resistant encrypted challenge responses that block automated solvers like Selenium, Puppeteer, and Playwright.",
        },
      },
      {
        "@type": "Question",
        name: "How to troubleshoot ShieldCaptcha verification failed or missing token errors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common solutions include: 1) Verify that the site key and secret match your environment configuration; 2) Ensure your backend verifies tokens within the 5-minute expiration window; 3) Check that your server allows CORS or proxy routes to /api/verify.",
        },
      },
    ],
  };

  return [organizationSchema, websiteSchema, softwareSchema, faqSchema];
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
