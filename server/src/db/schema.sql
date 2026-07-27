CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  is_private INTEGER NOT NULL DEFAULT 0,
  answer_time_seconds INTEGER NOT NULL,
  rounds_count INTEGER NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT
);

CREATE TABLE IF NOT EXISTS game_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  final_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  is_tiebreaker INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS round_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  votes_received INTEGER NOT NULL DEFAULT 0,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_round_answers_round_id ON round_answers(round_id);

-- Guest-profile economy (device-id based, no auth — see server/README.md for the tradeoff).
CREATE TABLE IF NOT EXISTS players (
  device_id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  device_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, item_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT
);

CREATE TABLE IF NOT EXISTS hall_of_fame_votes (
  device_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  voted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, entry_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_device ON inventory(device_id);
CREATE INDEX IF NOT EXISTS idx_notifications_device ON notifications(device_id);
CREATE INDEX IF NOT EXISTS idx_hof_votes_entry ON hall_of_fame_votes(entry_id);

-- Real-money coin purchases via PayPal (sandbox first). UNIQUE(paypal_order_id) is the
-- idempotency guard: a capture retry for the same order must never credit coins twice.
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  paypal_order_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  amount_usd REAL NOT NULL,
  coins_credited INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_device ON transactions(device_id);

-- Passwordless email recovery. `players.email` is added via a guarded ALTER TABLE in
-- db/index.mts (SQLite has no `ADD COLUMN IF NOT EXISTS`, and this file re-runs on every
-- boot against a real, already-populated production DB — see initDb()).
CREATE TABLE IF NOT EXISTS recovery_codes (
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  device_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recovery_codes_email ON recovery_codes(email);

-- PayPal Subscriptions-based Premium tier. A device has at most one active subscription.
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  device_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_premium_device ON premium_subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscription ON premium_subscriptions(subscription_id);

-- One row per (device, question) the player has actually been served in ANSWERING phase.
-- Drives the category-completion % feature. PRIMARY KEY means a repeat viewing doesn't
-- duplicate or need an update — "have they ever seen it" is all this tracks.
CREATE TABLE IF NOT EXISTS player_seen_questions (
  device_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_seen_questions_device_category ON player_seen_questions(device_id, category);
