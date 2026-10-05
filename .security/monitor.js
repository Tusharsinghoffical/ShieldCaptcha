/**
 * ShieldCaptcha Self-Defense & Security Monitoring Layer
 * Zero-crash fail-safe middleware with SQLite event storage & alert logging.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

const ALERTS_LOG = path.join(__dirname, 'alerts.log');
const PYTHON_SCRIPT = path.join(__dirname, 'db-init.py');

// Known Scanner User-Agents
const SCANNER_UA_REGEX = /(sqlmap|nikto|acunetix|masscan|zgrab|nmap|havij|dirbuster|gobuster|wpscan|hydra)/i;

// Attack Payload Signatures
const SQLI_REGEX = /(\b(UNION(\s+ALL)?\s+SELECT|SELECT\s+.+\s+FROM|SLEEP\(\d+\)|BENCHMARK\(\d+|INFORMATION_SCHEMA)\b|--\s*$|'\s*OR\s*'\d+'='\d+|'\s*OR\s*1=1)/i;
const XSS_REGEX = /(<script\b[^>]*>|javascript:\s*|onerror\s*=|onload\s*=|document\.(cookie|location)|alert\(|prompt\()/i;
const TRAVERSAL_REGEX = /(\.\.[\/\\]|\/etc\/passwd|c:\\windows|win\.ini)/i;
const HONEYPOT_PATHS = ['/wp-admin', '/.env', '/.git', '/.aws', '/phpmyadmin', '/wp-login.php', '/config.json', '/actuator'];

// In-Memory Real-Time Guard
const blockedIps = new Map();
const rateWindow = new Map();
let alertCounter = 0;
let lastAlertReset = Date.now();

// Redact & Sanitize Payload Snippet
function sanitizePayload(obj) {
  if (!obj) return '';
  try {
    let str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    // Mask passwords, secrets, tokens
    str = str.replace(/(["']?(password|secret|token|captcha|apiKey|secretKey)["']?\s*[:=]\s*["'])([^"']{4})[^"']*(["'])/gi, '$1$3****$4');
    // Prevent log injection
    str = str.replace(/[\r\n\x00-\x1f]/g, ' ');
    return str.slice(0, 200);
  } catch {
    return '[UNPARSABLE]';
  }
}

// Persist Event to SQLite via python helper (asynchronous & non-blocking)
function persistEvent(event) {
  try {
    const payload = JSON.stringify(event);
    const child = spawn('python', [PYTHON_SCRIPT, 'log', payload], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch (err) {
    // Fail-safe: never crash host app
  }
}

// Write to alerts.log
function writeAlertFile(event) {
  try {
    const line = `[${event.timestamp}] [${event.severity}] [${event.rule_id}] IP: ${event.source_ip} | Route: ${event.method} ${event.route} | Action: ${event.action_taken} | Details: ${event.payload_snippet}\n`;
    fs.appendFileSync(ALERTS_LOG, line, 'utf8');
  } catch {}
}

// Rate limiting alert frequency (max 20 console alerts per minute to prevent flooding)
function emitAlert(event) {
  const now = Date.now();
  if (now - lastAlertReset > 60000) {
    alertCounter = 0;
    lastAlertReset = now;
  }
  alertCounter++;
  if (alertCounter <= 20) {
    console.warn(`🚨 [SECURITY ALERT] ${event.severity} - ${event.rule_id} from ${event.source_ip} on ${event.method} ${event.route} -> ${event.action_taken}`);
  }
  writeAlertFile(event);
  persistEvent(event);
}

// Block IP helper
function blockIp(ip, reason, durationSec = 600) {
  const expiresAt = Date.now() + (durationSec * 1000);
  blockedIps.set(ip, { reason, expiresAt });
  try {
    const child = spawn('python', [PYTHON_SCRIPT, 'block', ip, reason, String(durationSec)], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch {}
}

function unblockIp(ip) {
  blockedIps.delete(ip);
  try {
    const child = spawn('python', [PYTHON_SCRIPT, 'unblock', ip], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch {}
}

function isBlocked(ip) {
  const entry = blockedIps.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    blockedIps.delete(ip);
    return false;
  }
  return true;
}

// Core Detection Middleware (Zero-crash safe)
function inspectRequest(req, rawBody = null) {
  try {
    const clientIp = req.socket?.remoteAddress || '127.0.0.1';
    const normIp = clientIp.startsWith('::ffff:') ? clientIp.replace('::ffff:', '') : clientIp;
    const ua = req.headers['user-agent'] || '';
    const url = req.url || '/';
    const method = req.method || 'GET';
    const parsedPath = url.split('?')[0];

    // 1. Check if IP is already in block list
    if (isBlocked(normIp)) {
      return {
        blocked: true,
        statusCode: 403,
        response: { error: 'Request blocked' }
      };
    }

    // 2. Honeypot check (routes legitimate users never visit)
    for (const honey of HONEYPOT_PATHS) {
      if (parsedPath.startsWith(honey)) {
        blockIp(normIp, `HONEYPOT_HIT_${honey}`, 600);
        emitAlert({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          event_type: 'HONEYPOT',
          severity: 'HIGH',
          rule_id: 'HONEYPOT_ACCESS',
          source_ip: normIp,
          user_agent: ua.slice(0, 100),
          route: parsedPath,
          method,
          payload_snippet: `Targeted honeypot: ${honey}`,
          action_taken: 'IP_BLOCKED_10M'
        });
        return {
          blocked: true,
          statusCode: 403,
          response: { error: 'Request blocked' }
        };
      }
    }

    // 3. Known scanner user-agents
    if (SCANNER_UA_REGEX.test(ua)) {
      blockIp(normIp, 'AUTOMATED_SCANNER_UA', 600);
      emitAlert({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        event_type: 'SCANNER',
        severity: 'HIGH',
        rule_id: 'SCANNER_UA_DETECTED',
        source_ip: normIp,
        user_agent: ua.slice(0, 100),
        route: parsedPath,
        method,
        payload_snippet: `Scanner UA: ${ua.slice(0, 80)}`,
        action_taken: 'IP_BLOCKED_10M'
      });
      return {
        blocked: true,
        statusCode: 403,
        response: { error: 'Request blocked' }
      };
    }

    // 4. Inspection of URL & Body for Injection Attacks (SQLi, XSS, Path Traversal)
    const inspectionStrings = [url];
    if (rawBody) {
      if (typeof rawBody === 'string') inspectionStrings.push(rawBody);
      else inspectionStrings.push(JSON.stringify(rawBody));
    }

    for (const candidate of inspectionStrings) {
      if (SQLI_REGEX.test(candidate)) {
        blockIp(normIp, 'SQL_INJECTION_PROBE', 600);
        emitAlert({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          event_type: 'INJECTION',
          severity: 'CRITICAL',
          rule_id: 'SQLI_PROBE',
          source_ip: normIp,
          user_agent: ua.slice(0, 100),
          route: parsedPath,
          method,
          payload_snippet: sanitizePayload(candidate),
          action_taken: 'IP_BLOCKED_10M'
        });
        return {
          blocked: true,
          statusCode: 403,
          response: { error: 'Request blocked' }
        };
      }

      if (TRAVERSAL_REGEX.test(candidate)) {
        blockIp(normIp, 'PATH_TRAVERSAL_PROBE', 600);
        emitAlert({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          event_type: 'TRAVERSAL',
          severity: 'HIGH',
          rule_id: 'PATH_TRAVERSAL',
          source_ip: normIp,
          user_agent: ua.slice(0, 100),
          route: parsedPath,
          method,
          payload_snippet: sanitizePayload(candidate),
          action_taken: 'IP_BLOCKED_10M'
        });
        return {
          blocked: true,
          statusCode: 403,
          response: { error: 'Request blocked' }
        };
      }

      if (XSS_REGEX.test(candidate) && !parsedPath.startsWith('/captcha.js') && !parsedPath.startsWith('/demo')) {
        emitAlert({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          event_type: 'XSS',
          severity: 'MEDIUM',
          rule_id: 'XSS_PAYLOAD_DETECTED',
          source_ip: normIp,
          user_agent: ua.slice(0, 100),
          route: parsedPath,
          method,
          payload_snippet: sanitizePayload(candidate),
          action_taken: 'REQUEST_BLOCKED'
        });
        return {
          blocked: true,
          statusCode: 403,
          response: { error: 'Request blocked' }
        };
      }
    }

    return { blocked: false };
  } catch (err) {
    // Fail-safe: monitor errors must NEVER break legitimate traffic
    return { blocked: false };
  }
}

// CLI Interface for npm run security:events
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  if (command === 'list') {
    const limit = args[1] || '20';
    const proc = spawn('python', [PYTHON_SCRIPT, 'list', limit], { stdio: 'inherit' });
  } else if (command === 'blocked') {
    const proc = spawn('python', [PYTHON_SCRIPT, 'blocked'], { stdio: 'inherit' });
  } else if (command === 'unblock') {
    const ip = args[1];
    if (!ip) {
      console.error("Usage: node monitor.js unblock <ip>");
      process.exit(1);
    }
    const proc = spawn('python', [PYTHON_SCRIPT, 'unblock', ip], { stdio: 'inherit' });
  } else if (command === 'prune') {
    const proc = spawn('python', [PYTHON_SCRIPT, 'prune'], { stdio: 'inherit' });
  } else {
    console.log("Usage: node monitor.js [list|blocked|unblock <ip>|prune]");
  }
}

// Priority 3: Automated daily maintenance pruning (90-day retention)
function triggerPruning() {
  try {
    const child = spawn('python', [PYTHON_SCRIPT, 'prune'], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch {}
}
// Prune once shortly after startup, then every 24 hours
setTimeout(triggerPruning, 5000).unref();
setInterval(triggerPruning, 24 * 60 * 60 * 1000).unref();

module.exports = {
  inspectRequest,
  blockIp,
  unblockIp,
  isBlocked,
  emitAlert,
  triggerPruning
};
