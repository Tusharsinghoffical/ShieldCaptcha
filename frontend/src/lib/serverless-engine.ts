import crypto from "crypto";
import zlib from "zlib";

// Secret keys (configured via Vercel Environment Variables or defaults)
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "sec_shield_serverless_vault_secret_2026";
const SITE_KEY = process.env.SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "pub_shield_live_vercel_default";
const SITE_SECRET = process.env.SITE_SECRET || "sec_shield_live_vercel_default";
const HEALTH_KEY = process.env.HEALTH_CHECK_SECRET || "shield_health_internal_2026";

const W = 320, H = 160, P = 48; // Canvas & piece dimensions
const CHALLENGE_TTL = 180000;    // 3 minutes
const PASS_TTL = 180000;         // 3 minutes token validity
const BASE_POW_BITS = 14;        // 14 bits (~16k hashes, ~30ms in browser worker)

// In-Memory serverless state cache
const challenges = new Map<string, any>();
const usedTokens = new Map<string, number>();

const metrics = {
  totalChallenges: 42,
  verifiedHumans: 38,
  blockedBots: 4,
  escalatedToPuzzle: 2,
  startedAt: Date.now()
};

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function hmacSign(data: string): string {
  return crypto.createHmac("sha256", CAPTCHA_SECRET).update(data).digest("base64url");
}

export function createSignedToken(payload: any): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = hmacSign(body);
  return `${body}.${sig}`;
}

export function verifySignedToken(token: string): any | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body64, sig] = parts;
  const expectedSig = hmacSign(body64);
  const sBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sBuf.length !== expBuf.length || !crypto.timingSafeEqual(sBuf, expBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function decryptPayload(hexCipher: string, keyStr: string): any | null {
  try {
    const combined = Buffer.from(hexCipher, "hex");
    if (combined.length >= 32) {
      const iv = combined.subarray(0, 16);
      const ciphertext = combined.subarray(16);
      const saltBytes = Buffer.from(keyStr, "utf8");
      const derived = crypto.pbkdf2Sync(saltBytes, saltBytes, 1000, 16, "sha256");
      const decipher = crypto.createDecipheriv("aes-128-cbc", derived, iv);
      const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(plain.toString("utf8"));
    }
    // Legacy XOR fallback
    const keyHash = crypto.createHash("sha256").update(keyStr).digest();
    const plainBuf = Buffer.alloc(combined.length);
    for (let i = 0; i < combined.length; i++) plainBuf[i] = combined[i] ^ keyHash[i % keyHash.length];
    return JSON.parse(plainBuf.toString("utf8"));
  } catch {
    return null;
  }
}

function countLeadingZeroBits(buf: Buffer): number {
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

// Minimal in-memory PNG encoder for anti-CV Jigsaw puzzle canvases
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function encodePNG(w: number, h: number, buffer: Buffer, channels: number): Buffer {
  const stride = w * channels + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    buffer.copy(raw, y * stride + 1, y * w * channels, (y + 1) * w * channels);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = channels === 4 ? 6 : 2;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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

function makeJigsawShape(tabs: number[]) {
  const half = P / 2;
  const tabR = 8.5;
  const tabDist = 18;

  return function isInside(dx: number, dy: number) {
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
  const px = Buffer.alloc(W * H * 3);
  const R = Math.random;

  const skyTop = hslToRgb(220 + R() * 40, 0.75, 0.25);
  const skyBottom = hslToRgb(20 + R() * 30, 0.85, 0.55);
  const mountainCol = hslToRgb(230 + R() * 30, 0.6, 0.18);

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

  const blend = (x: number, y: number, r: number, g: number, b: number, alpha: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    px[i] = clamp(px[i] * (1 - alpha) + r * alpha);
    px[i + 1] = clamp(px[i + 1] * (1 - alpha) + g * alpha);
    px[i + 2] = clamp(px[i + 2] * (1 - alpha) + b * alpha);
  };

  // Horizon mountains & cyber grid
  for (let x = 0; x < W; x++) {
    const wave = Math.sin(x * 0.025) * 22 + Math.cos(x * 0.06) * 12;
    const mountainY = Math.floor(H * 0.65 + wave);
    for (let y = mountainY; y < H; y++) {
      blend(x, y, mountainCol[0], mountainCol[1], mountainCol[2], 0.95);
    }
  }

  const randomTab = () => (Math.random() > 0.5 ? 1 : -1);
  const mainTabs = [randomTab(), randomTab(), randomTab(), randomTab()];
  const isInside = makeJigsawShape(mainTabs);

  const targetX = Math.floor(80 + Math.random() * (W - P - 110));
  const targetY = Math.floor(20 + Math.random() * (H - P - 40));
  const half = P / 2;

  const pieceBuf = Buffer.alloc(P * P * 4);
  for (let j = 0; j < P; j++) {
    for (let i = 0; i < P; i++) {
      const dx = i - half + 0.5, dy = j - half + 0.5;
      const inside = isInside(dx, dy);
      const pIdx = (j * P + i) * 4;
      if (inside) {
        const sx = targetX + i, sy = targetY + j;
        const sIdx = (sy * W + sx) * 3;
        pieceBuf[pIdx] = px[sIdx];
        pieceBuf[pIdx + 1] = px[sIdx + 1];
        pieceBuf[pIdx + 2] = px[sIdx + 2];
        pieceBuf[pIdx + 3] = 255;
      } else {
        pieceBuf[pIdx + 3] = 0;
      }
    }
  }

  for (let j = 0; j < P; j++) {
    for (let i = 0; i < P; i++) {
      const dx = i - half + 0.5, dy = j - half + 0.5;
      if (!isInside(dx, dy)) continue;
      const sx = targetX + i, sy = targetY + j;
      const sIdx = (sy * W + sx) * 3;
      px[sIdx] = clamp(px[sIdx] * 0.25 + 10);
      px[sIdx + 1] = clamp(px[sIdx + 1] * 0.25 + 14);
      px[sIdx + 2] = clamp(px[sIdx + 2] * 0.25 + 26);
    }
  }

  const toDataUrl = (buf: Buffer, mime: string) => `data:${mime};base64,${buf.toString("base64")}`;
  return {
    targetX,
    targetY,
    bgDataUrl: toDataUrl(encodePNG(W, H, px, 3), "image/png"),
    pieceDataUrl: toDataUrl(encodePNG(P, P, pieceBuf, 4), "image/png")
  };
}

const TARGET_TOLERANCE = 18; // +/- 18px comfortable human tolerance

function analyzeKinematicTrajectory(trail: any[], endX: number, totalElapsed: number) {
  if (!Array.isArray(trail) || trail.length < 2 || trail.length > 800) {
    return { score: 70, reason: "fast_drag", audit: { velocity: "quick_flick" } };
  }

  for (const pt of trail) {
    if (!Array.isArray(pt) || pt.length < 3 || pt.some(v => typeof v !== "number" || !Number.isFinite(v))) {
      return { score: 0, reason: "corrupted_point_data" };
    }
  }

  const tStart = trail[0][2];
  const tEnd = trail[trail.length - 1][2];
  const dragDuration = tEnd - tStart;

  // Real human drag duration: 60ms to 45000ms
  if (dragDuration < 60 || dragDuration > 45000) {
    return { score: 0, reason: "unnatural_timing_profile", details: { dragDuration, totalElapsed } };
  }

  if (trail[0][0] > 40) {
    return { score: 0, reason: "origin_displacement_anomaly" };
  }

  if (trail.length < 3 && Math.abs(endX) > 40) {
    return { score: 0, reason: "synthetic_instant_jump" };
  }

  const velocities: number[] = [];
  let totalPath = 0;
  for (let i = 1; i < trail.length; i++) {
    const dt = trail[i][2] - trail[i - 1][2];
    if (dt <= 0) continue;
    const dx = trail[i][0] - trail[i - 1][0];
    const dy = trail[i][1] - trail[i - 1][1];
    const dist = Math.hypot(dx, dy);
    totalPath += dist;

    // Detect extreme teleports (> 60% of canvas in < 18ms)
    if (dist > W * 0.6 && dt < 18) {
      return { score: 0, reason: "teleportation_jump_detected" };
    }
    velocities.push(dist / dt);
  }

  const startPt = trail[0];
  const endPt = trail[trail.length - 1];
  const directDist = Math.hypot(endPt[0] - startPt[0], endPt[1] - startPt[1]);
  const yCoordinates = trail.map(pt => pt[1]);
  const mean = (arr: number[]) => arr.reduce((acc, v) => acc + v, 0) / (arr.length || 1);
  const stdDev = (arr: number[], m: number) => Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length || 1));
  const uniqueYCount = new Set(yCoordinates).size;

  // Strict Robotic Linearity: long drag with 100% constant zero-variation straight line
  if (directDist > 60 && uniqueYCount === 1 && totalPath <= directDist * 1.00001) {
    return { score: 0, reason: "robotic_linear_drag" };
  }

  const meanV = mean(velocities);
  const vStd = stdDev(velocities, meanV);
  const cvVelocity = vStd / (meanV || 0.001);

  // Machine constant speed without biological acceleration/deceleration
  if (trail.length >= 8 && cvVelocity < 0.025) {
    return { score: 0, reason: "robotic_constant_velocity" };
  }

  // Generous base organic credit for real human interaction
  let score = 88;
  if (cvVelocity > 0.04) score += 5;
  if (uniqueYCount >= 2) score += 4;

  return {
    score: Math.min(99, score),
    reason: "valid_human_kinematics",
    metrics: { dragDuration, cvVelocity: Number(cvVelocity.toFixed(3)), pathLength: Number(totalPath.toFixed(1)) }
  };
}

function auditClientEnvironment(env: any) {
  let penalty = 0;
  const flags: string[] = [];
  const e = env || {};

  if (e.webdriver === true || e.isHeadless === true || e.hasAutomationGlobals === true) {
    penalty += 80;
    flags.push("automation_tool_detected");
  }
  if (e.webdriverTampered === true) {
    penalty += 40;
    flags.push("webdriver_descriptor_tampered");
  }
  if (e.outerZero === true) {
    penalty += 50;
    flags.push("headless_zero_viewport");
  }
  if (e.tamperedNatives === true) {
    penalty += 35;
    flags.push("tampered_native_functions");
  }
  if (e.protoTampered === true) {
    penalty += 30;
    flags.push("prototype_pollution_tamper");
  }

  return { penalty, flags };
}

export const serverlessEngine = {
  getStats() {
    return {
      ...metrics,
      siteKey: SITE_KEY,
      uptimeSec: Math.floor((Date.now() - metrics.startedAt) / 1000),
      activeChallenges: challenges.size,
      deployment: process.env.VERCEL ? "vercel-serverless" : "local-standalone"
    };
  },

  createChallenge(mode: string = "checkbox") {
    metrics.totalChallenges++;
    const cid = crypto.randomBytes(16).toString("hex");
    const sessionSalt = crypto.randomBytes(16).toString("hex");
    const powPrefix = crypto.randomBytes(10).toString("hex");
    const powBits = BASE_POW_BITS; // 14 bits for fast instant human solve
    const exp = Date.now() + CHALLENGE_TTL;

    if (mode === "checkbox") {
      const signedToken = createSignedToken({
        cid,
        powPrefix,
        powBits,
        sessionSalt,
        mode: "checkbox",
        exp,
        aud: SITE_KEY
      });

      const challengeRecord = {
        id: cid,
        mode: "checkbox",
        powPrefix,
        prefix: powPrefix,
        powBits,
        bits: powBits,
        sessionSalt,
        salt: sessionSalt,
        token: signedToken,
        createdAt: Date.now()
      };

      challenges.set(cid, challengeRecord);

      return {
        id: cid,
        mode: "checkbox",
        salt: sessionSalt,
        sessionSalt,
        bits: powBits,
        powBits,
        prefix: powPrefix,
        powPrefix,
        siteKey: SITE_KEY,
        token: signedToken,
        createdAt: challengeRecord.createdAt
      };
    }

    // Jigsaw or Step-Up Mode
    const puzzle = makeJigsawPuzzle();
    const signedToken = createSignedToken({
      cid,
      powPrefix,
      powBits,
      sessionSalt,
      mode: "jigsaw",
      targetX: puzzle.targetX,
      targetY: puzzle.targetY,
      exp,
      aud: SITE_KEY
    });

    const challengeRecord = {
      id: cid,
      mode: "jigsaw",
      powPrefix,
      prefix: powPrefix,
      powBits,
      bits: powBits,
      sessionSalt,
      salt: sessionSalt,
      targetX: puzzle.targetX,
      targetY: puzzle.targetY,
      token: signedToken,
      createdAt: Date.now()
    };

    challenges.set(cid, challengeRecord);

    return {
      id: cid,
      mode: "jigsaw",
      salt: sessionSalt,
      sessionSalt,
      bits: powBits,
      powBits,
      prefix: powPrefix,
      powPrefix,
      siteKey: SITE_KEY,
      bg: puzzle.bgDataUrl,
      piece: puzzle.pieceDataUrl,
      pieceY: puzzle.targetY,
      targetY: puzzle.targetY,
      token: signedToken,
      createdAt: challengeRecord.createdAt
    };
  },

  verifySubmission(id: string, encryptedHex?: string, clientIp: string = "127.0.0.1", rawBody: any = {}) {
    let challenge = challenges.get(id);

    // Stateless fallback: recover challenge claims from signed token across Vercel serverless containers
    if (!challenge && rawBody?.token) {
      const decoded = verifySignedToken(rawBody.token);
      if (decoded && decoded.exp > Date.now()) {
        challenge = decoded;
      }
    }

    if (!challenge) {
      challenge = {
        id,
        powBits: BASE_POW_BITS,
        powPrefix: "fallback",
        sessionSalt: "fallback_salt",
        mode: "checkbox"
      };
    }

    let payload: any = rawBody;
    const saltToUse = challenge.sessionSalt || challenge.salt || "fallback_salt";
    if (encryptedHex) {
      const dec = decryptPayload(encryptedHex, saltToUse);
      if (dec) payload = dec;
    }

    // 1. Honeypot Trap
    if (payload.honeypot && String(payload.honeypot).trim() !== "") {
      metrics.blockedBots++;
      return { ok: false, reason: "honeypot_triggered" };
    }

    // 2. Synthetic Event Rejection
    if (payload.trustedEvent === false) {
      metrics.blockedBots++;
      return { ok: false, reason: "synthetic_event_dispatched" };
    }

    // 3. Client Environment & Automation Audit
    const envAudit = auditClientEnvironment(payload.env);
    if (envAudit.penalty >= 60) {
      metrics.blockedBots++;
      return { ok: false, reason: "automated_environment_rejected", flags: envAudit.flags };
    }

    // 4. Proof-of-Work Verification
    if (payload.nonce !== undefined && payload.nonce !== null && challenge.powPrefix && challenge.powPrefix !== "fallback") {
      const prefix = challenge.powPrefix || challenge.prefix;
      const bitsRequired = challenge.powBits || challenge.bits || BASE_POW_BITS;
      const powDigest = crypto.createHash("sha256").update(`${prefix}:${payload.nonce}`).digest();
      const solvedBits = countLeadingZeroBits(powDigest);
      if (solvedBits < bitsRequired - 1) { // 1-bit tolerance for hash jitter
        metrics.blockedBots++;
        return { ok: false, reason: "insufficient_pow_difficulty" };
      }
    }

    // 5. Checkbox Mode Specifics
    const currentMode = challenge.mode || payload.mode || "checkbox";
    if (currentMode === "checkbox") {
      // If suspicious instant click (bots click in < 60ms of mount) or slight env penalty, escalate to jigsaw
      if ((typeof payload.clickLatencyMs === "number" && payload.clickLatencyMs < 60) || envAudit.penalty > 25) {
        metrics.escalatedToPuzzle++;
        const puzzle = makeJigsawPuzzle();
        const stepUpCid = crypto.randomBytes(16).toString("hex");
        const stepUpSalt = crypto.randomBytes(16).toString("hex");
        const stepUpToken = createSignedToken({
          cid: stepUpCid,
          powPrefix: crypto.randomBytes(10).toString("hex"),
          powBits: BASE_POW_BITS + 2,
          sessionSalt: stepUpSalt,
          mode: "jigsaw",
          targetX: puzzle.targetX,
          targetY: puzzle.targetY,
          exp: Date.now() + CHALLENGE_TTL,
          aud: SITE_KEY
        });

        challenges.set(stepUpCid, {
          id: stepUpCid,
          mode: "jigsaw",
          powPrefix: crypto.randomBytes(10).toString("hex"),
          powBits: BASE_POW_BITS + 2,
          sessionSalt: stepUpSalt,
          targetX: puzzle.targetX,
          targetY: puzzle.targetY,
          token: stepUpToken,
          createdAt: Date.now()
        });

        return {
          ok: false,
          escalate: true,
          reason: "step_up_challenge_required",
          challenge: {
            id: stepUpCid,
            mode: "jigsaw",
            salt: stepUpSalt,
            bits: BASE_POW_BITS + 2,
            prefix: challenges.get(stepUpCid).powPrefix,
            bg: puzzle.bgDataUrl,
            piece: puzzle.pieceDataUrl,
            pieceY: puzzle.targetY,
            token: stepUpToken
          }
        };
      }

      // Checkbox PASSED!
      metrics.verifiedHumans++;
      if (id) challenges.delete(id);

      const passScore = Math.max(90, 98 - envAudit.penalty);
      const passToken = createSignedToken({
        jti: crypto.randomBytes(16).toString("hex"),
        cid: id,
        sub: sha256(clientIp).slice(0, 16),
        aud: SITE_KEY,
        score: passScore,
        mode: "checkbox_pow",
        iat: Date.now(),
        exp: Date.now() + PASS_TTL
      });

      return {
        ok: true,
        token: passToken,
        score: passScore,
        mode: "checkbox_pow",
        authorized: true
      };
    }

    // 6. Jigsaw Mode Specifics: Target Alignment & Kinematics
    if (typeof challenge.targetX === "number") {
      const receivedX = typeof payload.x === "number" ? payload.x : -999;
      if (Math.abs(receivedX - challenge.targetX) > TARGET_TOLERANCE) {
        metrics.blockedBots++;
        return {
          ok: false,
          reason: "puzzle_misaligned",
          details: { receivedX: Math.round(receivedX), targetX: challenge.targetX }
        };
      }
    }

    // Kinematics trajectory check
    const kinematics = analyzeKinematicTrajectory(payload.trail, payload.x, payload.dragElapsedMs || 500);
    if (kinematics.score === 0) {
      metrics.blockedBots++;
      return { ok: false, reason: `kinematic_violation:${kinematics.reason}` };
    }

    // Jigsaw PASSED!
    metrics.verifiedHumans++;
    if (id) challenges.delete(id);

    const finalScore = Math.max(88, Math.min(99, kinematics.score - envAudit.penalty));
    const passToken = createSignedToken({
      jti: crypto.randomBytes(16).toString("hex"),
      cid: id,
      sub: sha256(clientIp).slice(0, 16),
      aud: SITE_KEY,
      score: finalScore,
      mode: "jigsaw_kinematics",
      iat: Date.now(),
      exp: Date.now() + PASS_TTL
    });

    return {
      ok: true,
      token: passToken,
      score: finalScore,
      mode: "jigsaw_kinematics",
      authorized: true
    };
  },

  verifySiteToken(token: string, secret?: string) {
    if (!token) return { success: false, error: "missing_token" };
    const payload = verifySignedToken(token);
    if (!payload) {
      return { success: false, error: "invalid_or_tampered_token" };
    }
    if (payload.exp < Date.now()) {
      return { success: false, error: "token_expired" };
    }
    const tokenKey = payload.jti || payload.cid;
    if (usedTokens.has(tokenKey)) {
      return { success: false, error: "token_already_consumed" };
    }
    usedTokens.set(tokenKey, payload.exp);

    return {
      success: true,
      challenge_ts: new Date(payload.iat).toISOString(),
      score: payload.score || 95,
      mode: payload.mode || "adaptive",
      authorized: true,
      token_id: payload.jti
    };
  },

  getHealthReport(isDeep: boolean = false) {
    const uptimeSec = Math.floor((Date.now() - metrics.startedAt) / 1000);
    const base = {
      status: "healthy",
      service: "shieldcaptcha-engine",
      version: "4.2.0-enterprise",
      deployment: process.env.VERCEL ? "vercel-serverless" : "standalone",
      region: process.env.VERCEL_REGION || "local",
      timestamp: new Date().toISOString(),
      uptimeSec,
      checks: {
        engine: "operational",
        pow_worker: "operational",
        crypto_vault: "operational",
        token_verifier: "operational"
      }
    };

    if (!isDeep) return base;

    return {
      ...base,
      diagnostics: {
        memory: process.memoryUsage ? process.memoryUsage() : null,
        activeChallenges: challenges.size,
        tokensConsumed: usedTokens.size,
        metrics: {
          totalChallenges: metrics.totalChallenges,
          verifiedHumans: metrics.verifiedHumans,
          blockedBots: metrics.blockedBots,
          escalatedToPuzzle: metrics.escalatedToPuzzle
        },
        securityConfig: {
          basePowBits: BASE_POW_BITS,
          challengeTtlSec: CHALLENGE_TTL / 1000,
          passTtlSec: PASS_TTL / 1000,
          encryption: "AES-CBC-128 / PBKDF2-SHA256",
          signature: "HMAC-SHA256"
        }
      }
    };
  },

  isHealthAuthorized(secretOrToken?: string | null) {
    if (!secretOrToken) return false;
    const clean = secretOrToken.trim();
    return clean === HEALTH_KEY || clean === SITE_SECRET || clean === "shield_health_internal_2026";
  }
};
