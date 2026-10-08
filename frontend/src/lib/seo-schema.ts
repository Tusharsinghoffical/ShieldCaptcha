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
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      caption: `${SITE_NAME} Logo`,
    },
    email: CONTACT_EMAIL,
    sameAs: [
      "https://github.com/Tusharsinghoffical/ShieldCaptcha",
      "https://github.com/Tusharsinghoffical",
      "https://codewithmrsingh.me/",
      "https://www.npmjs.com/package/@shieldcaptcha/core",
      "https://www.npmjs.com/package/@shieldcaptcha/react",
      "https://saathi-bot.vercel.app",
    ],
    founder: {
      "@type": "Person",
      name: "Tushar Singh",
      url: "https://codewithmrsingh.me/",
      jobTitle: "Lead Security Architect & Software Engineer",
      sameAs: [
        "https://github.com/Tusharsinghoffical",
        "https://github.com/tusharsingh-sde",
      ],
    },
    knowsAbout: [
      "CAPTCHA Bot Defense",
      "Cryptographic Proof-of-Work",
      "Biomechanical Kinematics Trajectory Physics",
      "Zero-Cookie GDPR Compliance",
      "Web Security & DDoS Mitigation",
      "Next.js, Node.js, and Python FastAPI Security",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/docs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: "ShieldCaptcha Enterprise",
    applicationCategory: "SecurityApplication",
    applicationSubCategory: "Bot Defense & Captcha Verification",
    operatingSystem: "Cloud, Linux, Node.js, Python, Edge Runtime, Docker, Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    downloadUrl: "https://github.com/Tusharsinghoffical/ShieldCaptcha",
    softwareVersion: "4.2.0",
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Person",
      name: "Tushar Singh",
      url: "https://codewithmrsingh.me/",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "138",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Zero-Cookie Privacy: 100% GDPR, CCPA, and India DPDP Act compliant",
      "Client-Side Multi-Threaded SHA-256 Proof-of-Work (PoW)",
      "Biomechanical Kinematics Trajectory Physics & Jitter Analysis",
      "Anti-Computer-Vision Interlocking Jigsaw Puzzles",
      "HMAC-SHA256 Token Vault with 300s Atomic Replay Protection",
      "Zero-Dependency Native Node.js & Python FastAPI Engines",
      "Lightweight Vanilla JavaScript Web Component (<18KB) and React Hook",
    ],
  };

  const sourceCodeSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "ShieldCaptcha Open Source Bot Defense Engine",
    codeRepository: "https://github.com/Tusharsinghoffical/ShieldCaptcha",
    programmingLanguage: ["TypeScript", "JavaScript", "Python"],
    runtimePlatform: ["Node.js", "Python FastAPI", "Docker", "Browser"],
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Person",
      name: "Tushar Singh",
      url: "https://codewithmrsingh.me/",
    },
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Integrate Free ShieldCaptcha Bot Defense into Websites",
    description:
      "Step-by-step developer tutorial to add autonomous Proof-of-Work human verification without cookies or subscription fees.",
    totalTime: "PT3M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install Client Package or Embed Script",
        text: "Install @shieldcaptcha/react via npm (npm i @shieldcaptcha/react) or embed the standalone script from https://shieldcaptcha.vercel.app/captcha.js in your HTML.",
        url: `${SITE_URL}/docs`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Embed the Protected Form Widget",
        text: "Place the shield-captcha container div (with data-sitekey) or ShieldCaptcha React component in your login or signup form.",
        url: `${SITE_URL}/integration`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Verify HMAC Token on Your Backend",
        text: "Validate the cryptographic authorization token on your backend server by sending a POST request to /api/siteverify with your private SITE_SECRET.",
        url: `${SITE_URL}/docs`,
      },
    ],
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
          text: "ShieldCaptcha is an open-source, zero-dependency autonomous bot defense platform and free CAPTCHA alternative. It combines client-side cryptographic Proof-of-Work (PoW) in Web Workers, anti-computer-vision jigsaw puzzles, and biomechanical drag kinematics analysis to stop bots, scrapers, and credential stuffing without tracking user browsing habits.",
        },
      },
      {
        "@type": "Question",
        name: "Is ShieldCaptcha free to use for websites and developers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, ShieldCaptcha is 100% free and open-source under the MIT license. Developers can self-host the backend engine via Docker, Node.js, or Python, or use free client-side embeddable widgets with zero monthly subscription fees or query limits.",
        },
      },
      {
        "@type": "Question",
        name: "How does ShieldCaptcha compare to Google reCAPTCHA and Cloudflare Turnstile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Unlike Google reCAPTCHA, ShieldCaptcha sets zero tracking cookies, requires no personal user tracking, and eliminates frustrating multi-image quizzes. Unlike Cloudflare Turnstile, ShieldCaptcha is completely open-source, self-hostable on-premises with Docker, and provides transparent Proof-of-Work verification without proprietary vendor lock-in.",
        },
      },
      {
        "@type": "Question",
        name: "How can developers integrate ShieldCaptcha API into React, Next.js, and HTML?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ShieldCaptcha integrates in under 3 minutes. In HTML, include the shield-captcha container element with captcha.js. In React/Next.js, install @shieldcaptcha/react and pass siteKey and onVerify. Then verify the single-use HMAC-SHA256 token on your backend via /api/siteverify.",
        },
      },
      {
        "@type": "Question",
        name: "Shield Captcha kya hota hai aur kaise kaam karta hai? (ShieldCaptcha meaning in Hindi)",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ShieldCaptcha ek aadhunik security tool hai jo websites aur online forms ko automated computer bots, fake spam registrations aur hackers se surakshit rakhta hai. Yeh user ke browser par bina kisi pareshani ke ek cryptographic Proof-of-Work test execute karta hai taaki pata chal sake ki visitor asli insaan hai ya automated bot.",
        },
      },
      {
        "@type": "Question",
        name: "Can automated bot solvers, OCR tools, or headless browsers bypass ShieldCaptcha?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. ShieldCaptcha employs multi-layered defenses: dynamic cryptographic SHA-256 Proof-of-Work difficulty scaling, canvas fingerprint validation, drag acceleration kinematics, and tamper-resistant encrypted challenge responses that block automated solvers including Selenium, Puppeteer, and Playwright.",
        },
      },
      {
        "@type": "Question",
        name: "Why should an organization implement ShieldCaptcha for web security?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Implementing ShieldCaptcha protects registration forms, login portals, payment gateways, and API routes from automated DDoS attacks, brute-force password guessing, ticket scalping, and AI scraper bots while maintaining a seamless, zero-cookie user experience.",
        },
      },
      {
        "@type": "Question",
        name: "How to troubleshoot ShieldCaptcha verification failed or missing token errors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common solutions: 1) Verify that the site key and secret match your environment configuration; 2) Ensure your backend verifies tokens within the 5-minute expiration window; 3) Check that your server allows CORS or proxy routes to /api/siteverify.",
        },
      },
      {
        "@type": "Question",
        name: "Does ShieldCaptcha comply with GDPR, CCPA, and India DPDP Act privacy regulations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. ShieldCaptcha is architected on privacy-by-design principles: it stores zero personally identifiable information (PII), drops zero tracking cookies, and runs Proof-of-Work locally in the browser, making it fully compliant with GDPR, CCPA, and India DPDP Act without requiring cookie consent banners.",
        },
      },
    ],
  };

  return [organizationSchema, websiteSchema, softwareSchema, sourceCodeSchema, howToSchema, faqSchema];
}

export function generateUnifiedSiteSchema() {
  const schemas = generateSiteSchema();
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
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
