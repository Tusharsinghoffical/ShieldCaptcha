# ShieldCaptcha Enterprise v4.2 — Developer REST API Reference

ShieldCaptcha provides an enterprise-grade REST API for bot defense, human verification, multi-tenant API key management, and server-to-server token validation.

- **Base URL:** `http://localhost:3000` (or your configured production domain)
- **Supported Encodings:** `application/json` and `application/x-www-form-urlencoded`

---

## 1. Developer API Key Management

### `POST /api/v1/keys/create`
Generates a new public SiteKey and private SecretKey pair for your domains.

#### Request Body (`application/json`):
```json
{
  "name": "Production Storefront",
  "allowedDomains": ["store.example.com", "localhost"],
  "mode": "adaptive" // "adaptive" | "checkbox" | "jigsaw"
}
```

#### Response (201 Created):
```json
{
  "success": true,
  "message": "API Key pair generated successfully",
  "key": {
    "siteKey": "pub_shield_1e89f19bc422be2ebea11462",
    "secretKey": "sec_shield_82af936df77c22284deb13e4b71f8ffa",
    "name": "Production Storefront",
    "allowedDomains": ["store.example.com", "localhost"],
    "mode": "adaptive",
    "createdAt": "2026-10-04T11:49:36.123Z",
    "totalRequests": 0,
    "active": true
  }
}
```

---

### `GET /api/v1/keys/list`
Lists all active API keys registered on this ShieldCaptcha instance.

#### Response (200 OK):
```json
{
  "success": true,
  "count": 2,
  "keys": [
    {
      "siteKey": "pub_shield_live_cfe30e557c7abf646b575948",
      "secretKeyMasked": "sec_shield_live_...3469",
      "name": "Default Root Key",
      "allowedDomains": ["*"],
      "mode": "adaptive",
      "createdAt": "2026-10-04T11:29:04.179Z",
      "totalRequests": 45,
      "active": true
    }
  ]
}
```

---

### `POST /api/v1/keys/revoke`
Deactivates an API key.

#### Request Body:
```json
{
  "siteKey": "pub_shield_1e89f19bc422be2ebea11462"
}
```

---

## 2. Server-to-Server Verification (Standard `siteverify`)

### `POST /api/v1/siteverify` (also `POST /api/siteverify`)
Validates a client verification token submitted through a web form or mobile client. Compatible with standard reCAPTCHA and Turnstile implementations.

#### Supported Content-Types:
- `application/x-www-form-urlencoded`
- `application/json`

#### Parameters:
| Parameter | Type | Required | Description |
|---|---|---|---|
| `secret` | string | **Yes** | Your private Secret Key (`sec_shield_...`). Can also be passed via `Authorization: Bearer <secret>` or `X-Site-Secret` header. |
| `response` or `token` | string | **Yes** | The single-use verification token received from the frontend widget. |
| `remoteip` | string | Optional | End-user's IP address for cryptographic binding check. |

#### cURL Example:
```bash
curl -X POST "http://localhost:3000/api/v1/siteverify" \
  -d "secret=sec_shield_82af936df77c22284deb13e4b71f8ffa&response=TOKEN_FROM_FORM&remoteip=203.0.113.195"
```

#### Node.js / Express Example:
```javascript
const verifyCaptcha = async (token, clientIp) => {
  const response = await fetch("http://localhost:3000/api/v1/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.SHIELD_SECRET_KEY,
      response: token,
      remoteip: clientIp
    })
  });
  const data = await response.json();
  return data.success && data.score >= 50;
};
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "challenge_ts": "2026-10-04T11:49:36.123Z",
  "hostname": "example.com",
  "score": 95,
  "mode": "checkbox_pow",
  "authorized": true,
  "site_key": "pub_shield_1e89f19bc422be2ebea11462",
  "token_id": "e6bb3945171143179a8e758f291bfc9d",
  "verifiedAt": 1791114576123,
  "error-codes": []
}
```

#### Error Response (200 OK or 400 Bad Request):
```json
{
  "success": false,
  "error-codes": ["timeout-or-duplicate"],
  "error": "token_already_consumed"
}
```

Standard `error-codes`:
- `missing-input-secret`: Secret key parameter was missing.
- `invalid-input-secret`: Secret key provided is invalid or inactive.
- `missing-input-response`: Token parameter was missing.
- `invalid-input-response`: Token signature was invalid or tampered with.
- `timeout-or-duplicate`: Token expired or was already consumed (replay attack blocked).
- `bad-request`: Client IP binding mismatch.

---

## 3. Token Inspector (Dry-Run / Debugging)

### `POST /api/v1/token/inspect`
Inspects token claims, signature, and expiration **without consuming its single-use status**.

#### Request Body:
```json
{
  "token": "eyJqdGkiOiJlNmJiMzk0N..."
}
```

#### Response (200 OK):
```json
{
  "valid": true,
  "signatureValid": true,
  "expired": false,
  "consumed": false,
  "payload": {
    "tokenId": "e6bb3945171143179a8e758f291bfc9d",
    "challengeId": "9c3c32a3bb08ae5cdee8a7e5b9bb0d1a",
    "siteKey": "pub_shield_1e89f19bc422be2ebea11462",
    "mode": "checkbox_pow",
    "score": 95,
    "issuedAt": "2026-10-04T11:49:36.123Z",
    "expiresAt": "2026-10-04T11:51:36.123Z",
    "ttlRemainingSec": 118,
    "subIpHash": "4a7c1b82e9d3..."
  }
}
```

---

## 4. Challenge Endpoints (Client / Frontend)

### `POST /api/v1/challenge` (or `POST /api/challenge`)
Issues an adaptive Proof-of-Work challenge or anti-CV jigsaw slider puzzle.

#### Request Body:
```json
{
  "siteKey": "pub_shield_1e89f19bc422be2ebea11462",
  "mode": "adaptive"
}
```

---

## 5. System Health & Diagnostics

### `GET /api/v1/health`
Returns service health, version, uptime, and active key count.

#### Response:
```json
{
  "status": "healthy",
  "service": "ShieldCaptcha Enterprise Engine",
  "version": "4.2-enterprise",
  "uptimeSec": 420,
  "activeKeys": 3,
  "activeChallenges": 1,
  "timestamp": "2026-10-04T11:50:00.000Z"
}
```
