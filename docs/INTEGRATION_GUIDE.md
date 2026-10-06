# ShieldCaptcha Enterprise v4.0 — Integration Guide

ShieldCaptcha Enterprise v4.0 is a zero-dependency dual-mode bot defense system combining **1-Click Turnstile (PoW)** and **Anti-CV Magnetic Jigsaw Puzzle**.

---

## 1. Quick Architecture Overview

```
[ Client Browser ]
        │  1. GET / POST /api/challenge (PoW bits + nonce prefix + session salt)
        ▼
[ ShieldCaptcha Engine ]
        │  2. Background Worker solves PoW & evaluates natural user action
        ▼
[ Client Submits Form ] (Includes HMAC-signed single-use Token)
        │  3. Client POST /api/login to Your Backend Server
        ▼
[ Your Backend Server ]
        │  4. POST /api/siteverify to ShieldCaptcha (Bearer SITE_SECRET)
        ▼
[ ShieldCaptcha Authorization ]
        │  5. Validates HMAC signature, single-use `jti`, IP hash, & score
        ▼
[ Access Granted / Denied ]
```

---

## 2. Frontend Integration

### A. Vanilla HTML & JavaScript

```html
<!-- 1. Include the SDK -->
<script src="https://shieldcaptcha.vercel.app/captcha.js"></script>

<!-- 2. Form Container -->
<form id="my-form">
  <input type="email" id="email" placeholder="user@company.com" required />
  
  <!-- Mount target -->
  <div id="captcha-box"></div>

  <button type="submit" id="submit-btn" disabled>Submit</button>
</form>

<script>
  let captchaToken = '';

  // Mount the widget
  ShieldCaptcha.mount(document.getElementById('captcha-box'), {
    mode: 'checkbox', // Options: 'checkbox' | 'jigsaw' | 'adaptive'
    onToken: (token, meta) => {
      captchaToken = token;
      document.getElementById('submit-btn').disabled = false;
      console.log('Verified! Trust Score:', meta.score);
    },
    onReset: () => {
      captchaToken = '';
      document.getElementById('submit-btn').disabled = true;
    }
  });

  document.getElementById('my-form').onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        token: captchaToken
      })
    });
    const data = await res.json();
    alert(data.success ? 'Success!' : 'Verification rejected');
  };
</script>
```

---

### B. React / Next.js Component

```tsx
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    ShieldCaptcha: any;
  }
}

interface ShieldCaptchaProps {
  mode?: 'checkbox' | 'jigsaw' | 'adaptive';
  onVerify: (token: string) => void;
}

export const ShieldCaptchaWidget: React.FC<ShieldCaptchaProps> = ({ mode = 'checkbox', onVerify }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<any>(null);

  useEffect(() => {
    // Dynamically load captcha.js if not already present
    if (!window.ShieldCaptcha) {
      const script = document.createElement('script');
      script.src = 'https://shieldcaptcha.vercel.app/captcha.js';
      script.async = true;
      script.onload = () => initWidget();
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      if (containerRef.current && window.ShieldCaptcha) {
        const c = window.ShieldCaptcha.mount(containerRef.current, {
          mode,
          onToken: (token: string) => onVerify(token),
          onReset: () => onVerify('')
        });
        setController(c);
      }
    }
  }, [mode]);

  return <div ref={containerRef} className="shield-captcha-wrapper" />;
};
```

---

## 3. Backend Token Verification (`/api/siteverify`)

Whenever your frontend submits a protected form, pass the `captchaToken` to your backend. Your backend then verifies it with the ShieldCaptcha server.

### A. Node.js (Express / Fastify)

```javascript
const express = require('express');
const app = express();
app.use(express.json());

const CAPTCHA_SERVER = process.env.CAPTCHA_SERVER || 'https://shieldcaptcha.vercel.app';
const SITE_SECRET = process.env.SITE_SECRET || 'sec_shield_live_...';

app.post('/api/login', async (req, res) => {
  const { email, password, captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ success: false, error: 'missing_captcha_token' });
  }

  // Verify single-use token with ShieldCaptcha server
  const verifyRes = await fetch(`${CAPTCHA_SERVER}/api/siteverify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SITE_SECRET}`
    },
    body: JSON.stringify({
      token: captchaToken,
      ip: req.socket.remoteAddress // Cryptographic IP binding check
    })
  });

  const { success, score, mode, error } = await verifyRes.json();

  if (!success || score < 30) {
    return res.status(403).json({ success: false, error: 'captcha_failed: ' + (error || 'low_score') });
  }

  // Token is verified and consumed! Proceed with user authentication
  res.json({ success: true, message: `Authenticated ${email} (score: ${score})` });
});

app.listen(8080);
```

---

### B. Python (FastAPI)

```python
from fastapi import FastAPI, HTTPException, Request
import requests
import os

app = FastAPI()

CAPTCHA_SERVER = os.getenv("CAPTCHA_SERVER", "https://shieldcaptcha.vercel.app")
SITE_SECRET = os.getenv("SITE_SECRET", "sec_shield_live_...")

@app.post("/api/login")
async def login(req: Request, payload: dict):
    token = payload.get("captchaToken")
    if not token:
        raise HTTPException(status_code=400, detail="Missing CAPTCHA token")

    # Authorize with ShieldCaptcha server
    res = requests.post(
        f"{CAPTCHA_SERVER}/api/siteverify",
        headers={"Authorization": f"Bearer {SITE_SECRET}"},
        json={
            "token": token,
            "ip": req.client.host
        },
        timeout=5
    )
    result = res.json()

    if not result.get("success") or result.get("score", 0) < 30:
        raise HTTPException(status_code=403, detail="Bot protection authorization failed")

    return {
        "success": True,
        "user": payload.get("email"),
        "trust_score": result.get("score"),
        "mode": result.get("mode")
    }
```

---

### C. PHP

```php
<?php
$token = $_POST['captchaToken'] ?? '';
$siteSecret = 'sec_shield_live_...';
$clientIp = $_SERVER['REMOTE_ADDR'];

$ch = curl_init('https://shieldcaptcha.vercel.app/api/siteverify');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $siteSecret
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'token' => $token,
        'ip' => $clientIp
    ])
]);

$response = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!$response['success'] || $response['score'] < 30) {
    http_response_code(403);
    echo json_encode(['error' => 'CAPTCHA authorization failed']);
    exit;
}

echo json_encode(['success' => true, 'score' => $response['score']]);
?>
```

---

### D. Go (Golang)

```go
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

type SiteVerifyResponse struct {
	Success bool   `json:"success"`
	Score   int    `json:"score"`
	Mode    string `json:"mode"`
	Error   string `json:"error,omitempty"`
}

func VerifyCaptcha(captchaServer, secret, token, clientIP string) (bool, int, error) {
	payload, _ := json.Marshal(map[string]string{
		"token": token,
		"ip":    clientIP,
	})

	req, err := http.NewRequest("POST", captchaServer+"/api/siteverify", bytes.NewBuffer(payload))
	if err != nil {
		return false, 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+secret)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false, 0, err
	}
	defer resp.Body.Close()

	var verifyRes SiteVerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyRes); err != nil {
		return false, 0, err
	}

	return verifyRes.Success && verifyRes.Score >= 30, verifyRes.Score, nil
}
```

---

## 4. Modes Supported

| Mode | Behavior | Best Use Case |
|---|---|---|
| `checkbox` | Frictionless 1-Click Proof-of-Work with ambient entropy | Login, Signups, Newsletter Subscriptions |
| `jigsaw` | Anti-CV procedural image cutout slider with kinematic minimum-jerk analysis | High-value payments, sensitive account settings, password resets |
| `adaptive` | Starts with 1-Click Checkbox; automatically steps up to Jigsaw if suspicious automation is detected | Default enterprise standard |
