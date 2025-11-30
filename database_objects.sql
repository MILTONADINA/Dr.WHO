
-- VIEW: Doctor Episode Summary
-- Provides a summary of each Doctor with their episodes, companions, and enemies
CREATE OR REPLACE VIEW doctor_episode_summary AS
SELECT
    d.doctor_id,
    d.incarnation_number,
    a.name AS actor_name,
    d.catchphrase,
    COUNT(DISTINCT e.episode_id) AS total_episodes,
    COUNT(DISTINCT dc.companion_id) AS total_companions,
    COUNT(DISTINCT ee.enemy_id) AS total_enemies,
    MIN(e.air_date) AS first_episode_date,
    MAX(e.air_date) AS last_episode_date
FROM DOCTOR d
LEFT JOIN ACTORS a ON d.actor_id = a.actor_id
LEFT JOIN EPISODES e ON e.episode_id = d.first_episode_id OR e.episode_id = d.last_episode_id
    OR e.episode_id IN (
        SELECT DISTINCT dc.start_episode_id FROM DOCTOR_COMPANIONS dc WHERE dc.doctor_id = d.doctor_id
        UNION
        SELECT DISTINCT dc.end_episode_id FROM DOCTOR_COMPANIONS dc WHERE dc.doctor_id = d.doctor_id AND dc.end_episode_id IS NOT NULL
    )
LEFT JOIN DOCTOR_COMPANIONS dc ON dc.doctor_id = d.doctor_id
LEFT JOIN ENEMY_EPISODES ee ON ee.episode_id = e.episode_id
GROUP BY d.doctor_id, d.incarnation_number, a.name, d.catchphrase;

-- VIEW: Enemy Appearance Summary
-- Shows which enemies appear in which episodes with their threat levels
CREATE OR REPLACE VIEW enemy_appearance_summary AS
SELECT
    en.enemy_id,
    en.name AS enemy_name,
    en.threat_level,
    s.name AS species_name,
    p.name AS home_planet,
    COUNT(DISTINCT ee.episode_id) AS episode_count,
    GROUP_CONCAT(DISTINCT e.title ORDER BY e.air_date SEPARATOR ', ') AS episodes
FROM ENEMIES en
LEFT JOIN SPECIES s ON en.species_id = s.species_id
LEFT JOIN PLANETS p ON en.home_planet_id = p.planet_id
LEFT JOIN ENEMY_EPISODES ee ON en.enemy_id = ee.enemy_id
LEFT JOIN EPISODES e ON ee.episode_id = e.episode_id
GROUP BY en.enemy_id, en.name, en.threat_level, s.name, p.name;

-- STORED PROCEDURE: Get Enemies by Threat Level
-- Returns all enemies with a threat level greater than or equal to the specified level
DELIMITER $$
CREATE PROCEDURE GetEnemiesByThreatLevel(IN min_threat_level INT)
BEGIN
    SELECT
        e.enemy_id,
        e.name,
        e.threat_level,
        s.name AS species_name,
        p.name AS home_planet,
        COUNT(DISTINCT ee.episode_id) AS episode_appearances
    FROM ENEMIES e
    LEFT JOIN SPECIES s ON e.species_id = s.species_id
    LEFT JOIN PLANETS p ON e.home_planet_id = p.planet_id
    LEFT JOIN ENEMY_EPISODES ee ON e.enemy_id = ee.enemy_id
    WHERE e.threat_level >= min_threat_level
    GROUP BY e.enemy_id, e.name, e.threat_level, s.name, p.name
    ORDER BY e.threat_level DESC;
END $$
DELIMITER ;

-- STORED PROCEDURE: Get Episodes for Doctor
-- Returns all episodes associated with a specific Doctor incarnation
DELIMITER $$
CREATE PROCEDURE GetEpisodesForDoctor(IN doctor_incarnation INT)
BEGIN
    SELECT
        e.episode_id,
        e.title,
        e.air_date,
        e.runtime_minutes,
        s.series_number,
        s.year AS season_year,
        w.name AS writer_name,
        d.name AS director_name,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS companions,
        GROUP_CONCAT(DISTINCT en.name SEPARATOR ', ') AS enemies
    FROM DOCTOR doc
    INNER JOIN DOCTOR_COMPANIONS dc ON doc.doctor_id = dc.doctor_id
    INNER JOIN EPISODES e ON e.episode_id = dc.start_episode_id OR e.episode_id = dc.end_episode_id
        OR e.episode_id = doc.first_episode_id OR e.episode_id = doc.last_episode_id
    LEFT JOIN SEASONS s ON e.season_id = s.season_id
    LEFT JOIN WRITERS w ON e.writer_id = w.writer_id
    LEFT JOIN DIRECTORS d ON e.director_id = d.director_id
    LEFT JOIN DOCTOR_COMPANIONS dc2 ON e.episode_id = dc2.start_episode_id AND dc2.doctor_id = doc.doctor_id
    LEFT JOIN COMPANIONS c ON dc2.companion_id = c.companion_id
    LEFT JOIN ENEMY_EPISODES ee ON e.episode_id = ee.episode_id
    LEFT JOIN ENEMIES en ON ee.enemy_id = en.enemy_id
    WHERE doc.incarnation_number = doctor_incarnation
    GROUP BY e.episode_id, e.title, e.air_date, e.runtime_minutes, s.series_number, s.year, w.name, d.name
    ORDER BY e.air_date;
END $$
DELIMITER ;

-- STORED PROCEDURE: Update Enemy Threat Level
-- Updates the threat level of an enemy and returns the updated record
DELIMITER $$
CREATE PROCEDURE UpdateEnemyThreatLevel(
    IN enemy_id_param INT,
    IN new_threat_level INT
)
BEGIN
    -- Validate threat level
    IF new_threat_level < 1 OR new_threat_level > 10 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Threat level must be between 1 and 10';
    END IF;

    -- Update the threat level
    UPDATE ENEMIES
    SET threat_level = new_threat_level
    WHERE enemy_id = enemy_id_param;

    -- Return the updated record
    SELECT
        e.enemy_id,
        e.name,
        e.threat_level,
        s.name AS species_name,
        p.name AS home_planet
    FROM ENEMIES e
    LEFT JOIN SPECIES s ON e.species_id = s.species_id
    LEFT JOIN PLANETS p ON e.home_planet_id = p.planet_id
    WHERE e.enemy_id = enemy_id_param;
END $$
DELIMITER ;

