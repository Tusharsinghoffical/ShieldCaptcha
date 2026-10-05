#!/usr/bin/env node

/**
 * ShieldCaptcha Enterprise - Cryptographic Key Generator & Rotator
 * Usage:
 *   node scripts/generate-keys.js [--write] [--force]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const siteKey = 'pub_shield_live_' + crypto.randomBytes(12).toString('hex');
const siteSecret = 'sec_shield_live_' + crypto.randomBytes(24).toString('hex');
const captchaSecret = crypto.randomBytes(32).toString('hex');
const adminSecret = crypto.randomBytes(32).toString('hex');
const healthSecret = crypto.randomBytes(18).toString('hex');

console.log('===========================================================');
console.log('ShieldCaptcha Enterprise — Generated Cryptographic Secrets');
console.log('===========================================================');
console.log(`SITE_KEY=${siteKey}`);
console.log(`SITE_SECRET=${siteSecret}`);
console.log(`CAPTCHA_SECRET=${captchaSecret}`);
console.log(`ADMIN_SECRET=${adminSecret}`);
console.log(`HEALTH_CHECK_SECRET=${healthSecret}`);
console.log(`ALLOW_PUBLIC_KEY_GEN=false`);
console.log('===========================================================');

const shouldWrite = process.argv.includes('--write') || process.argv.includes('--init');

if (shouldWrite) {
  const envPath = path.join(__dirname, '..', '.env');
  const examplePath = path.join(__dirname, '..', '.env.example');

  let envTemplate = '';
  if (fs.existsSync(examplePath)) {
    envTemplate = fs.readFileSync(examplePath, 'utf8');
  }

  let finalEnv = envTemplate
    .replace(/SITE_KEY=.*/g, `SITE_KEY=${siteKey}`)
    .replace(/SITE_SECRET=.*/g, `SITE_SECRET=${siteSecret}`)
    .replace(/CAPTCHA_SECRET=.*/g, `CAPTCHA_SECRET=${captchaSecret}`)
    .replace(/ADMIN_SECRET=.*/g, `ADMIN_SECRET=${adminSecret}`)
    .replace(/HEALTH_CHECK_SECRET=.*/g, `HEALTH_CHECK_SECRET=${healthSecret}`)
    .replace(/ALLOW_PUBLIC_KEY_GEN=.*/g, `ALLOW_PUBLIC_KEY_GEN=false`);

  if (!envTemplate) {
    finalEnv = [
      'PORT=3000',
      'FRONTEND_PORT=3001',
      'HOST=0.0.0.0',
      'NODE_ENV=production',
      `SITE_KEY=${siteKey}`,
      `SITE_SECRET=${siteSecret}`,
      `CAPTCHA_SECRET=${captchaSecret}`,
      `ADMIN_SECRET=${adminSecret}`,
      `HEALTH_CHECK_SECRET=${healthSecret}`,
      'ALLOW_PUBLIC_KEY_GEN=false',
      'TRUST_PROXY=true',
      'ALLOWED_ORIGIN=*',
      'CAPTCHA_BACKEND_URL=http://backend:3000'
    ].join('\n') + '\n';
  }

  if (fs.existsSync(envPath) && !process.argv.includes('--force')) {
    console.log(`[INFO] .env already exists at ${envPath}. Use --force to overwrite.`);
  } else {
    fs.writeFileSync(envPath, finalEnv, 'utf8');
    console.log(`[SUCCESS] Generated and saved new production secrets to ${envPath}`);
  }
} else {
  console.log('Tip: Run with --write to automatically create or populate your .env file:');
  console.log('     node scripts/generate-keys.js --write');
}
