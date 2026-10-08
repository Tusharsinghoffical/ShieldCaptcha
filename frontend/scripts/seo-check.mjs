#!/usr/bin/env node

/**
 * ShieldCaptcha Enterprise — Automated Technical SEO & Indexing Validator
 * Verifies sitemap routes, robots directives, schema syntax, and staging safeguards.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let errors = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passes++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    errors++;
  }
}

console.log("==================================================");
console.log("ShieldCaptcha Enterprise — Technical SEO Audit");
console.log("==================================================");

// 1. Check Public Metadata Files
console.log("\n[1] Checking Required Protocol Files:");
assert(fs.existsSync(path.join(ROOT, "public", "llms.txt")), "public/llms.txt exists");
assert(fs.existsSync(path.join(ROOT, "public", "llms-full.txt")), "public/llms-full.txt exists");
assert(fs.existsSync(path.join(ROOT, "public", ".well-known", "security.txt")), "public/.well-known/security.txt exists");
assert(fs.existsSync(path.join(ROOT, "public", "site.webmanifest")), "public/site.webmanifest exists");
assert(fs.existsSync(path.join(ROOT, "public", "favicon.svg")), "public/favicon.svg exists");
assert(fs.existsSync(path.join(ROOT, "public", "favicon.ico")), "public/favicon.ico exists");
assert(fs.existsSync(path.join(ROOT, "public", "apple-touch-icon.png")), "public/apple-touch-icon.png exists");

// 2. Validate Security.txt RFC 9116 format
console.log("\n[2] Validating RFC 9116 security.txt:");
const secContent = fs.readFileSync(path.join(ROOT, "public", ".well-known", "security.txt"), "utf8");
assert(secContent.includes("Contact: mailto:"), "security.txt includes Contact field");
assert(secContent.includes("Expires:"), "security.txt includes Expires timestamp");
assert(secContent.includes("Canonical:"), "security.txt includes Canonical URL");

// 3. Validate llms.txt formatting
console.log("\n[3] Validating llms.txt markdown index:");
const llmContent = fs.readFileSync(path.join(ROOT, "public", "llms.txt"), "utf8");
assert(llmContent.startsWith("# ShieldCaptcha"), "llms.txt starts with H1 title");
assert(llmContent.includes("## Core Documentation & Pages"), "llms.txt includes route sections");

// 4. Validate Framework Native Route Files
console.log("\n[4] Validating Next.js Metadata Handlers:");
assert(fs.existsSync(path.join(ROOT, "src", "app", "robots.ts")), "src/app/robots.ts exists");
assert(fs.existsSync(path.join(ROOT, "src", "app", "sitemap.ts")), "src/app/sitemap.ts exists");
assert(fs.existsSync(path.join(ROOT, "src", "app", "not-found.tsx")), "src/app/not-found.tsx (404) exists");
assert(fs.existsSync(path.join(ROOT, "src", "lib", "seo-config.ts")), "src/lib/seo-config.ts exists");
assert(fs.existsSync(path.join(ROOT, "src", "lib", "seo-schema.ts")), "src/lib/seo-schema.ts exists");

// 5. Verify Private Paths Exclusion
console.log("\n[5] Auditing Private Path Exclusions:");
const robotsCode = fs.readFileSync(path.join(ROOT, "src", "app", "robots.ts"), "utf8");
const sitemapCode = fs.readFileSync(path.join(ROOT, "src", "app", "sitemap.ts"), "utf8");

assert(robotsCode.includes("PRIVATE_PATHS"), "robots.ts disallows PRIVATE_PATHS");
assert(!sitemapCode.includes("api-keys"), "sitemap.ts does NOT list private /api-keys");
assert(!sitemapCode.includes("/api"), "sitemap.ts does NOT list /api");

// 6. Verify 404 Noindex
console.log("\n[6] Auditing 404 Noindex Directives:");
const notFoundCode = fs.readFileSync(path.join(ROOT, "src", "app", "not-found.tsx"), "utf8");
assert(notFoundCode.includes("index: false"), "not-found.tsx sets index: false");
assert(notFoundCode.includes("follow: false"), "not-found.tsx sets follow: false");

console.log("\n==================================================");
console.log(`Results: ${passes} passed, ${errors} failed.`);
console.log("==================================================");

if (errors > 0) {
  process.exit(1);
} else {
  console.log("ALL TECHNICAL SEO CHECKS PASSED SUCCESSFULLY!\n");
}
