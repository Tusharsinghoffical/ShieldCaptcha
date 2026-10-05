#!/usr/bin/env python3
"""
ShieldCaptcha Security Monitor Database Initializer & CLI
Manages .security/monitor.sqlite
"""

import sys
import os
import sqlite3
import json
from datetime import datetime, timezone, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'monitor.sqlite')
LOG_RETENTION_DAYS = 90

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. security_events (append-only)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS security_events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        rule_id TEXT NOT NULL,
        source_ip TEXT NOT NULL,
        user_agent TEXT,
        route TEXT NOT NULL,
        method TEXT NOT NULL,
        request_id TEXT,
        user_id TEXT,
        payload_snippet TEXT,
        action_taken TEXT NOT NULL
    )
    ''')
    
    # 2. blocked_ips table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS blocked_ips (
        ip TEXT PRIMARY KEY,
        reason TEXT NOT NULL,
        blocked_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
    )
    ''')
    
    # Indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_ip ON security_events (source_ip)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON security_events (timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_rule ON security_events (rule_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_blocked_expires ON blocked_ips (expires_at)')
    
    conn.commit()
    conn.close()

def log_event(event_dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR REPLACE INTO security_events (
        id, timestamp, event_type, severity, rule_id,
        source_ip, user_agent, route, method, request_id,
        user_id, payload_snippet, action_taken
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        event_dict.get('id'),
        event_dict.get('timestamp') or datetime.now(timezone.utc).isoformat(),
        event_dict.get('event_type', 'PROBE'),
        event_dict.get('severity', 'MEDIUM'),
        event_dict.get('rule_id', 'RULE_GENERIC'),
        event_dict.get('source_ip', '127.0.0.1'),
        event_dict.get('user_agent', 'unknown'),
        event_dict.get('route', '/'),
        event_dict.get('method', 'GET'),
        event_dict.get('request_id', ''),
        event_dict.get('user_id'),
        event_dict.get('payload_snippet', ''),
        event_dict.get('action_taken', 'BLOCKED')
    ))
    conn.commit()
    conn.close()

def block_ip(ip, reason, duration_sec=600):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    expires = now + timedelta(seconds=duration_sec)
    cursor.execute('''
    INSERT OR REPLACE INTO blocked_ips (ip, reason, blocked_at, expires_at)
    VALUES (?, ?, ?, ?)
    ''', (ip, reason, now.isoformat(), expires.isoformat()))
    conn.commit()
    conn.close()

def unblock_ip(ip):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM blocked_ips WHERE ip = ?', (ip,))
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return count

def prune_retention():
    conn = get_connection()
    cursor = conn.cursor()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=LOG_RETENTION_DAYS)).isoformat()
    cursor.execute('DELETE FROM security_events WHERE timestamp < ?', (cutoff,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted

def list_events(limit=50, filter_ip=None):
    conn = get_connection()
    cursor = conn.cursor()
    if filter_ip:
        cursor.execute('SELECT * FROM security_events WHERE source_ip = ? ORDER BY timestamp DESC LIMIT ?', (filter_ip, limit))
    else:
        cursor.execute('SELECT * FROM security_events ORDER BY timestamp DESC LIMIT ?', (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def list_blocked():
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute('SELECT * FROM blocked_ips WHERE expires_at > ? ORDER BY blocked_at DESC', (now,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

if __name__ == '__main__':
    init_db()
    args = sys.argv[1:]
    if not args or args[0] == 'init':
        print(f"[Monitor DB] Initialized at {DB_PATH}")
    elif args[0] == 'log' and len(args) > 1:
        data = json.loads(args[1])
        log_event(data)
        print("OK")
    elif args[0] == 'block' and len(args) > 2:
        block_ip(args[1], args[2], int(args[3]) if len(args) > 3 else 600)
        print(f"Blocked {args[1]}")
    elif args[0] == 'unblock' and len(args) > 1:
        cnt = unblock_ip(args[1])
        print(f"Unblocked {args[1]} (rows: {cnt})")
    elif args[0] == 'list':
        limit = int(args[1]) if len(args) > 1 else 50
        print(json.dumps(list_events(limit), indent=2))
    elif args[0] == 'blocked':
        print(json.dumps(list_blocked(), indent=2))
    elif args[0] == 'prune':
        del_count = prune_retention()
        print(f"Pruned {del_count} events older than {LOG_RETENTION_DAYS} days")
