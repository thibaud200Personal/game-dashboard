-- Table multilingue miroir de bgg_catalog
-- name_en = name de bgg_catalog (données BGG en anglais)
-- name_fr / name_es = à alimenter depuis une source externe
CREATE TABLE IF NOT EXISTS bgg_catalog_langue (
    bgg_id              INTEGER PRIMARY KEY,
    name_en             TEXT    NOT NULL,
    name_fr             TEXT,
    name_es             TEXT,
    year_published      INTEGER,
    is_expansion        INTEGER NOT NULL DEFAULT 0,
    rank                INTEGER,
    bgg_rating          REAL,
    users_rated         INTEGER,
    abstracts_rank      INTEGER,
    cgs_rank            INTEGER,
    childrensgames_rank INTEGER,
    familygames_rank    INTEGER,
    partygames_rank     INTEGER,
    strategygames_rank  INTEGER,
    thematic_rank       INTEGER,
    wargames_rank       INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bgg_catalog_langue_name_en ON bgg_catalog_langue(name_en);
CREATE INDEX IF NOT EXISTS idx_bgg_catalog_langue_name_fr ON bgg_catalog_langue(name_fr);
CREATE INDEX IF NOT EXISTS idx_bgg_catalog_langue_name_es ON bgg_catalog_langue(name_es);
