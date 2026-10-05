#!/usr/bin/env node

/**
 * ShieldCaptcha Enterprise — IndexNow Protocol Dispatcher
 * Submits indexable canonical URLs to IndexNow (Bing, Yandex, Seznam, Naver).
 * Note: Google does not support IndexNow.
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
if (!INDEXNOW_KEY) {
  console.log("[IndexNow] Skipping submission: INDEXNOW_KEY environment variable is not configured.");
  process.exit(0);
}
const HOST = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
  : "shieldcaptcha.vercel.app";
const SITE_URL = `https://${HOST}`;

const URLS_TO_SUBMIT = [
  `${SITE_URL}/`,
  `${SITE_URL}/demo`,
  `${SITE_URL}/docs`,
  `${SITE_URL}/architecture`,
  `${SITE_URL}/integration`,
  `${SITE_URL}/security`,
  `${SITE_URL}/simulator`,
  `${SITE_URL}/trial`,
  `${SITE_URL}/contact`,
  `${SITE_URL}/privacy`,
  `${SITE_URL}/terms`,
  `${SITE_URL}/cookies`,
];

async function submitIndexNow() {
  console.log(`[IndexNow] Preparing submission for ${HOST}...`);
  console.log(`[IndexNow] URLs to index: ${URLS_TO_SUBMIT.length}`);

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: URLS_TO_SUBMIT,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
      console.log(`[IndexNow] SUCCESS: Submitted ${URLS_TO_SUBMIT.length} URLs (HTTP ${res.status})`);
    } else {
      const text = await res.text();
      console.warn(`[IndexNow] Notice: Received HTTP ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error("[IndexNow] Network error notifying IndexNow API:", err.message);
  }
}

submitIndexNow();
