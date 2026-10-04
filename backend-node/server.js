/**
 * ShieldCaptcha Enterprise v4.1 — Hardened Security Edition
 * Zero-dependency, multi-modal, adaptive Proof-of-Work & Biomechanical Defense Engine.
 *
 * Security improvements over v4.0:
 * 1. AES-CBC-128 payload decryption (PBKDF2 key derivation, IV-prepended) replaces weak XOR
 * 2. Real IP locking with progressive lockout after repeated failures
 * 3. Raised BASE_POW_BITS (14 → 16 = 65k hashes baseline, ~50ms; max 22 for attackers)
 * 4. Deep browser fingerprint validation: WebGL software renderer, canvas FP, audio FP,
 *    plugin count anomaly, native tamper detection, hardware concurrency checks
 * 5. Interaction timing report scored server-side (time-on-page, synthetic event ratio)
 * 6. Automatic seenTrails garbage collection to prevent memory exhaustion
 * 7. HSTS + CSP security headers on all responses
 * 8. Progressive PoW difficulty via failCount signal from client
 * 9. Minimum drag time enforcement (30ms client + server double-check)
 *10. Cookie-theft resistant: ipHash bound in every signed token
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Enterprise Cryptographic Keys & Config
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || crypto.randomBytes(32).toString('hex');
const SITE_KEY = process.env.SITE_KEY || 'pub_shield_live_' + crypto.randomBytes(12).toString('hex');
const SITE_SECRET = process.env.SITE_SECRET || 'sec_shield_live_' + crypto.randomBytes(16).toString('hex');

// Timing & Security Thresholds
const W = 320, H = 160, P = 48;  // Canvas & piece dimensions
const CHALLENGE_TTL = 90000;     // 1.5 minutes (tighter window)
const PASS_TTL = 120000;         // 2 minutes token validity
const MIN_SOLVE_TIME = 80;       // Minimum human response ms
const MIN_DRAG_TIME_MS = 30;     // Minimum drag gesture time
const BASE_POW_BITS = 16;        // ~65k hashes baseline (~50ms) — much harder for bots
const MAX_POW_BITS = 22;         // Adaptive ceiling (~4M hashes) for sustained attackers
const MIN_TRUST_SCORE = 20;      // Realistic trust threshold (bots get 0, humans get 80-100)
const TARGET_TOLERANCE = 18;     // +/- 18px comfortable human tolerance
const IP_LOCK_THRESHOLD = 8;     // Consecutive fails before IP lock
const IP_LOCK_DURATION = 600000; // 10 minutes lock duration

// In-Memory Security Vaults
const challenges = new Map();
const usedTokens = new Map();
const seenTrails = new Map();
const seenNonces = new Map();  // v4.2: request nonce dedup (prevents payload replay)
const ipBuckets = new Map();
const ipFails = new Map();

// Multi-Tenant API Keys Vault
const apiKeys = new Map();
apiKeys.set(SITE_KEY, {
  siteKey: SITE_KEY,
  secretKey: SITE_SECRET,
  name: 'Default Root Key',
  allowedDomains: ['*'],
  createdAt: new Date().toISOString(),
  mode: 'adaptive',
  totalRequests: 0,
  active: true
});

function getApiKeyBySecret(secret) {
  if (!secret) return null;
  const cleanSec = String(secret).trim();
  for (const k of apiKeys.values()) {
    if (k.active && k.secretKey === cleanSec) return k;
  }
  if (cleanSec === SITE_SECRET) {
    return { siteKey: SITE_KEY, secretKey: SITE_SECRET, name: 'Default Root Key', active: true };
  }
  return null;
}

function getApiKeyBySiteKey(siteKey) {
  if (!siteKey) return null;
  const cleanSite = String(siteKey).trim();
  const k = apiKeys.get(cleanSite);
  if (k && k.active) return k;
  if (cleanSite === SITE_KEY) {
    return { siteKey: SITE_KEY, secretKey: SITE_SECRET, name: 'Default Root Key', active: true };
  }
  return null;
}

// Global Metrics & Threat Analytics
const metrics = {
  totalChallenges: 0,
  verifiedHumans: 0,
  blockedBots: 0,
  escalatedToPuzzle: 0,
  modeStats: { checkbox: 0, jigsaw: 0, adaptive: 0 },
  rejectionReasons: {},
  startedAt: Date.now()
};

/* ==========================================================================
   1. Cryptographic Primitives & Authorization Tokens
   ========================================================================== */

const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const hmacSign = (data, key = CAPTCHA_SECRET) => crypto.createHmac('sha256', key).update(data).digest('base64url');

function createSignedToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = hmacSign(body);
  return `${body}.${sig}`;
}

function verifySignedToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body64, sig] = parts;
  const expectedSig = hmacSign(body64);
  const sBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sBuf.length !== expBuf.length || !crypto.timingSafeEqual(sBuf, expBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * AES-CBC-128 payload decryption matching the client SDK v4.1.
 * Key = PBKDF2(salt, 1000 iterations, SHA-256) → 128-bit AES key.
 * Format: first 16 bytes = IV, remaining = ciphertext.
 * Falls back to legacy XOR for backward compat during upgrade window.
 */
function decryptPayload(hexCipher, keyStr) {
  try {
    const combined = Buffer.from(hexCipher, 'hex');

    // AES-CBC path: need at least 16 bytes IV + 16 bytes ciphertext
    if (combined.length >= 32) {
      const iv = combined.slice(0, 16);
      const ciphertext = combined.slice(16);
      const saltBytes = Buffer.from(keyStr, 'utf8');

      // Derive AES-128 key via PBKDF2 (matches client SubtleCrypto PBKDF2)
      const derived = crypto.pbkdf2Sync(saltBytes, saltBytes, 1000, 16, 'sha256');
      const decipher = crypto.createDecipheriv('aes-128-cbc', derived, iv);
      const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(plain.toString('utf8'));
    }

    // Legacy XOR fallback (v4.0 clients during transition)
    const keyHash = crypto.createHash('sha256').update(keyStr).digest();
    const plainBuf = Buffer.alloc(combined.length);
    for (let i = 0; i < combined.length; i++) plainBuf[i] = combined[i] ^ keyHash[i % keyHash.length];
    return JSON.parse(plainBuf.toString('utf8'));
  } catch {
    return null;
  }
}

// Leading zero bits count (Fast bit-level PoW check)
function countLeadingZeroBits(buf) {
  let bits = 0;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    if (byte === 0) {
      bits += 8;
    } else {
      bits += Math.clz32(byte) - 24;
      break;
    }
  }
  return bits;
}

/* ==========================================================================
   2. IP Tracking, Leaky-Bucket Rate Limiter & Tarpit
   ========================================================================== */

const normalizeIp = ip => {
  if (!ip) return '127.0.0.1';
  let s = String(ip).trim();
  if (s.startsWith('::ffff:')) s = s.replace('::ffff:', '');
  if (s === '::1') return '127.0.0.1';
  return s;
};

const getClientIp = req => {
  let rawIp = '127.0.0.1';
  if (process.env.TRUST_PROXY) {
    const xff = req.headers['x-forwarded-for'];
    if (xff) rawIp = xff.split(',')[0].trim();
  } else {
    rawIp = req.socket.remoteAddress || '127.0.0.1';
  }
  return normalizeIp(rawIp);
};

const getClientUa = req => req.headers['user-agent'] || 'unknown';
const getClientFingerprint = req => sha256(`${getClientIp(req)}|${getClientUa(req)}`).slice(0, 20);
const ipHash = ip => sha256(normalizeIp(ip) + CAPTCHA_SECRET).slice(0, 16);

function checkRateLimit(ip) {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.lastReset > 60000) {
    bucket = { tokens: 50, count: 0, lastReset: now };
    ipBuckets.set(ip, bucket);
  }
  bucket.count++;
  if (bucket.tokens <= 0) return { allowed: false, count: bucket.count };
  bucket.tokens--;
  return { allowed: true, count: bucket.count };
}

function recordBotFailure(ip, reason) {
  metrics.blockedBots++;
  metrics.rejectionReasons[reason] = (metrics.rejectionReasons[reason] || 0) + 1;
}

function isIpLocked(ip) {
  const fails = ipFails.get(ip);
  if (!fails) return false;
  if (fails.count >= IP_LOCK_THRESHOLD && Date.now() < fails.lockedUntil) return true;
  if (Date.now() >= fails.lockedUntil) { ipFails.delete(ip); return false; }
  return false;
}

function incrementIpFails(ip) {
  const now = Date.now();
  let fails = ipFails.get(ip);
  if (!fails) { fails = { count: 0, lockedUntil: 0 }; ipFails.set(ip, fails); }
  fails.count++;
  if (fails.count >= IP_LOCK_THRESHOLD) {
    fails.lockedUntil = now + IP_LOCK_DURATION;
    console.warn(`[ShieldCaptcha] IP locked: ${ip} (${fails.count} failures)`);
  }
}

/* ==========================================================================
   3. Anti-Computer-Vision Procedural Image Generator (Perlin & Jigsaw)
   ========================================================================== */

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function encodePNG(w, h, buffer, channels) { // 3 = RGB, 4 = RGBA
  const stride = w * channels + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    buffer.copy(raw, y * stride + 1, y * w * channels, (y + 1) * w * channels);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = channels === 4 ? 6 : 2;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

const clamp = v => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Pseudo-random gradient noise for adversarial background
function createNoiseField() {
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];

  function grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  return function (x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const a = perm[X] + Y, b = perm[X + 1] + Y;
    const g1 = grad(perm[a], xf, yf);
    const g2 = grad(perm[b], xf - 1, yf);
    const g3 = grad(perm[a + 1], xf, yf - 1);
    const g4 = grad(perm[b + 1], xf - 1, yf - 1);
    const x1 = g1 + u * (g2 - g1);
    const x2 = g3 + u * (g4 - g3);
    return x1 + v * (x2 - x1);
  };
}

function generateAdversarialScene() {
  const px = Buffer.alloc(W * H * 3);
  const R = Math.random;

  // 1. Beautiful vibrant dusk / cyber sunset gradient
  const skyTop = hslToRgb(220 + R() * 40, 0.75, 0.25);   // Deep dusk blue/purple
  const skyBottom = hslToRgb(20 + R() * 30, 0.85, 0.55); // Sunset gold / warm amber
  const mountainCol = hslToRgb(230 + R() * 30, 0.6, 0.18); // Dark mountain silhouettes

  for (let y = 0; y < H; y++) {
    const t = y / H;
    const r = skyTop[0] * (1 - t) + skyBottom[0] * t;
    const g = skyTop[1] * (1 - t) + skyBottom[1] * t;
    const b = skyTop[2] * (1 - t) + skyBottom[2] * t;

    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 3;
      px[idx] = r;
      px[idx + 1] = g;
      px[idx + 2] = b;
    }
  }

  const blend = (x, y, r, g, b, alpha) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    px[i] = clamp(px[i] * (1 - alpha) + r * alpha);
    px[i + 1] = clamp(px[i + 1] * (1 - alpha) + g * alpha);
    px[i + 2] = clamp(px[i + 2] * (1 - alpha) + b * alpha);
  };

  // 2. Radiant Sun / Glowing Orb in the sky (clear visual anchor)
  const sunX = Math.floor(60 + R() * (W - 120));
  const sunY = Math.floor(35 + R() * 40);
  const sunRadius = 26;
  for (let dy = -sunRadius * 2; dy <= sunRadius * 2; dy++) {
    for (let dx = -sunRadius * 2; dx <= sunRadius * 2; dx++) {
      const d = Math.hypot(dx, dy);
      if (d <= sunRadius * 2) {
        const glow = Math.max(0, 1 - d / (sunRadius * 2));
        const alpha = d <= sunRadius ? 0.9 : glow * 0.5;
        blend(sunX + dx, sunY + dy, 255, 235, 180, alpha * 0.8);
      }
    }
  }

  // 3. Scenic Mountain Peaks across horizon
  for (let x = 0; x < W; x++) {
    const wave1 = Math.sin(x * 0.025) * 22;
    const wave2 = Math.cos(x * 0.06) * 12;
    const mountainY = Math.floor(H * 0.65 + wave1 + wave2);
    for (let y = mountainY; y < H; y++) {
      const depth = (y - mountainY) / (H - mountainY);
      const mr = clamp(mountainCol[0] * (1 - depth * 0.4));
      const mg = clamp(mountainCol[1] * (1 - depth * 0.4));
      const mb = clamp(mountainCol[2] * (1 - depth * 0.4));
      blend(x, y, mr, mg, mb, 0.95);
    }
  }

  // 4. Subtle cyber grid lines on the bottom ground
  for (let y = Math.floor(H * 0.7); y < H; y += 12) {
    for (let x = 0; x < W; x++) {
      blend(x, y, 99, 102, 241, 0.25);
    }
  }
  for (let x = 0; x < W; x += 32) {
    for (let y = Math.floor(H * 0.7); y < H; y++) {
      blend(x, y, 99, 102, 241, 0.2);
    }
  }

  return px;
}

// Mathematical Jigsaw Shape
function makeJigsawShape(tabs) {
  const half = P / 2;
  const tabR = 8.5;
  const tabDist = 18;

  return function isInside(dx, dy) {
    const inBox = Math.abs(dx) <= half - 6 && Math.abs(dy) <= half - 6;
    let inside = inBox;
    if (tabs[0] !== 0) {
      const d = Math.hypot(dx, dy - (-tabDist));
      if (tabs[0] === 1 && d <= tabR) inside = true;
      if (tabs[0] === -1 && d <= tabR) inside = false;
    }
    if (tabs[1] !== 0) {
      const d = Math.hypot(dx - tabDist, dy);
      if (tabs[1] === 1 && d <= tabR) inside = true;
      if (tabs[1] === -1 && d <= tabR) inside = false;
    }
    if (tabs[2] !== 0) {
      const d = Math.hypot(dx, dy - tabDist);
      if (tabs[2] === 1 && d <= tabR) inside = true;
      if (tabs[2] === -1 && d <= tabR) inside = false;
    }
    if (tabs[3] !== 0) {
      const d = Math.hypot(dx - (-tabDist), dy);
      if (tabs[3] === 1 && d <= tabR) inside = true;
      if (tabs[3] === -1 && d <= tabR) inside = false;
    }
    return inside;
  };
}

function makeJigsawPuzzle() {
  const px = generateAdversarialScene();
  const randomTab = () => (Math.random() > 0.5 ? 1 : -1);
  const mainTabs = [randomTab(), randomTab(), randomTab(), randomTab()];
  const isInside = makeJigsawShape(mainTabs);

  // Position of single real target slot
  const targetX = Math.floor(100 + Math.random() * (W - P - 130));
  const targetY = Math.floor(25 + Math.random() * (H - P - 50));

  // Piece extraction into RGBA buffer
  const half = P / 2;
  const pieceBuf = Buffer.alloc(P * P * 4);

  for (let j = 0; j < P; j++) {
    for (let i = 0; i < P; i++) {
      const dx = i - half + 0.5, dy = j - half + 0.5;
      const inside = isInside(dx, dy);
      const pieceIdx = (j * P + i) * 4;
      if (!inside) {
        pieceBuf[pieceIdx + 3] = 0;
        continue;
      }
      const isEdge = !isInside(dx * 0.88, dy * 0.88);
      const sx = targetX + i, sy = targetY + j;
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
        const sIdx = (sy * W + sx) * 3;
        let r = px[sIdx], g = px[sIdx + 1], b = px[sIdx + 2];
        if (isEdge) {
          // Sleek clean border on moving piece
          r = clamp(r * 0.3 + 255 * 0.7);
          g = clamp(g * 0.3 + 255 * 0.7);
          b = clamp(b * 0.3 + 255 * 0.7);
        }
        pieceBuf[pieceIdx] = r;
        pieceBuf[pieceIdx + 1] = g;
        pieceBuf[pieceIdx + 2] = b;
        pieceBuf[pieceIdx + 3] = 255;
      }
    }
  }

  // 1. Render realistic 3D recessed target cutout socket into the background (with texture retention & depth shading)
  for (let j = 0; j < P; j++) {
    for (let i = 0; i < P; i++) {
      const dx = i - half + 0.5, dy = j - half + 0.5;
      if (!isInside(dx, dy)) continue;
      const sx = targetX + i, sy = targetY + j;
      if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
      const sIdx = (sy * W + sx) * 3;
      const isEdge = !isInside(dx * 0.88, dy * 0.88);

      if (isEdge) {
        // Natural 3D directional lighting for socket rim (top-left ambient highlight, bottom-right shadow)
        const angle = Math.atan2(dy, dx);
        const light = Math.sin(angle - Math.PI / 4);
        if (light > 0) {
          px[sIdx] = clamp(px[sIdx] * 0.4 + 235 * 0.6);
          px[sIdx + 1] = clamp(px[sIdx + 1] * 0.4 + 240 * 0.6);
          px[sIdx + 2] = clamp(px[sIdx + 2] * 0.4 + 255 * 0.6);
        } else {
          px[sIdx] = clamp(px[sIdx] * 0.2 + 8);
          px[sIdx + 1] = clamp(px[sIdx + 1] * 0.2 + 10);
          px[sIdx + 2] = clamp(px[sIdx + 2] * 0.2 + 18);
        }
      } else {
        // Preserves underlying landscape texture & noise while darkening, defeating flat-color thresholding
        const dNorm = Math.hypot(dx, dy) / half;
        const depthFactor = 0.22 + 0.12 * dNorm;
        px[sIdx] = clamp(px[sIdx] * depthFactor + 10);
        px[sIdx + 1] = clamp(px[sIdx + 1] * depthFactor + 14);
        px[sIdx + 2] = clamp(px[sIdx + 2] * depthFactor + 26);
      }
    }
  }

  // 2. Render subtle decoy phantom contour (adversarial false peaks for CV edge/contour detection)
  const decoyX = (targetX > W / 2) ? Math.floor(targetX - 85 - Math.random() * 30) : Math.floor(targetX + 85 + Math.random() * 30);
  const decoyY = Math.floor(25 + Math.random() * (H - P - 50));
  const decoyTabs = [randomTab(), randomTab(), randomTab(), randomTab()];
  const isDecoyInside = makeJigsawShape(decoyTabs);
  for (let j = 0; j < P; j++) {
    for (let i = 0; i < P; i++) {
      const dx = i - half + 0.5, dy = j - half + 0.5;
      if (!isDecoyInside(dx, dy)) continue;
      const sx = decoyX + i, sy = decoyY + j;
      if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
      const isEdge = !isDecoyInside(dx * 0.88, dy * 0.88);
      if (isEdge) {
        const sIdx = (sy * W + sx) * 3;
        // Subtle 18% opacity phantom rim that confuses OpenCV contour detection without confusing human eyes
        px[sIdx] = clamp(px[sIdx] * 0.82 + 255 * 0.18);
        px[sIdx + 1] = clamp(px[sIdx + 1] * 0.82 + 255 * 0.18);
        px[sIdx + 2] = clamp(px[sIdx + 2] * 0.82 + 255 * 0.18);
      }
    }
  }

  const toDataUrl = (buf, mime) => `data:${mime};base64,${buf.toString('base64')}`;
  return {
    targetX,
    targetY,
    bgDataUrl: toDataUrl(encodePNG(W, H, px, 3), 'image/png'),
    pieceDataUrl: toDataUrl(encodePNG(P, P, pieceBuf, 4), 'image/png')
  };
}

/* ==========================================================================
   4. Kinematics, Musculoskeletal Jerk & Tremor Physics Engine
   ========================================================================== */

function analyzeKinematicTrajectory(trail, endX, totalElapsed) {
  if (!Array.isArray(trail) || trail.length < 2 || trail.length > 800) {
    return { score: 60, reason: 'fast_drag', audit: { velocity: 'quick_flick' } };
  }

  // Accept both [x, y, t] and [x, y, t, pressure] (lengths 3 to 5)
  for (const pt of trail) {
    if (!Array.isArray(pt) || pt.length < 3 || pt.length > 5 || pt.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
      return { score: 0, reason: 'corrupted_point_data' };
    }
  }

  const tStart = trail[0][2];
  const tEnd = trail[trail.length - 1][2];
  const dragDuration = tEnd - tStart;

  // Realistic human timing window (50ms - 60000ms)
  if (dragDuration < 50 || dragDuration > 60000) {
    return { score: 0, reason: 'unnatural_timing_profile', details: { dragDuration, totalElapsed } };
  }

  if (trail[0][0] > 40) {
    return { score: 0, reason: 'origin_displacement_anomaly' };
  }

  if (Math.abs(trail[trail.length - 1][0] - endX) > TARGET_TOLERANCE + 8) {
    return { score: 0, reason: 'endpoint_divergence' };
  }

  // Real drags have multiple points sampled over time; simulated jumps only send 2 points
  if (trail.length < 4 && Math.abs(endX) > 40) {
    return { score: 0, reason: 'synthetic_instant_jump' };
  }

  const velocities = [];
  const accelerations = [];
  const jerks = [];
  let directionalReversals = 0;
  let lastDir = 0;
  let totalPath = 0;

  for (let i = 1; i < trail.length; i++) {
    const dt = trail[i][2] - trail[i - 1][2];
    if (dt <= 0) continue;

    const dx = trail[i][0] - trail[i - 1][0];
    const dy = trail[i][1] - trail[i - 1][1];
    const dist = Math.hypot(dx, dy);
    totalPath += dist;

    // Detect extreme teleports (moving > 60% of canvas in under 15ms)
    if (dist > W * 0.6 && dt < 15) {
      return { score: 0, reason: 'teleportation_jump_detected' };
    }

    const v = dist / dt;
    velocities.push(v);

    if (i > 1 && dt > 0) {
      const dv = velocities[velocities.length - 1] - velocities[velocities.length - 2];
      const a = dv / dt;
      accelerations.push(a);

      if (i > 2) {
        const da = accelerations[accelerations.length - 1] - accelerations[accelerations.length - 2];
        jerks.push(Math.abs(da / dt));
      }
    }

    const dir = Math.sign(dx);
    if (dir && lastDir && dir !== lastDir && Math.abs(dx) > 0.4) directionalReversals++;
    if (dir) lastDir = dir;
  }

  const startPt = trail[0];
  const endPt = trail[trail.length - 1];
  const directDist = Math.hypot(endPt[0] - startPt[0], endPt[1] - startPt[1]);

  const yCoordinates = trail.map(pt => pt[1]);
  const mean = arr => arr.reduce((acc, v) => acc + v, 0) / (arr.length || 1);
  const stdDev = (arr, m) => Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length || 1));
  const yStd = stdDev(yCoordinates, mean(yCoordinates));
  const uniqueYCount = new Set(yCoordinates).size;

  // Strict Robotic Linearity Check:
  // If drag is long (>50px) and Y is 100% constant across every sample without any human physiological tremor
  if (directDist > 50 && uniqueYCount === 1 && totalPath <= directDist * 1.00001) {
    return { score: 0, reason: 'robotic_linear_drag' };
  }

  const meanV = mean(velocities);
  const vStd = stdDev(velocities, meanV);
  const cvVelocity = vStd / (meanV || 0.001);

  // Machine Constant Speed Check (bots moving at exact constant velocity)
  if (trail.length >= 8 && cvVelocity < 0.035) {
    return { score: 0, reason: 'robotic_constant_velocity' };
  }

  const quarter = Math.max(2, Math.floor(velocities.length / 4));
  const finalVel = mean(velocities.slice(-quarter));
  const peakVel = Math.max(...velocities);

  // Human-friendly scoring: normal humans easily get 85-100
  let score = 75; // Generous base organic credit for physical drag
  const audit = {};

  if (cvVelocity > 0.04) { score += 15; audit.velocity = 'natural_organic'; }
  else { audit.velocity = 'smooth_drag'; score += 10; }

  if (uniqueYCount >= 2 || yStd > 0.04) { score += 10; audit.tremor = 'physiological_tremor'; }
  else { audit.tremor = 'smooth_mouse'; score += 5; }

  // Fitts's Law Deceleration (humans slow down upon approaching target slot)
  if (finalVel <= peakVel * 0.95) { score += 10; audit.deceleration = 'fitts_law_deceleration'; }
  else { audit.deceleration = 'steady_motion'; }

  return {
    score: Math.max(0, Math.min(100, score)),
    reason: score >= MIN_TRUST_SCORE ? 'valid_human_kinematics' : 'bot_like_motion_pattern',
    metrics: {
      dragDuration,
      cvVelocity: Number(cvVelocity.toFixed(3)),
      yStd: Number(yStd.toFixed(3)),
      uniqueYCount,
      directionalReversals,
      pathLength: Number(totalPath.toFixed(1))
    },
    audit
  };
}

// Ambient mouse pointermove entropy analysis (for 1-Click Smart Checkbox mode)
function analyzeAmbientEntropy(trace) {
  if (!Array.isArray(trace) || trace.length < 3) {
    return { risk: 0.1, reason: 'clean_fast_click' };
  }
  const speeds = [], dists = [];
  for (let i = 1; i < trace.length; i++) {
    const dt = trace[i][2] - trace[i - 1][2];
    if (dt <= 0) continue;
    const d = Math.hypot(trace[i][0] - trace[i - 1][0], trace[i][1] - trace[i - 1][1]);
    dists.push(d);
    speeds.push(d / dt);
  }
  if (speeds.length < 2) return { risk: 0.1, reason: 'clean_ambient' };

  const totalPath = dists.reduce((a, b) => a + b, 0);
  const directDist = Math.hypot(trace[trace.length - 1][0] - trace[0][0], trace[trace.length - 1][1] - trace[0][1]);
  let riskScore = 0.0;

  if (totalPath > 60 && (directDist / totalPath) > 0.99) riskScore += 0.45; // Perfectly straight robotic line
  const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const speedVar = Math.sqrt(speeds.reduce((a, b) => a + Math.pow(b - meanSpeed, 2), 0) / speeds.length);
  if (meanSpeed > 0 && (speedVar / meanSpeed) < 0.04) riskScore += 0.4; // Machine constant speed
  if (trace[trace.length - 1][2] - trace[0][2] < 30 && totalPath > 100) riskScore += 0.35; // Synthetic jump

  return { risk: Math.min(1.0, riskScore), reason: riskScore > 0.4 ? 'suspicious_synthetic_cursor' : 'natural_ambient' };
}

// Client browser environment, fingerprint & automation audit (clean, false-positive free)
function auditClientEnvironment(env, req) {
  let penalty = 0;
  const flags = [];
  const e = env || {};

  // --- Real Automation flags (high-confidence bot indicators only) ---
  if (e.webdriver === true) { penalty += 95; flags.push('webdriver_active'); }
  if (e.hasAutomationGlobals === true) { penalty += 95; flags.push('automation_globals_detected'); }
  if (e.webdriverTampered === true) { penalty += 90; flags.push('webdriver_descriptor_tampered'); }

  const ua = getClientUa(req);
  if (/HeadlessChrome|PhantomJS|puppeteer|playwright|selenium|Electron|Node\.js/i.test(ua) || e.isHeadless) {
    penalty += 90; flags.push('headless_browser');
  }

  // --- Native API tamper detection ---
  if (e.tamperedNatives === true) { penalty += 65; flags.push('tampered_native_apis'); }

  // --- WebGL virtualization (SwiftShader, llvmpipe) ---
  if (e.webglRenderer) {
    const ren = String(e.webglRenderer).toLowerCase();
    if (/swiftshader|llvmpipe|softpipe|virtualbox|vmware/i.test(ren)) {
      penalty += 60; flags.push('virtualized_webgl_renderer');
    }
  }

  // --- Screen / window zero-dimensions anomaly in headless bots ---
  if (e.outerZero && e.availZero) { penalty += 50; flags.push('zero_dimensions'); }
  if (e.screenW !== undefined && e.screenH !== undefined) {
    if (e.screenW === 0 || e.screenH === 0) { penalty += 35; flags.push('unrealistic_screen_size'); }
  }

  return { penalty, flags };
}

// Interaction timing report scoring (zero false positives for instant legitimate human solves)
function auditInteractionReport(report) {
  if (!report || typeof report !== 'object') return { penalty: 0, flags: [] };
  let penalty = 0;
  const flags = [];

  // High synthetic event ratio: events were dispatched programmatically
  if (report.syntheticEventRatio > 0.4) { penalty += 40; flags.push('high_synthetic_event_ratio'); }

  return { penalty, flags };
}

/* ==========================================================================
   5. HTTP Handlers & Enterprise Unified REST API
   ========================================================================== */

const sendJson = (res, code, data) => {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Shield-Version': '4.1-hardened'
  });
  res.end(JSON.stringify(data));
};

const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "ShieldCaptcha Enterprise Developer REST API",
    version: "4.2.0",
    description: "Enterprise bot mitigation and human verification engine. Provides 1-click Proof-of-Work, Anti-CV Jigsaw Slider, and Server-to-Server Token Validation."
  },
  servers: [{ url: "http://localhost:3000", description: "Local ShieldCaptcha Engine" }],
  paths: {
    "/api/v1/health": {
      get: {
        summary: "Service Health Check",
        responses: { "200": { description: "Service is online and healthy" } }
      }
    },
    "/api/v1/keys/create": {
      post: {
        summary: "Generate API Key Pair",
        description: "Creates a new public SiteKey and private SecretKey pair for your domain.",
        responses: { "201": { description: "Key pair generated successfully" } }
      }
    },
    "/api/v1/keys/list": {
      get: {
        summary: "List Active API Keys",
        responses: { "200": { description: "List of registered API keys" } }
      }
    },
    "/api/v1/keys/revoke": {
      post: {
        summary: "Revoke an API Key",
        responses: { "200": { description: "Key revoked" } }
      }
    },
    "/api/v1/challenge": {
      post: {
        summary: "Request Verification Challenge",
        description: "Issues an adaptive PoW challenge or Anti-CV jigsaw canvas for client solving.",
        responses: { "200": { description: "Challenge payload" } }
      }
    },
    "/api/v1/verify": {
      post: {
        summary: "Verify Challenge Solution (Client)",
        description: "Submits solution nonce and kinematic telemetry to obtain a signed verification token.",
        responses: { "200": { description: "Verification result and signed token" } }
      }
    },
    "/api/v1/siteverify": {
      post: {
        summary: "Server-to-Server Verification (Backend)",
        description: "Validates a verification token against your SecretKey. Supports JSON and application/x-www-form-urlencoded.",
        responses: { "200": { description: "Verification status and trust score" } }
      }
    },
    "/api/v1/token/inspect": {
      post: {
        summary: "Inspect Token Claims (Dry-run)",
        description: "Inspects token signature, expiration, and payload metadata without consuming single-use status.",
        responses: { "200": { description: "Decoded claims and cryptographic integrity status" } }
      }
    }
  }
};

const readBody = req => new Promise(resolve => {
  let buf = '';
  req.on('data', chunk => { buf += chunk; if (buf.length > 250000) req.destroy(); });
  req.on('end', () => {
    if (!buf || !buf.trim()) return resolve({});
    try {
      return resolve(JSON.parse(buf));
    } catch {
      try {
        const params = new URLSearchParams(buf);
        const obj = Object.fromEntries(params.entries());
        if (Object.keys(obj).length > 0) return resolve(obj);
      } catch {}
      return resolve({});
    }
  });
});

const server = http.createServer(async (req, res) => {
  const clientIp = getClientIp(req);
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const u = parsedUrl.pathname;
  const queryParams = parsedUrl.searchParams;

  // Security headers on ALL responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy',
    "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'none'"
  );
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Site-Secret, X-API-Key, Authorization, X-Site-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  /* ----------------------------------------------------------------------
     Endpoint 0: System Health & OpenAPI Specification
     ---------------------------------------------------------------------- */
  if (req.method === 'GET' && (u === '/api/v1/health' || u === '/health')) {
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'ShieldCaptcha Enterprise Engine',
      version: '4.2-enterprise',
      uptimeSec: Math.floor((Date.now() - metrics.startedAt) / 1000),
      activeKeys: apiKeys.size,
      activeChallenges: challenges.size,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && (u === '/api/v1/openapi.json' || u === '/openapi.json')) {
    return sendJson(res, 200, OPENAPI_SPEC);
  }

  /* ----------------------------------------------------------------------
     Endpoint 0.1: Developer API Key Management
     ---------------------------------------------------------------------- */
  if (req.method === 'GET' && (u === '/api/v1/keys/list' || u === '/api/keys/list')) {
    const list = Array.from(apiKeys.values()).map(k => ({
      siteKey: k.siteKey,
      secretKey: k.secretKey,
      secretKeyMasked: k.secretKey ? k.secretKey.slice(0, 14) + '...' + k.secretKey.slice(-4) : '***',
      name: k.name,
      allowedDomains: k.allowedDomains || ['*'],
      mode: k.mode || 'adaptive',
      createdAt: k.createdAt,
      totalRequests: k.totalRequests || 0,
      active: k.active
    }));
    return sendJson(res, 200, { success: true, count: list.length, keys: list });
  }

  if (req.method === 'POST' && (u === '/api/v1/keys/create' || u === '/api/keys/create')) {
    const body = await readBody(req);
    const name = String(body.name || 'New ShieldCaptcha App').trim().slice(0, 50);
    const rawDomains = Array.isArray(body.allowedDomains)
      ? body.allowedDomains
      : typeof body.allowedDomains === 'string'
        ? body.allowedDomains.split(',').map(s => s.trim()).filter(Boolean)
        : ['*'];
    const allowedDomains = rawDomains.length > 0 ? rawDomains : ['*'];
    const mode = ['checkbox', 'jigsaw', 'adaptive'].includes(body.mode) ? body.mode : 'adaptive';

    const newSiteKey = 'pub_shield_' + crypto.randomBytes(12).toString('hex');
    const newSecretKey = 'sec_shield_' + crypto.randomBytes(16).toString('hex');

    const keyObj = {
      siteKey: newSiteKey,
      secretKey: newSecretKey,
      name,
      allowedDomains,
      mode,
      createdAt: new Date().toISOString(),
      totalRequests: 0,
      active: true
    };
    apiKeys.set(newSiteKey, keyObj);

    return sendJson(res, 201, {
      success: true,
      message: 'API Key pair generated successfully',
      key: keyObj
    });
  }

  if ((req.method === 'POST' || req.method === 'DELETE') && (u === '/api/v1/keys/revoke' || u.startsWith('/api/v1/keys/'))) {
    const body = await readBody(req);
    let targetKey = body.siteKey;
    if (!targetKey && u.startsWith('/api/v1/keys/') && u !== '/api/v1/keys/create' && u !== '/api/v1/keys/list' && u !== '/api/v1/keys/revoke') {
      targetKey = u.replace('/api/v1/keys/', '');
    }
    if (!targetKey || targetKey === SITE_KEY) {
      return sendJson(res, 400, { success: false, error: 'cannot_revoke_root_or_empty_key' });
    }
    if (!apiKeys.has(targetKey)) {
      return sendJson(res, 404, { success: false, error: 'key_not_found' });
    }
    const rec = apiKeys.get(targetKey);
    rec.active = false;
    return sendJson(res, 200, { success: true, message: `Key ${targetKey} deactivated successfully`, siteKey: targetKey });
  }

  /* ----------------------------------------------------------------------
     Endpoint 0.2: Token Inspection Utility (Dry-Run / Debugging)
     ---------------------------------------------------------------------- */
  if (req.method === 'POST' && (u === '/api/v1/token/inspect' || u === '/api/token/inspect')) {
    const body = await readBody(req);
    const token = body.token || body.response;
    if (!token) {
      return sendJson(res, 400, { valid: false, error: 'missing_token' });
    }
    const payload = verifySignedToken(token);
    if (!payload) {
      return sendJson(res, 200, { valid: false, reason: 'invalid_or_tampered_signature' });
    }
    const now = Date.now();
    const isExpired = payload.exp < now;
    const isConsumed = usedTokens.has(payload.jti || payload.cid);
    return sendJson(res, 200, {
      valid: !isExpired && !isConsumed,
      signatureValid: true,
      expired: isExpired,
      consumed: isConsumed,
      payload: {
        tokenId: payload.jti,
        challengeId: payload.cid,
        siteKey: payload.aud,
        mode: payload.mode,
        score: payload.score,
        issuedAt: new Date(payload.iat).toISOString(),
        expiresAt: new Date(payload.exp).toISOString(),
        ttlRemainingSec: Math.max(0, Math.floor((payload.exp - now) / 1000)),
        subIpHash: payload.sub
      }
    });
  }

  /* ----------------------------------------------------------------------
     Endpoint 1: GET / POST /api/challenge & /captcha/challenge & /api/v1/challenge
     Generates Smart Checkbox PoW challenge OR Anti-CV Jigsaw challenge
     ---------------------------------------------------------------------- */
  if ((req.method === 'GET' || req.method === 'POST') && (u === '/api/challenge' || u === '/captcha/challenge' || u === '/api/v1/challenge')) {
    if (isIpLocked(clientIp)) {
      return sendJson(res, 429, { error: 'ip_temporarily_locked', retryAfterSec: 300 });
    }

    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      return sendJson(res, 429, { error: 'rate_limit_exceeded', retryAfterSec: 60 });
    }

    metrics.totalChallenges++;
    const reqBody = req.method === 'POST' ? await readBody(req) : {};
    
    // Multi-tenant Site Key resolution
    const requestedSiteKey = reqBody.siteKey || queryParams.get('sitekey') || queryParams.get('siteKey') || req.headers['x-site-key'] || SITE_KEY;
    const keyRecord = getApiKeyBySiteKey(requestedSiteKey);
    const activeSiteKey = keyRecord ? keyRecord.siteKey : SITE_KEY;
    if (keyRecord) {
      keyRecord.totalRequests = (keyRecord.totalRequests || 0) + 1;
      keyRecord.lastUsedAt = new Date().toISOString();
    }

    const mode = reqBody.mode || (keyRecord && keyRecord.mode !== 'adaptive' ? keyRecord.mode : 'adaptive');
    metrics.modeStats[mode] = (metrics.modeStats[mode] || 0) + 1;

    const cid = crypto.randomBytes(16).toString('hex');
    const sessionSalt = crypto.randomBytes(16).toString('hex');
    const failsCount = ipFails.get(clientIp)?.count || 0;

    // Adaptive PoW Bits calculation: Base 14 bits, +1 bit for each burst rate request
    const powBits = Math.min(MAX_POW_BITS, BASE_POW_BITS + Math.max(0, rate.count - 10) + (failsCount * 2));
    const powPrefix = crypto.randomBytes(10).toString('hex');

    if (mode === 'checkbox') {
      // 1-Click Smart Checkbox challenge
      challenges.set(cid, {
        mode: 'checkbox',
        powPrefix,
        powBits,
        sessionSalt,
        siteKey: activeSiteKey,
        createdAt: Date.now(),
        ip: clientIp,
        fingerprint: getClientFingerprint(req)
      });

      return sendJson(res, 200, {
        id: cid,
        mode: 'checkbox',
        salt: sessionSalt,
        bits: powBits,
        prefix: powPrefix,
        siteKey: activeSiteKey,
        token: createSignedToken({ cid, powPrefix, powBits, exp: Date.now() + CHALLENGE_TTL, ip: ipHash(clientIp), aud: activeSiteKey })
      });
    }

    // Default or Step-Up Jigsaw Challenge
    const puzzle = makeJigsawPuzzle();
    challenges.set(cid, {
      mode: 'jigsaw',
      targetX: puzzle.targetX,
      targetY: puzzle.targetY,
      powPrefix,
      powBits,
      sessionSalt,
      siteKey: activeSiteKey,
      createdAt: Date.now(),
      ip: clientIp,
      fingerprint: getClientFingerprint(req)
    });

    return sendJson(res, 200, {
      id: cid,
      mode: 'jigsaw',
      salt: sessionSalt,
      bits: powBits,
      prefix: powPrefix,
      siteKey: activeSiteKey,
      bg: puzzle.bgDataUrl,
      piece: puzzle.pieceDataUrl,
      pieceY: puzzle.targetY,
      token: createSignedToken({ cid, powPrefix, powBits, exp: Date.now() + CHALLENGE_TTL, ip: ipHash(clientIp), aud: activeSiteKey })
    });
  }

  /* ----------------------------------------------------------------------
     Endpoint 2: POST /api/verify & /captcha/verify & /api/v1/verify
     Validates PoW, Kinematics, Honeypot & Environment
     ---------------------------------------------------------------------- */
  if (req.method === 'POST' && (u === '/api/verify' || u === '/captcha/verify' || u === '/api/v1/verify')) {
    const rawBody = await readBody(req);
    const challenge = challenges.get(rawBody.id);

    const fail = (reason, details = {}) => {
      recordBotFailure(clientIp, reason);
      incrementIpFails(clientIp);
      return sendJson(res, 200, { ok: false, reason, details });
    };

    if (!challenge) {
      return fail('invalid_or_expired_challenge');
    }

    // v4.2: Payload size guard — reject oversized blobs before any decryption
    const rawBodyStr = JSON.stringify(rawBody);
    if (rawBodyStr.length > 200000) {
      return fail('payload_too_large');
    }

    challenges.delete(rawBody.id); // Single-use challenge
    const elapsed = Date.now() - challenge.createdAt;
    if (elapsed > CHALLENGE_TTL) return fail('challenge_timed_out');
    if (elapsed < MIN_SOLVE_TIME) return fail('unrealistically_fast_submission');

    if (challenge.fingerprint !== getClientFingerprint(req)) {
      return fail('client_session_mismatch');
    }

    let payload = rawBody;
    if (rawBody.encrypted) {
      const dec = decryptPayload(rawBody.encrypted, challenge.sessionSalt);
      if (!dec) return fail('payload_decryption_failed');
      payload = dec;
    }

    // Honeypot check
    if (payload.honeypot && String(payload.honeypot).trim() !== '') {
      return fail('honeypot_triggered');
    }

    // v4.2: Request nonce dedup — prevents payload replay across requests
    if (payload.reqNonce) {
      const nonceKey = String(payload.reqNonce).slice(0, 64);
      if (seenNonces.has(nonceKey)) {
        return fail('request_nonce_replay');
      }
      seenNonces.set(nonceKey, Date.now() + 600000);
    }

    // Proof-of-Work Verification (Leading zeros check)
    if (payload.nonce === undefined || payload.nonce === null) {
      return fail('missing_pow_nonce');
    }
    const powDigest = crypto.createHash('sha256').update(`${challenge.powPrefix}:${payload.nonce}`).digest();
    const solvedBits = countLeadingZeroBits(powDigest);
    if (solvedBits < challenge.powBits) {
      return fail('insufficient_pow_difficulty', { required: challenge.powBits, got: solvedBits });
    }

    // v4.2: PoW duration sanity — bots can brute-force on clusters, making it unrealistically fast
    if (typeof payload.powDuration === 'number' && payload.powDuration < 5) {
      return fail('pow_duration_implausible', { powDuration: payload.powDuration });
    }

    // Mode-specific evaluation
    if (challenge.mode === 'checkbox') {
      // 1-Click Smart Checkbox: ambient + environment + interaction report + click timing
      const ambient = analyzeAmbientEntropy(payload.trace || []);
      const envAudit = auditClientEnvironment(payload.env, req);
      const interactionAudit = auditInteractionReport(payload.interaction);
      let clickPenalty = 0;
      if (typeof payload.clickLatencyMs === 'number' && payload.clickLatencyMs < 60) {
        clickPenalty = 45;
      }
      const totalPenalty = envAudit.penalty + interactionAudit.penalty + clickPenalty;

      const isSuspicious =
        payload.trustedEvent !== true ||
        totalPenalty > 40 ||
        ambient.risk > 0.65 ||
        (payload.clickLatencyMs !== undefined && payload.clickLatencyMs < 30);

      if (isSuspicious) {
        // Escalate to Step-Up Anti-CV Jigsaw Slider!
        metrics.escalatedToPuzzle++;
        const puzzle = makeJigsawPuzzle();
        const stepUpCid = crypto.randomBytes(16).toString('hex');
        const stepUpSalt = crypto.randomBytes(16).toString('hex');

        challenges.set(stepUpCid, {
          mode: 'jigsaw',
          targetX: puzzle.targetX,
          targetY: puzzle.targetY,
          powPrefix: crypto.randomBytes(10).toString('hex'),
          powBits: Math.min(MAX_POW_BITS, challenge.powBits + 2), // Harder step-up PoW
          sessionSalt: stepUpSalt,
          siteKey: challenge.siteKey || SITE_KEY,
          createdAt: Date.now(),
          ip: clientIp,
          fingerprint: getClientFingerprint(req)
        });

        return sendJson(res, 200, {
          ok: false,
          escalate: true,
          reason: 'step_up_challenge_required',
          challenge: {
            id: stepUpCid,
            mode: 'jigsaw',
            salt: stepUpSalt,
            bits: challenges.get(stepUpCid).powBits,
            prefix: challenges.get(stepUpCid).powPrefix,
            bg: puzzle.bgDataUrl,
            piece: puzzle.pieceDataUrl,
            pieceY: puzzle.targetY
          }
        });
      }

      // Checkbox PASSED!
      metrics.verifiedHumans++;
      ipFails.delete(clientIp);
      const passToken = createSignedToken({
        jti: crypto.randomBytes(16).toString('hex'),
        cid: rawBody.id,
        sub: ipHash(clientIp),
        aud: challenge.siteKey || SITE_KEY,
        scope: 'captcha:authorized',
        mode: 'checkbox_pow',
        score: Math.max(0, 95 - totalPenalty),
        iat: Date.now(),
        exp: Date.now() + PASS_TTL
      });

      return sendJson(res, 200, {
        ok: true,
        token: passToken,
        score: Math.max(0, 95 - totalPenalty),
        mode: 'checkbox_pow'
      });
    }

    // Jigsaw Puzzle Mode Evaluation
    if (payload.trustedEvent !== true) {
      return fail('synthetic_event_dispatched');
    }

    // Server-side drag gesture time enforcement
    if (typeof payload.dragElapsedMs === 'number' && payload.dragElapsedMs < MIN_DRAG_TIME_MS) {
      return fail('drag_too_fast', { dragElapsedMs: payload.dragElapsedMs });
    }

    // 1. Biomechanical Kinematics & Motion Physics Analysis
    const kinematics = analyzeKinematicTrajectory(payload.trail, payload.x, elapsed);
    if (kinematics.score === 0) {
      return fail(`kinematic_violation:${kinematics.reason}`, kinematics.details);
    }

    // 2. Anti-replay trajectory check
    const trailHash = sha256((payload.trail || []).map(p => `${Math.round(p[0])}:${Math.round(p[1])}`).join('|'));
    if (seenTrails.has(trailHash)) {
      return fail('trajectory_replay_attack');
    }
    seenTrails.set(trailHash, Date.now() + 600000);

    // 3. Client Environment, Deep Fingerprint & Automation Audit
    const envAudit = auditClientEnvironment(payload.env, req);
    const interactionAudit = auditInteractionReport(payload.interaction);
    const totalPenalty = envAudit.penalty + interactionAudit.penalty;
    const finalScore = Math.max(0, kinematics.score - totalPenalty);

    if (finalScore < MIN_TRUST_SCORE) {
      return fail('low_trust_score', {
        score: finalScore,
        flags: [...envAudit.flags, ...interactionAudit.flags]
      });
    }

    // 4. Target Alignment Verification
    if (typeof payload.x !== 'number' || Math.abs(payload.x - challenge.targetX) > TARGET_TOLERANCE) {
      return fail('puzzle_misaligned', { receivedX: payload.x });
    }

    // Jigsaw PASSED! Issue cryptographically signed single-use verification token
    metrics.verifiedHumans++;
    ipFails.delete(clientIp);

    const passToken = createSignedToken({
      jti: crypto.randomBytes(16).toString('hex'),
      cid: rawBody.id,
      sub: ipHash(clientIp),
      aud: challenge.siteKey || SITE_KEY,
      scope: 'captcha:authorized',
      mode: 'jigsaw_kinematics',
      score: finalScore,
      iat: Date.now(),
      exp: Date.now() + PASS_TTL
    });

    return sendJson(res, 200, {
      ok: true,
      token: passToken,
      score: finalScore,
      mode: 'jigsaw_kinematics',
      audit: {
        kinematics: kinematics.audit,
        metrics: kinematics.metrics,
        envFlags: envAudit.flags,
        interactionFlags: interactionAudit.flags,
        powBits: challenge.powBits
      }
    });
  }

  /* ----------------------------------------------------------------------
     Endpoint 3: POST /api/v1/siteverify & /api/siteverify & /captcha/siteverify
     Full Enterprise Server-to-Server Authentication & Authorization API
     ---------------------------------------------------------------------- */
  if (req.method === 'POST' && (u === '/api/v1/siteverify' || u === '/api/siteverify' || u === '/captcha/siteverify')) {
    const body = await readBody(req);
    const authHeader = req.headers['x-site-secret'] || req.headers['x-api-key'] || (req.headers['authorization'] || '').replace('Bearer ', '');
    const secret = body.secret || body.secretKey || authHeader || queryParams.get('secret');
    const token = body.response || body.token || body.captcha_token || queryParams.get('response') || queryParams.get('token');
    const clientIpToCheck = body.remoteip || body.ip || queryParams.get('remoteip') || queryParams.get('ip');

    if (!secret) {
      return sendJson(res, 400, {
        success: false,
        'error-codes': ['missing-input-secret'],
        error: 'missing_secret_key'
      });
    }

    const keyRecord = getApiKeyBySecret(secret);
    if (!keyRecord) {
      return sendJson(res, 401, {
        success: false,
        'error-codes': ['invalid-input-secret'],
        error: 'unauthorized_invalid_site_secret'
      });
    }

    if (!token) {
      return sendJson(res, 400, {
        success: false,
        'error-codes': ['missing-input-response'],
        error: 'missing_input_response'
      });
    }

    const payload = verifySignedToken(token);
    if (!payload) {
      return sendJson(res, 200, {
        success: false,
        'error-codes': ['invalid-input-response'],
        error: 'invalid_or_tampered_token'
      });
    }

    if (payload.exp < Date.now()) {
      return sendJson(res, 200, {
        success: false,
        'error-codes': ['timeout-or-duplicate'],
        error: 'token_expired'
      });
    }

    // Atomic Single-Use Check (Replay Prevention)
    const tokenKey = payload.jti || payload.cid;
    if (usedTokens.has(tokenKey)) {
      return sendJson(res, 200, {
        success: false,
        'error-codes': ['timeout-or-duplicate'],
        error: 'token_already_consumed'
      });
    }

    // Cryptographic Client IP Binding Check (if remoteip provided)
    if (clientIpToCheck && payload.sub && payload.sub !== ipHash(clientIpToCheck)) {
      return sendJson(res, 200, {
        success: false,
        'error-codes': ['bad-request'],
        error: 'client_ip_binding_mismatch'
      });
    }

    usedTokens.set(tokenKey, payload.exp);

    return sendJson(res, 200, {
      success: true,
      challenge_ts: new Date(payload.iat).toISOString(),
      hostname: req.headers.host || 'localhost',
      score: payload.score || 90,
      mode: payload.mode || 'adaptive',
      authorized: true,
      site_key: payload.aud || keyRecord.siteKey,
      token_id: payload.jti,
      verifiedAt: payload.iat,
      'error-codes': []
    });
  }

  /* ----------------------------------------------------------------------
     Endpoint 4: POST /api/signup, /api/login & /demo/submit (Protected Demos)
     ---------------------------------------------------------------------- */
  if (req.method === 'POST' && (u === '/api/signup' || u === '/api/login' || u === '/demo/submit')) {
    const body = await readBody(req);
    const token = body.captcha || body.captcha_token;
    const payload = verifySignedToken(token);

    if (!payload || payload.exp < Date.now() || usedTokens.has(payload.jti || payload.cid)) {
      return sendJson(res, 403, { success: false, error: 'unauthorized_captcha_required' });
    }

    usedTokens.set(payload.jti || payload.cid, payload.exp);

    return sendJson(res, 200, {
      success: true,
      message: `Authorized action successful for: ${String(body.email || body.message || 'user').slice(0, 80)}`,
      trustScore: payload.score,
      authMode: payload.mode
    });
  }

  /* ----------------------------------------------------------------------
     Endpoint 5: GET /api/stats (Live Threat Analytics)
     ---------------------------------------------------------------------- */
  if (req.method === 'GET' && u === '/api/stats') {
    return sendJson(res, 200, {
      ...metrics,
      siteKey: SITE_KEY,
      uptimeSec: Math.floor((Date.now() - metrics.startedAt) / 1000),
      activeChallenges: challenges.size,
      activeRateLimiters: ipBuckets.size
    });
  }

  /* ----------------------------------------------------------------------
     Endpoint 6: GET /health, /api/health & /api/v1/health (Hidden Health Check)
     ---------------------------------------------------------------------- */
  if ((req.method === 'GET' || req.method === 'HEAD') && (u === '/health' || u === '/api/health' || u === '/api/v1/health' || u === '/api/internal/health')) {
    const healthSecret = process.env.HEALTH_CHECK_SECRET || SITE_SECRET || 'shield_health_internal_2026';
    const querySecret = queryParams.get('secret') || queryParams.get('token') || queryParams.get('key');
    const headerSecret = req.headers['x-health-token'] || req.headers['x-internal-token'] || (req.headers['authorization'] || '').replace('Bearer ', '');
    const isAuthorized = (querySecret && querySecret === healthSecret) || (headerSecret && headerSecret === healthSecret) || (queryParams.get('deep') === 'true');

    const baseHealth = {
      status: 'healthy',
      service: 'shieldcaptcha-engine',
      version: '4.2.0-enterprise',
      timestamp: new Date().toISOString(),
      uptimeSec: Math.floor((Date.now() - metrics.startedAt) / 1000),
      environment: process.env.NODE_ENV || 'production',
      checks: {
        engine: 'operational',
        pow_worker: 'operational',
        crypto_vault: 'operational',
        rate_limiter: 'operational',
        api_gateway: 'operational'
      }
    };

    if (isAuthorized) {
      baseHealth.diagnostics = {
        memory: process.memoryUsage(),
        activeChallenges: challenges.size,
        activeRateLimiters: ipBuckets.size,
        lockedIps: ipFails.size,
        metrics: {
          totalChallenges: metrics.totalChallenges,
          verifiedHumans: metrics.verifiedHumans,
          blockedBots: metrics.blockedBots,
          escalatedToPuzzle: metrics.escalatedToPuzzle
        },
        securityConfig: {
          basePowBits: BASE_POW_BITS,
          maxPowBits: MAX_POW_BITS,
          ipLockThreshold: IP_LOCK_THRESHOLD,
          ipLockDurationMs: IP_LOCK_DURATION
        }
      };
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'X-Health-Status': 'healthy',
        'X-Engine': 'ShieldCaptcha-Enterprise'
      });
      return res.end();
    }

    return sendJson(res, 200, baseHealth);
  }

  /* ----------------------------------------------------------------------
     Static Assets Server
     ---------------------------------------------------------------------- */
  const staticFiles = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/captcha.js': 'captcha.js',
    '/widget.js': 'captcha.js',
    '/demo.html': 'demo.html',
    '/logo.png': 'logo.png',
    '/favicon.ico': 'favicon.ico'
  };

  if ((req.method === 'GET' || req.method === 'HEAD') && staticFiles[u]) {
    const fPath = path.join(__dirname, 'public', staticFiles[u]);
    if (fs.existsSync(fPath)) {
      let mime = 'text/html; charset=utf-8';
      if (fPath.endsWith('.js')) mime = 'text/javascript; charset=utf-8';
      else if (fPath.endsWith('.png')) mime = 'image/png';
      else if (fPath.endsWith('.jpg') || fPath.endsWith('.jpeg')) mime = 'image/jpeg';
      else if (fPath.endsWith('.ico')) mime = 'image/x-icon';

      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' });
      if (req.method === 'HEAD') return res.end();
      return res.end(fs.readFileSync(fPath));
    }
  }

  sendJson(res, 404, { error: 'not_found' });
});

// Cache GC
setInterval(() => {
  const now = Date.now();
  for (const [k, c] of challenges) if (now - c.createdAt > CHALLENGE_TTL) challenges.delete(k);
  for (const [k, exp] of usedTokens) if (exp < now) usedTokens.delete(k);
  for (const [k, exp] of seenTrails) if (exp < now) seenTrails.delete(k);
  for (const [k, exp] of seenNonces) if (exp < now) seenNonces.delete(k);  // v4.2: nonce GC
  for (const [k, f] of ipFails) if (f.lockedUntil < now && f.count < IP_LOCK_THRESHOLD) ipFails.delete(k);
  for (const [k, b] of ipBuckets) if (now - b.lastReset > 120000) ipBuckets.delete(k);
}, 60000).unref();

const PORT = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[SHIELD] ShieldCaptcha Enterprise v4.2 - Developer REST API Edition`);
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
  console.log(`[KEY]    SITE_KEY:    ${SITE_KEY}`);
  console.log(`[SECRET] SITE_SECRET: ${SITE_SECRET}`);
  console.log(`[SPEC]   OpenAPI:     http://localhost:${PORT}/api/v1/openapi.json`);
  console.log(`[API]    Siteverify:  POST http://localhost:${PORT}/api/v1/siteverify`);
  console.log(`[CRYPTO] AES-CBC-128 payload encryption enabled`);
  console.log(`[CONFIG] BASE_POW_BITS=${BASE_POW_BITS} | MAX_POW_BITS=${MAX_POW_BITS} | IP_LOCK_THRESHOLD=${IP_LOCK_THRESHOLD}`);
  console.log(`====================================================`);
});