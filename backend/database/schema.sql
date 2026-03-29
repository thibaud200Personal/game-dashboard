-- Board Game Score Database Schema
-- Based on database-structure.md from the repository

-- Players table
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    avatar TEXT,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0.0,
    favorite_game TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bgg_id INTEGER UNIQUE,
    thumbnail TEXT,
    playing_time INTEGER,
    min_playtime INTEGER,
    max_playtime INTEGER,
    categories TEXT, -- JSON array
    mechanics TEXT, -- JSON array
    families TEXT, -- JSON array
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    duration TEXT,
    difficulty TEXT,
    category TEXT,
    year_published INTEGER,
    publisher TEXT,
    designer TEXT,
    bgg_rating REAL,
    weight REAL,
    age_min INTEGER,
    game_type TEXT CHECK(game_type IN ('competitive', 'cooperative', 'campaign', 'hybrid')) DEFAULT 'competitive',
    supports_cooperative BOOLEAN DEFAULT FALSE,
    supports_competitive BOOLEAN DEFAULT FALSE,
    supports_campaign BOOLEAN DEFAULT FALSE,
    supports_hybrid BOOLEAN DEFAULT FALSE,
    has_expansion BOOLEAN DEFAULT FALSE,
    has_characters BOOLEAN DEFAULT FALSE,
    is_expansion INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game expansions table
CREATE TABLE game_expansions (
    expansion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    bgg_expansion_id INTEGER,
    name TEXT NOT NULL,
    year_published INTEGER,
    description TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Game characters/roles table
CREATE TABLE game_characters (
    character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    character_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    abilities TEXT, -- JSON string of abilities array
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Game sessions table
CREATE TABLE game_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER,
    winner_player_id INTEGER,
    session_type TEXT CHECK(session_type IN ('competitive', 'cooperative', 'campaign')) DEFAULT 'competitive',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_player_id) REFERENCES players(player_id) ON DELETE SET NULL
);

-- Session players (who played in each session)
CREATE TABLE session_players (
    session_player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    character_id INTEGER,
    score INTEGER DEFAULT 0,
    placement INTEGER,
    is_winner BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES game_characters(character_id) ON DELETE SET NULL
);

-- BGG Catalog table — local index of all BGG games (imported from monthly CSV dump)
-- Used for fast full-text search + year/expansion filtering without hitting the BGG API
CREATE TABLE IF NOT EXISTS bgg_catalog (
    bgg_id         INTEGER PRIMARY KEY,
    name           TEXT NOT NULL,
    year_published INTEGER,
    is_expansion   INTEGER NOT NULL DEFAULT 0
);

-- Import / Export log — single-row table tracking last date of each data operation
CREATE TABLE IF NOT EXISTS log_import (
    id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    bgg_catalog_imported_at TIMESTAMP,
    data_exported_at        TIMESTAMP,
    data_imported_at        TIMESTAMP
);
INSERT OR IGNORE INTO log_import (id) VALUES (1);

-- Indexes for better performance
CREATE INDEX idx_games_bgg_id ON games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_bgg_catalog_name ON bgg_catalog(name);
CREATE INDEX idx_game_expansions_game_id ON game_expansions(game_id);
CREATE INDEX idx_game_characters_game_id ON game_characters(game_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_date ON game_sessions(session_date);
CREATE INDEX idx_session_players_session_id ON session_players(session_id);
CREATE INDEX idx_session_players_player_id ON session_players(player_id);

-- Triggers to update timestamps
CREATE TRIGGER update_players_timestamp 
    AFTER UPDATE ON players
    BEGIN
        UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE player_id = NEW.player_id;
    END;

CREATE TRIGGER update_games_timestamp 
    AFTER UPDATE ON games
    BEGIN
        UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE game_id = NEW.game_id;
    END;

-- Views for dynamic statistics
CREATE VIEW player_statistics AS
SELECT 
    p.player_id,
    p.player_name,
    p.avatar,
    COUNT(DISTINCT sp.session_id) as games_played,
    COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) as wins,
    COALESCE(SUM(sp.score), 0) as total_score,
    COALESCE(AVG(sp.score), 0) as average_score,
    (COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) * 100.0 / 
     NULLIF(COUNT(DISTINCT sp.session_id), 0)) as win_percentage,
    p.favorite_game,
    p.created_at
FROM players p
LEFT JOIN session_players sp ON p.player_id = sp.player_id
GROUP BY p.player_id, p.player_name, p.avatar, p.favorite_game, p.created_at;

CREATE VIEW game_statistics AS
SELECT 
    g.game_id,
    g.name,
    g.image,
    g.min_players,
    g.max_players,
    g.difficulty,
    g.category,
    g.year_published,
    g.bgg_rating,
    COUNT(DISTINCT gs.session_id) as times_played,
    (SELECT COUNT(DISTINCT sp.player_id) FROM session_players sp WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) as unique_players,
    (SELECT AVG(sp.score) FROM session_players sp WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) as average_score,
    (SELECT AVG(gs_inner.duration_minutes) FROM game_sessions gs_inner WHERE gs_inner.game_id = g.game_id) as average_duration,
    g.created_at
FROM games g
LEFT JOIN game_sessions gs ON g.game_id = gs.game_id
GROUP BY g.game_id;

-- Sample data insertion
INSERT INTO players (player_name, avatar, games_played, wins, total_score, average_score, favorite_game) VALUES
('Jane', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', 45, 28, 2100, 46.7, 'Strategy Pro'),
('Nexus', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', 38, 19, 1850, 48.7, 'Battle Arena'),
('Maya', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', 32, 15, 1620, 50.6, 'Mind Games'),
('Alex', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', 28, 12, 1420, 50.7, 'Strategy Pro');

INSERT INTO games (bgg_id, name, description, image, min_players, max_players, duration, difficulty, category, year_published, publisher, designer, bgg_rating, weight, age_min, game_type, supports_cooperative, supports_competitive, supports_campaign, supports_hybrid, has_expansion, has_characters) VALUES
(12345, 'Strategy Pro', 'A complex strategy game that challenges your tactical thinking.', 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=150&h=150&fit=crop', 2, 4, '60-90 min', 'Expert', 'Strategy', 2022, 'Strategy Games Inc.', 'John Designer', 7.8, 3.5, 14, 'competitive', FALSE, TRUE, TRUE, FALSE, FALSE, TRUE),
(23456, 'Battle Arena', 'Fast-paced combat game with multiple character classes.', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=150&fit=crop', 3, 6, '45-60 min', 'Intermediate', 'Combat', 2023, 'Combat Games Ltd.', 'Sarah Designer', 7.2, 2.8, 12, 'competitive', FALSE, TRUE, TRUE, FALSE, TRUE, TRUE),
(34567, 'Mind Games', 'Psychological warfare meets board game mechanics.', 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=150&h=150&fit=crop', 2, 8, '30-45 min', 'Beginner', 'Party', 2021, 'Mind Works', 'Alex Mindmaker', 6.9, 1.5, 10, 'competitive', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),
(45678, 'Cosmic Empire', 'Build your galactic empire across the stars.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop', 2, 5, '90-120 min', 'Expert', 'Strategy', 2020, 'Cosmic Games', 'Maria Cosmos', 8.1, 4.2, 16, 'competitive', FALSE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Insert game expansions
INSERT INTO game_expansions (game_id, bgg_expansion_id, name, year_published) VALUES
(2, 67890, 'Battle Arena: New Warriors', 2024),
(4, 45678, 'Cosmic Empire: Alien Worlds', 2021),
(4, 45679, 'Cosmic Empire: Deep Space', 2022);

-- Insert game characters
INSERT INTO game_characters (game_id, character_key, name, description, avatar, abilities) VALUES
(1, 'commander', 'Commander', 'Strategic military leader', 'https://images.unsplash.com/photo-1578632292335-fac9311c1dd4?w=100&h=100&fit=crop&crop=face', '["Battle Tactics", "Resource Management", "Unit Command"]'),
(2, 'warrior', 'Warrior', 'Fierce melee fighter', 'https://images.unsplash.com/photo-1578632292335-fac9311c1dd4?w=100&h=100&fit=crop&crop=face', '["Heavy Attack", "Shield Block", "Intimidate"]'),
(2, 'archer', 'Archer', 'Precise ranged combatant', 'https://images.unsplash.com/photo-1578632292335-fac9311c1dd4?w=100&h=100&fit=crop&crop=face', '["Long Shot", "Multi-Shot", "Eagle Eye"]'),
(4, 'explorer', 'Explorer', 'Galactic scout and pioneer', 'https://images.unsplash.com/photo-1578632292335-fac9311c1dd4?w=100&h=100&fit=crop&crop=face', '["System Discovery", "Resource Scanning", "Jump Drive"]'),
(4, 'diplomat', 'Diplomat', 'Inter-species negotiator', 'https://images.unsplash.com/photo-1578632292335-fac9311c1dd4?w=100&h=100&fit=crop&crop=face', '["Trade Agreements", "Alliance Formation", "Cultural Exchange"]');