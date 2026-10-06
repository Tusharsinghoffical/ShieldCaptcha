import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  IS_PRODUCTION,
} from "@/lib/seo-config";
import { generateSiteSchema } from "@/lib/seo-schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

const googleVerificationTokens = Array.from(
  new Set(
    [
      process.env.GOOGLE_SITE_VERIFICATION,
      "3giWkE9xHKCqlp1gXtSOOnXD0hCA5jRvWGLtIftBjVM",
      "dxm-siDTNe7ofrtgj4gPLBnJOJVPLlDn30HpFNnjyoM",
    ].filter(Boolean) as string[]
  )
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "ShieldCaptcha Core Engineering Team" }],
  generator: "Next.js",
  keywords: [
    // Core Bot Defense & Technology
    "captcha",
    "bot defense",
    "proof of work",
    "turnstile alternative",
    "recaptcha alternative",
    "jigsaw captcha",
    "cybersecurity",
    "anti-scraping",
    "enterprise security",

    // ShieldCaptcha Specific Brand & Queries
    "shield captcha",
    "shieldcaptcha",
    "shield captcha app",
    "shield captcha api",
    "shield captcha answer",
    "shield captcha bot",
    "shield captcha code",
    "shield captcha checker",
    "shield captcha code generator",
    "shield captcha demo",
    "shield captcha download",
    "shield captcha extension",
    "shield captcha error",
    "shield captcha example",
    "shield captcha format",
    "shield captcha font",
    "shield captcha failed",
    "shield captcha github",
    "shield captcha generator",
    "shield captcha html",
    "shield captcha issue",
    "shield captcha invalid",
    "shield captcha java",
    "shield captcha key",
    "shield captcha login",
    "shield captcha link",
    "shield captcha logo",
    "shield captcha meaning",
    "shield captcha meaning in hindi",
    "shield captcha kya hota hai",
    "shield captcha kaise bhare",
    "shield captcha not working",
    "shield captcha problem solution",
    "shield captcha plugin",
    "shield captcha react",
    "shield captcha react native",
    "shield captcha verification",
    "shield captcha verification failed",
    "shield captcha test",
    "shield captcha typing",
    "shield captcha open source",
    "shield captcha w3schools",
    "shield captcha xpath",
    "shield captcha xml",
    "shield captcha youtube",

    // Free Captcha & Alternative Solutions
    "free captcha",
    "free captcha solver",
    "free captcha api",
    "free captcha api key",
    "free captcha alternative",
    "free captcha app",
    "free captcha service",
    "free captcha code",
    "free captcha code example",
    "free captcha cloudflare",
    "free captcha for website",
    "free captcha generator",
    "free captcha github",
    "free captcha html",
    "free captcha nextjs",
    "free captcha react",
    "free captcha python",
    "free captcha open source",
    "free captcha verification",
    "free captcha key",
    "best free captcha for website",
    "best free captcha solver",
    "free self hosted captcha",
    "free invisible captcha",
    "free anti captcha",
    "open source free captcha",
    "recaptcha free download",
    "cloudflare free captcha",

    // Security & User Intent Search Questions
    "client side captcha",
    "how shield captcha works",
    "how captcha works",
    "why should a captcha be used in a web application",
    "why should organization implement captcha",
    "is shield captcha safe",
    "does shield captcha work",
    "what is the best captcha to use",
    "what is captcha used for website",
    "can free captcha prevent brute force attack",
    "does captcha prevent ddos",
    "why captcha is not working",
    "who captcha code",
    "is captcha safe",
    "should captcha be case sensitive",
    "top captcha code",
    "best captcha code",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: IS_PRODUCTION,
    follow: IS_PRODUCTION,
    nocache: !IS_PRODUCTION,
    googleBot: {
      index: IS_PRODUCTION,
      follow: IS_PRODUCTION,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Enterprise Bot Defense Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: googleVerificationTokens,
    yandex: process.env.YANDEX_VERIFICATION || undefined,
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION ? [process.env.BING_SITE_VERIFICATION] : [],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemas = generateSiteSchema();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <head>
        {/* Explicit Google Site Verification Meta Tags */}
        <meta name="google-site-verification" content="3giWkE9xHKCqlp1gXtSOOnXD0hCA5jRvWGLtIftBjVM" />
        <meta name="google-site-verification" content="dxm-siDTNe7ofrtgj4gPLBnJOJVPLlDn30HpFNnjyoM" />

        {/* Google Analytics (gtag.js) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Google Tag Manager Container */}
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}

        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans antialiased bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

