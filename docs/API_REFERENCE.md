# ShieldCaptcha Enterprise v4.0 — API Reference

All requests and responses use `application/json; charset=utf-8`.

---

## 1. Challenge Generation Endpoint

### `POST /api/challenge` or `POST /captcha/challenge`

Generates an adaptive challenge session with leading-zero Proof-of-Work difficulty.

#### Request Body:
```json
{
  "mode": "checkbox" // "checkbox" | "jigsaw" | "adaptive"
}
```

#### Response (200 OK) — Checkbox Mode:
```json
{
  "id": "df324ea7a949669caa09308430883555",
  "mode": "checkbox",
  "salt": "a4d8c7e9f1...",
  "bits": 12,
  "prefix": "3c39d12b95ad2df34fe3",
  "siteKey": "pub_shield_live_...",
  "token": "<Signed-Challenge-Session-Token>"
}
```

#### Response (200 OK) — Jigsaw Mode:
```json
{
  "id": "81a777a160d6fdca4634bbfc3e941d2f",
  "mode": "jigsaw",
  "salt": "b9f2c8...",
  "bits": 12,
  "prefix": "e7c10b...",
  "siteKey": "pub_shield_live_...",
  "bg": "data:image/png;base64,...",
  "piece": "data:image/png;base64,...",
  "pieceY": 48,
  "token": "<Signed-Challenge-Session-Token>"
}
```

---

## 2. Challenge Verification Endpoint

### `POST /api/verify` or `POST /captcha/verify`

Validates Proof-of-Work solution, kinematic trajectory, and client environment integrity.

#### Request Body (Plain or XOR Encrypted):
```json
{
  "id": "df324ea7a949669caa09308430883555",
  "nonce": "1a3",
  "powDuration": 18,
  "trail": [[0, 20, 100], [50, 21, 140], [140, 20, 220]],
  "trustedEvent": true,
  "honeypot": "",
  "env": {
    "webdriver": false,
    "isHeadless": false,
    "languages": 2,
    "timezone": "Asia/Kolkata"
  }
}
```

#### Response (200 OK) — Passed:
```json
{
  "ok": true,
  "token": "<Signed-Single-Use-Authorization-Token>",
  "score": 95,
  "mode": "checkbox_pow",
  "audit": {
    "kinematics": {
      "velocity": "natural_organic",
      "tremor": "physiological_tremor"
    },
    "powBits": 12
  }
}
```

#### Response (200 OK) — Step-Up Required (Suspicious Click Escalation):
```json
{
  "ok": false,
  "escalate": true,
  "reason": "step_up_challenge_required",
  "challenge": {
    "id": "step_up_id...",
    "mode": "jigsaw",
    "bits": 14,
    "prefix": "...",
    "bg": "data:image/png;base64,...",
    "piece": "data:image/png;base64,...",
    "pieceY": 54
  }
}
```

#### Response (200 OK) — Rejected:
```json
{
  "ok": false,
  "reason": "puzzle_misaligned",
  "details": { "receivedX": 50 }
}
```

---

## 3. Server-to-Server Site Verification

### `POST /api/siteverify` or `POST /captcha/siteverify`

Validates the client-submitted authorization token on your backend.

#### Headers:
```http
Authorization: Bearer <YOUR_SITE_SECRET>
Content-Type: application/json
```
*(Also supports `X-Site-Secret` or `X-API-Key` headers)*

#### Request Body:
```json
{
  "token": "<Signed-Single-Use-Authorization-Token>",
  "ip": "203.0.113.195" // Optional: Client IP for cryptographic binding verification
}
```

#### Response (200 OK) — Validated:
```json
{
  "success": true,
  "score": 95,
  "mode": "checkbox_pow",
  "authorized": true,
  "siteKey": "pub_shield_live_...",
  "tokenId": "7a11f6ef39d296628c23dc342fb9a4ab",
  "verifiedAt": 1791102057893
}
```

#### Response (200 OK) — Rejected / Already Used:
```json
{
  "success": false,
  "error": "token_already_consumed"
}
```

---

## 4. Live Threat Analytics

### `GET /api/stats`

Returns aggregated real-time security telemetry.

#### Response (200 OK):
```json
{
  "totalChallenges": 142,
  "verifiedHumans": 138,
  "blockedBots": 4,
  "escalatedToPuzzle": 12,
  "modeStats": { "checkbox": 95, "jigsaw": 47, "adaptive": 12 },
  "siteKey": "pub_shield_live_...",
  "uptimeSec": 3600,
  "activeChallenges": 2,
  "activeRateLimiters": 8
}
```
