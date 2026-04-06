-- Extend bgg_catalog with ranking and category data from boardgames_ranks.csv
ALTER TABLE bgg_catalog ADD COLUMN rank              INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN bgg_rating        REAL;
ALTER TABLE bgg_catalog ADD COLUMN users_rated       INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN abstracts_rank    INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN cgs_rank          INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN childrensgames_rank INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN familygames_rank  INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN partygames_rank   INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN strategygames_rank INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN thematic_rank     INTEGER;
ALTER TABLE bgg_catalog ADD COLUMN wargames_rank     INTEGER;
